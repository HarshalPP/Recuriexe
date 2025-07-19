const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;


const participantSchema = new Schema({
    conversationId: {
      type: ObjectId,
      ref: 'conversation',
      required: true
  },
  userId: {
      type: ObjectId,
      ref: 'employee',
      required: true
  },
  role: {
      type: String,
      enum: ['owner', 'admin', 'moderator', 'member'],
      default: 'member'
  },
  permissions: {
      canSendMessages: { type: Boolean, default: true },
      canEditGroupInfo: { type: Boolean, default: false },
      canAddMembers: { type: Boolean, default: false },
      canRemoveMembers: { type: Boolean, default: false },
      canManageRoles: { type: Boolean, default: false }
  },
  state: {
      unreadCount: { type: Number, default: 0 },
      lastReadMessage: { type: ObjectId, ref: 'message' },
      lastReadAt: Date,
      typingStatus: {
          isTyping: { type: Boolean, default: false },
          lastTypingAt: Date
      }
  },
  preferences: {
      notifications: {
          enabled: { type: Boolean, default: true },
          mentions: { type: Boolean, default: true },
          allMessages: { type: Boolean, default: true },
          muteUntil: Date
      },
      customName: String,
      theme: String,
      customRingtone: String
  },
  joinedAt: { type: Date, default: Date.now },
  leftAt: Date,
  lastActivityAt: { type: Date, default: Date.now },
  invitedBy: { type: ObjectId, ref: 'employee' },
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false }
}, { timestamps: true });

  const participantModel = mongoose.model("participant", participantSchema);

  module.exports = participantModel;