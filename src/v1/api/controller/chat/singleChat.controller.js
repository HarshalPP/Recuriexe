const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound
  } = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment");
// const OneSignal = require("onesignal-node");

const employeeModel = require("../../model/adminMaster/employe.model")
const conversationModel = require("../../model/chat/conversation.model");
const messageModel = require("../../model/chat/message.model");
const chatProfileModel = require("../../model/chat/chatProfileDetail.model");
const participantModel = require("../../model/chat/participant.model");
const { sendPushNotification } = require("../../controller/chat/notification.controller");



// -------------------ONE TO ONE CHAT-------------------------
async function sendIndividualMessage(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
      const { 
        userId, 
        recipientId, 
        messageType = 'text', 
        content 
      } = req.body;
      
      // Validate users exist
      const [sender, recipient] = await Promise.all([
        employeeModel.findById(userId),
        employeeModel.findById(recipientId)
      ]);
      
      if (!sender || !recipient) {
         return notFound(res, "User not found");
      }
      
      // Find or create conversation
      let conversation = await conversationModel.findOne({
        type: 'individual',
        participants: { 
          $all: [new ObjectId(userId), new ObjectId(recipientId)],
          $size: userId === recipientId ? 1 : 2 // Handle self-messaging with size 1
        }
      });
      
      if (!conversation) {
        // Create new conversation if it doesn't exist
        conversation = new conversationModel({
          type: 'individual',
          participants: userId === recipientId ? [userId] : [userId, recipientId], // Add single user for self-messaging
          lastActivity: new Date()
        });
        
        await conversation.save();
        
        // Create participant records - for self-chat, create only one record
        if (userId === recipientId) {
          await new participantModel({
            conversationId: conversation._id,
            userId: userId,
            role: 'member'
          }).save();
        } else {
          await Promise.all([
            new participantModel({
              conversationId: conversation._id,
              userId: userId,
              role: 'member'
            }).save(),
            new participantModel({
              conversationId: conversation._id,
              userId: recipientId,
              role: 'member'
            }).save()
          ]);
        }
      }
      
      // Create new message
      const newMessage = new messageModel({
        conversationId: conversation._id,
        senderId: userId,
        type: messageType,
        content: messageType === 'text' ? { text: content.text } : content,
        // For self-messages, still add to deliveredTo array
        deliveredTo: [{
          userId: recipientId,
          deliveredAt: new Date()
        }]
      });
      
      await newMessage.save();
      
      // Update conversation with last message
      conversation.lastMessage = newMessage._id;
      conversation.lastActivity = new Date();
      conversation.analytics.totalMessages += 1;
      conversation.analytics.lastMessageAt = new Date();
      await conversation.save();
      
      // Only send notifications if not self-messaging
      if (userId !== recipientId) {
        const recipientDetails = await employeeModel.findById(recipientId);
        const recipientMobile = recipientDetails?.mobileNo;
        const recipientPlayerId = req.body.oneSignalId;

        const recipientTokens = recipientMobile
          ? [recipientPlayerId]  // send regardless of whether playerId is missing
          : [];
          
        // Get sender name for notification
        const senderName = sender.employeName
          ? `${sender.employeName}` || ''
          : sender.chatProfileDetailname;
          
        // Create notification message based on type
        let notificationMessage = "";
        switch (messageType) {
          case 'text':
            notificationMessage = content.text.substring(0, 100);
            break;
          case 'image':
            notificationMessage = content.caption || `${senderName} sent an image`;
            break;
          case 'video':
            notificationMessage = content.caption || `${senderName} sent a video`;
            break;
          case 'audio':
            notificationMessage = content.caption || `${senderName} sent an audio message`;
            break;
          case 'file':
            notificationMessage = content.caption || `${senderName} sent a file`;
            break;
          default:
            notificationMessage = `${senderName} sent you a message`;
        }
        
        // Send notification
        if (recipientTokens.length > 0) {
          try {
            await sendPushNotification({
              recipientIds: recipientTokens,
              message: notificationMessage,
              data: {
                conversationId: conversation._id.toString(),
                messageId: newMessage._id.toString(),
                senderId: userId,
                type: 'individual'
              }
            });
          } catch (notificationError) {
            console.error("Error sending notification:", notificationError);
            // Continue with response - notification failure shouldn't fail the API
          }
        }
      }
      
      return success(res, "Message sent successfully",
        {
          message: newMessage,
          conversation: conversation._id
        }
      );
      
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
  
// ---------------CHAT LIST BY USERID------------------------
async function getChatListByUserId(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation(res, {
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const { userId } = req.query;
  
      // Validate user exists
      const user = await employeeModel.findById(userId);
      if (!user) {
        return notFound(res, "User not found");
      }
  
      // Find all conversations (individual and group) where the user is a participant
      const conversations = await conversationModel.aggregate([
        {
          $match: {
            participants: new ObjectId(userId),
            // No type filter, to include both 'individual' and 'group'
          }
        },
        {
          $sort: { 
            lastActivity: -1 // Sort by most recent activity
          }
        },
        {
  $lookup: {
    from: 'messages',
    let: { conversationId: '$_id', userId: new ObjectId(userId) },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ['$conversationId', '$$conversationId'] },
              { $eq: ['$isDeleted', false] },
              {
                $not: {
                  $in: ['$$userId', { $ifNull: ['$deletedFor', []] }]
                }
              }
            ]
          }
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 1 }
    ],
    as: 'lastMessageDetails'
  }
},
        {
          $lookup: {
            from: 'employees',
            localField: 'participants',
            foreignField: '_id',
            as: 'participantDetails'
          }
        },
        {
          $lookup: {
            from: 'participants',
            let: { conversationId: '$_id', userId: new ObjectId(userId) },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$conversationId', '$$conversationId'] },
                      { $eq: ['$userId', '$$userId'] }
                    ]
                  }
                }
              }
            ],
            as: 'participantRecord'
          }
        },
        {
          $project: {
            _id: 1,
            type: 1,
            participants: 1,
            groupInfo: 1, // Include entire groupInfo object which contains name, description, etc.
            lastActivity: 1,
            createdAt: 1,
            updatedAt: 1,
            lastMessageDetails: { $arrayElemAt: ['$lastMessageDetails', 0] },
            participantDetails: 1,
            participantRecord: { $arrayElemAt: ['$participantRecord', 0] }
          }
        }
      ]);
  
      // Format conversation data for response
      const formattedConversations = await Promise.all(conversations.map(async (conversation) => {
        const isGroup = conversation.type === 'group';
        const isSelfChat = !isGroup && conversation.participants.length === 1 && 
                        conversation.participants[0].toString() === userId;
        
        // Determine recipient information based on conversation type
        let recipientInfo;
        
        if (isGroup) {
          // For group chats - use groupInfo.name for the group name
          recipientInfo = {
            _id: conversation._id,
            name: conversation.groupInfo?.name || '',
            groupPhoto: conversation.groupInfo?.groupPhoto || '',
            description: conversation.groupInfo?.description || '',
            avatar: conversation.groupInfo?.avatar || null,
            isGroup: true,
            isSelfChat: false,
            participants: conversation.participantDetails.map(p => ({
              _id: p._id,
              name: p.employeName || '',
              employeePhoto: p.employeePhoto || ''
            })),
            admins: conversation.groupInfo?.admins || [],
            owner: conversation.groupInfo?.owner
          };
        } else if (isSelfChat) {
          // For self-chat
          const selfParticipant = conversation.participantDetails.find(
            participant => participant._id.toString() === userId
          );
          
          recipientInfo = {
            _id: selfParticipant ? selfParticipant._id : null,
            name: `${selfParticipant ? selfParticipant.employeName : 'You'} (You)`,
            employeePhoto: selfParticipant ? selfParticipant.employeePhoto : '',
            isGroup: false,
            isSelfChat: true
          };
        } else {
          // For regular one-to-one chats
          const otherParticipant = conversation.participantDetails.find(
            participant => participant._id.toString() !== userId
          );
          
          recipientInfo = {
            _id: otherParticipant ? otherParticipant._id : null,
            name: otherParticipant ? otherParticipant.employeName : '',
            employeePhoto: otherParticipant ? otherParticipant.employeePhoto : '',
            isGroup: false,
            isSelfChat: false
          };
        }
  
        // Format last message
        let lastMessageInfo = null;
        if (conversation.lastMessageDetails) {
          const lastMessage = conversation.lastMessageDetails;
          
          // Check if message has been read by the user
          const isRead = lastMessage.readBy && lastMessage.readBy.some(
            read => read && read.userId && read.userId.toString() === userId
          );
  
          // Get sender details
          const sender = conversation.participantDetails.find(
            participant => participant._id.toString() === lastMessage.senderId.toString()
          );
 
          // Determine message preview based on type
          let messagePreview = '';
          if (lastMessage.type === 'text' && lastMessage.content && lastMessage.content.text) {
            messagePreview = lastMessage.content.text;
          } else if (lastMessage.type === 'image') {
            messagePreview = 'Photo';
          } else if (lastMessage.type === 'video') {
            messagePreview = 'Video';
          } else if (lastMessage.type === 'audio') {
            messagePreview = 'Audio message';
          } else if (lastMessage.type === 'file') {
            messagePreview = 'File';
          } else if (lastMessage.type === 'location') {
            messagePreview = 'Location';
          } else {
            messagePreview = 'New message';
          }
  
          // For group chats, include sender name in preview
          if (isGroup && sender) {
            messagePreview = `${sender.employeName}: ${messagePreview}`;
          }
  
          lastMessageInfo = {
            _id: lastMessage._id,
            content: messagePreview,
            type: lastMessage.type,
            timestamp: lastMessage.createdAt,
            isRead: isRead || false,
            sender: {
              _id: lastMessage.senderId,
              name: sender ? sender.employeName : '',
              employeePhoto: sender ? sender.employeePhoto : ''
            }
          };
        }
         const unreadCount = await messageModel.countDocuments({
  conversationId: conversation._id,
  senderId: { $ne: new ObjectId(userId) }, // Not sent by the current user
  isDeleted: false,
  deletedFor: { $ne: new ObjectId(userId) },
  $nor: [
    { readBy: { $elemMatch: { userId: new ObjectId(userId) } } }
  ]
});
  
        return {
          _id: conversation._id,
          type: conversation.type, // Include conversation type
          recipient: recipientInfo,
          lastMessage: lastMessageInfo,
          unreadCount:unreadCount || 0,
          updatedAt: conversation.lastActivity || conversation.updatedAt,
          createdAt: conversation.createdAt,
          isPinned: conversation.participantRecord && conversation.participantRecord.isPinned 
                     ? conversation.participantRecord.isPinned 
                     : false
        };
      }));
  
      return success(res, "Chat list retrieved successfully", formattedConversations);
    } catch (error) {
      console.log(error);
      return unknownError(res, error.message);
    }
  }


