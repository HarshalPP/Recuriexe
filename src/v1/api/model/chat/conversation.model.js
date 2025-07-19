const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;


const conversationSchema = new Schema({
  type: { 
      type: String, 
      enum: ['individual', 'group', 'channel', 'thread'], 
      required: true 
  },
  participants: [{ 
      type: ObjectId, 
      ref: 'employee',
      required: true
  }],
  // Group/Channel specific fields
  groupInfo: {
      name: {type:String, default:""},
      groupPhoto: {type:String, default:""},
      description: {type:String, default:""},
      avatar: {type:String, default:""},
      admins: [{ type: ObjectId, ref: 'employee' }],
      moderators: [{ type: ObjectId, ref: 'employee' }],
      owner: { type: ObjectId, ref: 'employee' },
      settings: {
          visibility: { type: String, enum: ['public', 'private'], default: 'private' },
          joinApproval: { type: Boolean, default: false },
          onlyAdminsCanPost: { type: Boolean, default: false },
          onlyAdminsCanEditInfo: { type: Boolean, default: true },
          onlyAdminsCanAddMembers: { type: Boolean, default: false },
          messageRetention: { type: Number, default: 0 }, // 0 = forever
          allowGifs: { type: Boolean, default: true },
          allowStickers: { type: Boolean, default: true },
          allowFiles: { type: Boolean, default: true }
      },
      inviteLink: String,
      maxMembers: { type: Number, default: 5000 }
  },
  // Thread specific fields
  threadInfo: {
      parentMessage: { type: ObjectId, ref: 'message' },
      parentConversation: { type: ObjectId, ref: 'conversation' }
  },
  lastMessage: {
      type: ObjectId,
      ref: 'message'
  },
  lastActivity: { type: Date, default: Date.now },
  analytics: {
      totalMessages: { type: Number, default: 0 },
      activeMembers: { type: Number, default: 0 },
      lastMessageAt: Date
  },
  isArchived: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });


  const conversationModel = mongoose.model("conversation", conversationSchema);

  module.exports = conversationModel;