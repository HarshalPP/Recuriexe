const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;


const chatProfileDetailSchema = new Schema({
  emplyeeId:{type:ObjectId, default:null},
  profile: {
      firstName: String,
      lastName: String,
      avatar: String,
      aboutMe: { type: String, default: 'Hey there! I am using Finexe.' },
      dateOfBirth: Date,
      gender: { type: String, enum: ['male', 'female', 'other'] },
  },
  preferences: {
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
      notifications: {
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
          desktop: { type: Boolean, default: true },
          sound: { type: String, default: 'default' },
          messagePreview: { type: Boolean, default: true }
      }
  },
  status: {
      online: { type: Boolean, default: false },
      lastSeen: { type: Date, default: Date.now },
      currentStatus: { 
          type: String, 
          enum: ['online', 'offline', 'away', 'busy', 'do_not_disturb'], 
          default: 'offline' 
      },
      customStatus: {
          text: String,
          emoji: String,
          expiresAt: Date
      }
  },
  devices: [{
      deviceId: String,
      deviceType: { type: String, enum: ['mobile', 'desktop', 'web'] },
      platform: { type: String, enum: ['android', 'ios', 'windows', 'macos', 'web'] },
      appVersion: String,
      fcmToken: String,
      isActive: { type: Boolean, default: true },
      lastActive: Date
  }],
  privacy: {
      lastSeen: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
      profilePhoto: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
      status: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
      about: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
      readReceipts: { type: Boolean, default: true },
      blockList: [{ type: ObjectId, ref: 'chatProfileDetail' }]
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

  const chatProfileDetailModel = mongoose.model("chatProfileDetail", chatProfileDetailSchema);

module.exports = chatProfileDetailModel;