//----------------CHATTING MESSAGE LIST BY USERID WITH CONVERSATION ID---------
async function getChatMessages(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { conversationId, userId } = req.query;
    const { page = 1, limit = 30 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const user = await employeeModel.findById(userId);
    if (!user) return notFound(res, "User not found");

    const conversation = await conversationModel.findOne({
      _id: new ObjectId(conversationId),
      participants: new ObjectId(userId)
    }).lean();

    if (!conversation) {
      return notFound(res, "Conversation not found or you don't have access to it");
    }

    let conversationDetails = {
      _id: conversation._id,
      type: conversation.type,
      createdAt: conversation.createdAt
    };

    const recipientIds = conversation.participants.filter(
      _id => _id.toString() !== userId
    );

    const recipients = await employeeModel.find({ _id: { $in: recipientIds } })
      .select('_id employeName employeePhoto')
      .lean();

    conversationDetails.recipients = recipients.map(user => ({
      _id: user._id,
      name: user.employeName || '',
      employeePhoto: user.employeePhoto || ''
    }));

    if (conversation.type === 'group') {
      conversationDetails.group = {
        name: conversation.groupInfo?.name || '',
        groupPhoto: conversation.groupInfo?.groupPhoto || '',
        avatar: conversation.groupInfo?.avatar || '',
        participantCount: conversation.participants?.length || 0,
        isAdmin: conversation.groupInfo?.admins?.some(
          admin => admin.toString() === userId
        ) || false
      };
    }

    const messages = await messageModel.aggregate([
      {
        $match: {
          conversationId: new ObjectId(conversationId),
          deletedFor: { $ne: new ObjectId(userId) }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNumber },
      {
        $lookup: {
          from: 'employees',
          localField: 'senderId',
          foreignField: '_id',
          as: 'senderDetails'
        }
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'replyTo',
          foreignField: '_id',
          as: 'replyDetails'
        }
      },
      {
        $project: {
          _id: 1,
          conversationId: 1,
          senderId: 1,
          type: 1,
          content: 1,
          replyTo: 1,
          replyDetails: { $arrayElemAt: ['$replyDetails', 0] },
          readBy: 1,
          reactions: 1,
          isEdited: 1,
          isDeleted:1,
          editHistory: 1,
          createdAt: 1,
          updatedAt: 1,
          senderDetails: { $arrayElemAt: ['$senderDetails', 0] }
        }
      }
    ]);

    const totalMessages = await messageModel.countDocuments({
      conversationId: new ObjectId(conversationId),
      deletedFor: { $ne: new ObjectId(userId) }
    });

    const formattedMessages = messages.map(message => {
      const isMine = message.senderId.toString() === userId;
      const receiverId = recipientIds.length === 1 ? recipientIds[0].toString() : null;

      const isRead = isMine
        ? message.readBy?.some(read => read?.userId?.toString() === receiverId) || false
        : message.readBy?.some(read => read?.userId?.toString() === userId) || false;

      let formattedContent = {};
      switch (message.type) {
        case 'text':
          formattedContent = {
            text: message.content?.text || '',
            richText: message.content?.richText || null
          };
          break;
        case 'image':
        case 'video':
        case 'audio':
        case 'file':
          formattedContent = {
            media: message.content?.media || {},
            caption: message.content?.text || ''
          };
          break;
        case 'location':
          formattedContent = {
            location: message.content?.location || {}
          };
          break;
        default:
          formattedContent = message.content || {};
      }

      let replyInfo = null;
      if (message.replyTo && message.replyDetails) {
        const replyMessage = message.replyDetails;
        let replyPreview = '';

        if (replyMessage.type === 'text') {
          replyPreview = replyMessage.content?.text?.substring(0, 50) +
            (replyMessage.content?.text?.length > 50 ? '...' : '');
        } else if (replyMessage.type === 'image') replyPreview = 'Photo';
        else if (replyMessage.type === 'video') replyPreview = 'Video';
        else if (replyMessage.type === 'audio') replyPreview = 'Audio message';
        else if (replyMessage.type === 'file') replyPreview = 'File';
        else replyPreview = 'Message';

        replyInfo = {
          _id: replyMessage._id,
          preview: replyPreview,
          type: replyMessage.type,
          sender: replyMessage.sender
        };
      }

      return {
        _id: message._id,
        conversationId: message.conversationId,
        sender: {
          _id: message.senderId,
          name: message.senderDetails?.employeName || '',
          employeePhoto: message.senderDetails?.employeePhoto || ''
        },
        receiver: receiverId || null,
        isMine,
        type: message.type,
        content: formattedContent,
        reactions: message.reactions || [],
        isRead,
        isDeleted:message.isDeleted,
        isEdited: message.isEdited || false,
        replyTo: replyInfo,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      };
    });

    // Mark messages as read
    try {
      await participantModel.findOneAndUpdate(
        {
          conversationId: new ObjectId(conversationId),
          userId: new ObjectId(userId)
        },
        {
          $set: {
            'state.unreadCount': 0,
            'state.lastReadMessage': messages.length > 0 ? messages[0]._id : null,
            'state.lastReadAt': new Date(),
            lastActivityAt: new Date()
          }
        },
        { upsert: true }
      );
    } catch (err) {
      console.log('Error updating participant state:', err);
    }

    try {
      const messageIds = messages.map(m => m._id);
      if (messageIds.length > 0) {
        await messageModel.updateMany(
          {
            _id: { $in: messageIds },
            'readBy.userId': { $ne: new ObjectId(userId) },
            senderId: { $ne: new ObjectId(userId) }
          },
          {
            $addToSet: {
              readBy: {
                userId: new ObjectId(userId),
                readAt: new Date()
              }
            }
          }
        );
      }
    } catch (err) {
      console.log('Error marking read:', err);
    }

    return success(res, "Chat messages retrieved successfully", {
      messages: formattedMessages.reverse(),
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limitNumber)
      },
      conversationDetails
    });
  } catch (error) {
    console.log(error);
    return unknownError(res, error.message);
  }
}

  
//----------------EMOJI UPDATE ON MESSAGE----------------------------------
async function emojiUpdateByMessageId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { messageId, userId, emoji } = req.body;

    if (!messageId || !userId || !emoji) {
      return badRequest(res, "messageId, userId and emoji are required.");
    }

    const message = await messageModel.findById(messageId);
    if (!message) {
      return notFound(res, "Message not found.");
    }

    // Find existing reaction from this user
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId
    );

    if (existingReactionIndex !== -1) {
      // Update the emoji if user has already reacted
      message.reactions[existingReactionIndex].emoji = emoji;
      message.reactions[existingReactionIndex].createdAt = new Date();
    } else {
      // Add new reaction
      message.reactions.push({
        userId,
        emoji,
        createdAt: new Date(),
      });
    }

    await message.save();

    // Send notification if reacting to someone else's message
    if (message.senderId.toString() !== userId) {
      const recipient = await employeeModel.findById(message.senderId);
      const sender = await employeeModel.findById(userId);

      const recipientPlayerId = req.body.oneSignalId;
      const recipientMobile = recipient?.mobileNo;

      const recipientTokens = recipientMobile ? [recipientPlayerId] : [];

      const senderName =
        sender?.employeName || "";

      const notificationMessage = `${senderName} reacted to your message with ${emoji}`;

      if (recipientTokens.length > 0) {
        try {
          await sendPushNotification({
            recipientIds: recipientTokens,
            message: notificationMessage,
            data: {
              conversationId: message.conversationId.toString(),
              messageId: message._id.toString(),
              senderId: userId,
            },
          });
        } catch (notificationError) {
          console.error("Error sending reaction notification:", notificationError);
        }
      }
    }

    return success(res, "Reaction updated successfully.", message);
  } catch (error) {
    console.log(error);
    return unknownError(res, error.message);
  }
}


