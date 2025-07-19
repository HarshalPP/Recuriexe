const {
  success,
  unknownError,
  unauthorized,
  serverValidation,
  badRequest,
  notFound,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment");
// const OneSignal = require("onesignal-node");

const employeeModel = require("../../model/adminMaster/employe.model");
const conversationModel = require("../../model/chat/conversation.model");
const messageModel = require("../../model/chat/message.model");
const chatProfileModel = require("../../model/chat/chatProfileDetail.model");
const participantModel = require("../../model/chat/participant.model");
const {sendPushNotification} = require("../../controller/chat/notification.controller");

// ------------GROUP CREATE API--------------
async function createGroupApi(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation(res, {
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const { userId, groupName,groupPhoto, participantIds, description, groupSettings, oneSignalId } =
        req.body;
  
      // Validate creator exists
      const creator = await employeeModel.findById(userId);
  
      if (!creator) {
        return notFound(res, "Creator user not found");
      }
  
      // Make sure creator is included in participants
      const allParticipants = [...new Set([userId, ...participantIds])];
  
      // Create new group conversation
      const newGroupConversation = new conversationModel({
        type: "group",
        participants: allParticipants,
        groupInfo: {
          name: groupName,
          groupPhoto:groupPhoto,
          description: description || "",
          admins: [userId],
          owner: userId,
          settings: {
            ...groupSettings,
            visibility: groupSettings?.visibility || "private",
            joinApproval: groupSettings?.joinApproval || false,
            onlyAdminsCanPost: groupSettings?.onlyAdminsCanPost || false,
            onlyAdminsCanEditInfo: groupSettings?.onlyAdminsCanEditInfo || true,
            onlyAdminsCanAddMembers: groupSettings?.onlyAdminsCanAddMembers || false,
            messageRetention: groupSettings?.messageRetention || 0,
            allowGifs: groupSettings?.allowGifs !== false,
            allowStickers: groupSettings?.allowStickers !== false,
            allowFiles: groupSettings?.allowFiles !== false
          },
          moderators: [],
          maxMembers: groupSettings?.maxMembers || 5000
        },
        lastActivity: new Date(),
        analytics: {
          totalMessages: 0,
          lastMessageAt: new Date(),
          activeMembers: 0
        },
        isArchived: false,
        isPinned: false
      });
  
      await newGroupConversation.save();
  
      // Create participant records for all members
      const participantPromises = allParticipants.map((participantId) => {
        return new participantModel({
          conversationId: newGroupConversation._id,
          userId: participantId,
          role: participantId === userId ? "owner" : "member",
          invitedBy: userId,
          joinedAt: new Date(),
          state: {
            unreadCount: 0,
            lastRead: new Date() 
          }
        }).save();
      });
  
      await Promise.all(participantPromises);

      // Create a welcome message in the group
      const welcomeMessage = new messageModel({
        conversationId: newGroupConversation._id,
        senderId: userId,
        type: 'text',
        content: {
          text: `Group "${groupName}" created by ${creator.employeName || "Admin"}`
        },
        deliveredTo: allParticipants.map(participantId => ({
          user: participantId,
          deliveredAt: new Date()
        })),
        isSystemMessage: true
      });

      await welcomeMessage.save();

      // Update conversation with last message
      newGroupConversation.lastMessage = welcomeMessage._id;
      await newGroupConversation.save();
  
      // Get participants' except creator for notification
      const otherParticipants = allParticipants.filter((id) => 
        id.toString() !== userId.toString()
      );
  
      console.log(`Total participants: ${allParticipants.length}`);
      console.log(`Other participants (excluding creator): ${otherParticipants.length}`);
  
      if (otherParticipants.length > 0) {
        // Get creator name for notification
        const creatorName = creator.employeName || "Someone";
        
        try {
          // Get recipient players IDs for all participants except creator
          const recipients = await employeeModel.find({
            _id: { $in: otherParticipants }
          }).select('mobileNo');
          
          // Build notification message
          const notificationMessage = `${creatorName} added you to group "${groupName}"`;
          
          // In a real implementation, you would fetch the oneSignalIds for each user
          // For now, using oneSignalId from request (following your pattern)
          if (oneSignalId) {
            console.log("Found oneSignalId in request body:", oneSignalId);
            
            const recipientTokens = [oneSignalId];
            
            console.log("Sending notification with tokens:", recipientTokens.length);
            
            await sendPushNotification({
              recipientIds: recipientTokens,
              message: notificationMessage,
              data: {
                conversationId: newGroupConversation._id.toString(),
                messageId: welcomeMessage._id.toString(),
                creatorId: userId,
                groupName: groupName,
                type: "group_created",
              },
            });
            
            console.log("Group creation notification sent successfully");
          } else {
            console.log("No oneSignalId found in request body for notification");
          }
        } catch (notificationError) {
          console.error("Error sending group creation notification:", notificationError);
          // Continue with response - notification failure shouldn't fail the API
        }
      }
  
      return success(res, "Group chat created successfully", {
        conversation: newGroupConversation,
        welcomeMessage
      });
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }

// ------------GROUP CHAT API---------------------------------------
async function sendMessageToGroup(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation(res, {
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const { conversationId, userId, messageType = 'text', content, oneSignalId } = req.body;
  
      // Find the conversation
      const conversation = await conversationModel.findById(conversationId);
      if (!conversation) {
        return notFound(res, "Conversation not found");
      }
  
      // Check if user is a participant
      if (!conversation.participants.includes(userId) && 
          !conversation.participants.some(id => id.toString() === userId.toString())) {
        return unauthorized(res, "You are not a participant in this conversation");
      }
  
      // Check if only admins can post (for group conversations)
      if (
        conversation.type === "group" &&
        conversation.groupInfo?.settings?.onlyAdminsCanPost &&
        !conversation.groupInfo.admins.includes(userId) &&
        !conversation.groupInfo.admins.some(id => id.toString() === userId.toString())
      ) {
        return unauthorized(res, "Only admins can post messages in this group");
      }
  
      // Create and save new message
      const newMessage = new messageModel({
        conversationId,
        senderId: userId,
        type: messageType,
        content: messageType === 'text' ? { text: content.text } : content,
        createdAt: new Date()
      });
  
      await newMessage.save();
  
      // Update conversation's last activity
      conversation.lastActivity = new Date();
      conversation.lastMessage = newMessage._id;
      if (conversation.analytics) {
        conversation.analytics.totalMessages = (conversation.analytics.totalMessages || 0) + 1;
        conversation.analytics.lastMessageAt = new Date();
      }
      await conversation.save();
  
      // Get other participants for notification (except sender)
      const otherParticipants = conversation.participants.filter(
        (pid) => pid.toString() !== userId.toString()
      );
  
      // Get sender details for notification
      const sender = await employeeModel.findById(userId);
      const senderName = sender?.employeName || "";
      
      // Create notification message based on message type
      let notificationMessage = "";
      switch (messageType) {
        case 'text':
          notificationMessage = content.text 
            ? `${senderName}: ${content.text.substring(0, 100)}`
            : `${senderName} sent a message`;
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
          notificationMessage = `${senderName} sent a message`;
      }
      
      // Use oneSignalId from request body for notification
      const recipientPlayerId = req.body.oneSignalId;
      
      if (recipientPlayerId && otherParticipants.length > 0) {
        const recipientTokens = [recipientPlayerId];
        console.log("Sending group message notification with tokens:", recipientTokens.length);
        
        try {
          await sendPushNotification({
            recipientIds: recipientTokens,
            message: notificationMessage,
            data: {
              conversationId: conversation._id.toString(),
              messageId: newMessage._id.toString(),
              senderId: userId,
              groupName: conversation.groupInfo?.name || "",
              type: "group_message",
            }
          });
          
          console.log("Group message notification sent successfully");
        } catch (notificationError) {
          console.error("Error sending group message notification:", notificationError);
          // Continue with response - notification failure shouldn't fail the API
        }
      }
  
      return success(res, "Message sent successfully", {
        message: newMessage,
        conversation: conversation._id
      });
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }

  
// -------------MESSAGE RED OR UNREAD USER LIST---------------------------------
async function getMessageReadStatus(req, res) {
  try {
    const { messageId } = req.query;

    const message = await messageModel.findById(messageId).lean();
    if (!message) return notFOund(res, "Message not found");

    const { conversationId, readBy } = message;

    const participants = await participantModel.find({ conversationId, isActive: true }).lean();

    const readUserMap = {};
    (readBy || []).forEach(rb => {
      readUserMap[rb.userId.toString()] = rb.readAt;
    });

    const seenUserList = [];
    const unseenUserList = [];

    for (let p of participants) {
      const userIdStr = p.userId?.toString();
      if (!userIdStr) continue;

      const employee = await employeeModel.findById(p.userId).select('employeName workEmail employeePhoto').lean();

      if (employee) {
        if (readUserMap[userIdStr]) {
          seenUserList.push({
            ...employee,
            readAt: readUserMap[userIdStr]
          });
        } else {
          unseenUserList.push(employee);
        }
      }
    }

    return success(res, "Get List", {
      seenUserList,
      unseenUserList
    });

  } catch (error) {
    console.error(error);
    return unknownError(res, error.message);
  }
}




module.exports = {
  createGroupApi,
  sendMessageToGroup,
  getMessageReadStatus
  
};
