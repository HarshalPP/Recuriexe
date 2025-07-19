const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;


const messageSchema = new Schema({
  conversationId: { 
      type: ObjectId, 
      ref: 'Conversation', 
      required: true,
      index: true
  },
  senderId: { 
      type: ObjectId, 
      ref: 'chatProfileDetail', 
      required: true,
      index: true
  },
  type: { 
      type: String, 
      enum: ['text', 'image', 'video', 'audio', 'file', 'location', 'contact', 'sticker', 'gif', 'poll', 'system', 'call', 'meeting'], 
      default: 'text' 
  },
  content: {
      text: String,
      richText: {
          mentions: [{
              user: { type: ObjectId, ref: 'employee' },
              startIndex: Number,
              length: Number
          }],
          formatting: [{
              type: { type: String, enum: ['bold', 'italic', 'code', 'link'] },
              startIndex: Number,
              length: Number,
              url: String
          }],
          channels: [{
              channel: { type: ObjectId, ref: 'Conversation' },
              startIndex: Number,
              length: Number
          }]
      },
      media: {
          url: String,
          thumbnailUrl: String,
          fileName: String,
          fileSize: Number,
          mimeType: String,
          dimensions: {
              width: Number,
              height: Number
          },
          duration: Number // For audio/video
      },
      location: {
          latitude: Number,
          longitude: Number,
          address: String,
          accuracy: Number
      },
      contact: {
          name: String,
          phoneNumbers: [String],
          emails: [String],
          organization: String
      },
      poll: {
          question: String,
          options: [{
              text: String,
              votes: [{ type: ObjectId, ref: 'employee' }]
          }],
          allowMultiple: { type: Boolean, default: false },
          expiresAt: Date
      },
      call: {
          type: { type: String, enum: ['audio', 'video'] },
          duration: Number,
          participants: [{ type: ObjectId, ref: 'employee' }]
      },
      meeting: {
          title: String,
          scheduledFor: Date,
          duration: Number,
          participants: [{ type: ObjectId, ref: 'chatProfileDetail' }],
          link: String
      }
  },
  // Message context
  replyTo: { type: ObjectId, ref: 'message' },
  forwardedFrom: {
      originalMessage: { type: ObjectId, ref: 'message' },
      originalSender: { type: ObjectId, ref: 'chatProfileDetail' },
      forwardCount: { type: Number, default: 1 }
  },
  // Interaction data
  reactions: [{
      userId: { type: ObjectId, ref: 'employee' },
      emoji: { type: String, default: "" },
      createdAt: { type: Date, default: Date.now }
  }],
  readBy: [{
      userId: { type: ObjectId, ref: 'employee' },
      readAt: { type: Date, default: Date.now }
  }],
  deliveredTo: [{
      userId: { type: ObjectId, ref: 'employee' },
      deliveredAt: { type: Date, default: Date.now }
  }],
  // Message state
  isEdited: { type: Boolean, default: false },
  editHistory: [{
      content: Schema.Types.Mixed,
      editedAt: Date
  }],
  isPinned: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  starredBy: [{ type: ObjectId, ref: 'employee' }],
  isDeleted: { type: Boolean, default: false },
  deletedFor: [{ type: ObjectId, ref: 'employee' }],
  // Threading
  thread: {
      hasThread: { type: Boolean, default: false },
      threadId: { type: ObjectId, ref: 'conversation' },
      replyCount: { type: Number, default: 0 },
      lastReply: { type: ObjectId, ref: 'message' },
      lastReplyAt: Date
  },
  // Security
  encryption: {
      isEncrypted: { type: Boolean, default: false },
      keyId: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

  const messageSchemaModel = mongoose.model("message", messageSchema);

  module.exports = messageSchemaModel;