//---------------DELETE MESSAGE FROM MY SIDE SINGLE OR MULTIPLE MESSAGE-----------
async function deleteMessagesForMe(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { messageIds, userId } = req.body;
    
    // Handle both single message ID or array of message IDs
    const messageIdArray = Array.isArray(messageIds) ? messageIds : [messageIds];
    
    if (messageIdArray.length === 0) {
      return badRequest(res, "Please provide valid message ID(s)");
    }

    // Validate user exists
    const user = await employeeModel.findById(userId);
    if (!user) return notFound(res, "User not found");

    // Get the messages
    const messages = await messageModel.find({
      _id: { $in: messageIdArray.map(id => new ObjectId(id)) }
    });

    if (messages.length === 0) {
      return notFound(res, "No messages found");
    }

    // Get all unique conversation IDs
    const conversationIds = [...new Set(messages.map(m => m.conversationId.toString()))];
    
    // Verify user has access to all these conversations
    const accessibleConversations = await conversationModel.find({
      _id: { $in: conversationIds.map(id => new ObjectId(id)) },
      participants: new ObjectId(userId)
    });

    const accessibleConversationIds = accessibleConversations.map(c => c._id.toString());
    
    // Filter messages to only those in accessible conversations
    const accessibleMessages = messages.filter(message => 
      accessibleConversationIds.includes(message.conversationId.toString())
    );
    
    if (accessibleMessages.length === 0) {
      return unauthorized(res, "You don't have access to these messages");
    }

    // Get IDs of accessible messages
    const accessibleMessageIds = accessibleMessages.map(m => m._id);
    
    // Add user to deletedFor array for all accessible messages
    const result = await messageModel.updateMany(
      { _id: { $in: accessibleMessageIds } },
      { $addToSet: { deletedFor: new ObjectId(userId) } }
    );

    return success(res, `${result.modifiedCount} message(s) deleted for you`);
  } catch (error) {
    console.log(error);
    return unknownError(res, error.message);
  }
} 
  
//--------------DELETE MESSAGE FROM BOTH SIDE------------------------------------
async function deleteMyMessagesForBothSide(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { messageIds, userId } = req.body;

    const messageIdArray = Array.isArray(messageIds) ? messageIds : [messageIds];

    if (messageIdArray.length === 0) {
      return badRequest(res, "Please provide valid message ID(s)");
    }

    const user = await employeeModel.findById(userId);
    if (!user) return notFound(res, "User not found");

    const messages = await messageModel.find({
      _id: { $in: messageIdArray.map((id) => new ObjectId(id)) }
    });

    if (messages.length === 0) {
      return notFound(res, "No messages found");
    }

    const userOwnMessages = messages.filter(
      (message) => message.senderId.toString() === userId
    );

    if (userOwnMessages.length === 0) {
      return badRequest(res, "None of these messages were sent by you");
    }

    const TIME_LIMIT_HOURS = 48;
    const now = new Date().getTime();

    // Only allow deletion of messages that are not already deleted and within time limit
    const deletableMessages = userOwnMessages.filter((message) => {
      const createdAt = new Date(message.createdAt).getTime();
      const timeDiff = (now - createdAt) / (1000 * 60 * 60);
      return !message.isDeleted && timeDiff <= TIME_LIMIT_HOURS;
    });

    const tooOldOrAlreadyDeletedCount = userOwnMessages.length - deletableMessages.length;

    if (deletableMessages.length === 0) {
      return badRequest(
        res,
        `Message(s) are too old or already deleted (limit: ${TIME_LIMIT_HOURS} hours)`
      );
    }

    const deletableMessageIds = deletableMessages.map((m) => m._id);

    const updateResult = await messageModel.updateMany(
      { _id: { $in: deletableMessageIds } },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: new ObjectId(userId),
        },
      }
    );

    // ✅ No system message creation here

    return success(res, "Messages deleted", {
      deletedForEveryone: updateResult.modifiedCount,
      tooOldOrAlreadyDeleted: tooOldOrAlreadyDeletedCount,
      conversationsAffected: [
        ...new Set(deletableMessages.map((m) => m.conversationId.toString())),
      ].length,
    });
  } catch (error) {
    console.error(error);
    return unknownError(res, error.message);
  }
}






module.exports = {
    sendIndividualMessage,
    getChatListByUserId,
    getChatMessages,
    emojiUpdateByMessageId,
    deleteMessagesForMe,
    deleteMyMessagesForBothSide,
    
}