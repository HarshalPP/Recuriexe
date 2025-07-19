const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const statusSchema = new Schema({
  userId: { 
      type: ObjectId, 
      ref: 'chatProfileDetail', 
      required: true 
  },
  type: {
      type: String,
      enum: ['text', 'image', 'video', 'link'],
      required: true
  },
  content: {
      text: String,
      media: {
          url: String,
          thumbnailUrl: String,
          duration: Number
      },
      background: {
          color: String,
          gradient: String,
          image: String
      },
      font: {
          family: String,
          size: Number,
          color: String
      },
      link: {
          url: String,
          title: String,
          description: String,
          image: String
      }
  },
  caption: String,
  privacy: {
      visibility: { type: String, enum: ['public', 'contacts', 'close_friends', 'private'], default: 'contacts' },
      allowedViewers: [{ type: ObjectId, ref: 'chatProfileDetail' }],
      blockedViewers: [{ type: ObjectId, ref: 'chatProfileDetail' }]
  },
  interactions: {
      views: [{
          user: { type: ObjectId, ref: 'chatProfileDetail' },
          viewedAt: { type: Date, default: Date.now },
          duration: Number
      }],
      reactions: [{
          user: { type: ObjectId, ref: 'chatProfileDetail' },
          emoji: String,
          reactedAt: { type: Date, default: Date.now }
      }],
      replies: [{
          user: { type: ObjectId, ref: 'chatProfileDetail' },
          message: { type: ObjectId, ref: 'message' },
          repliedAt: { type: Date, default: Date.now }
      }]
  },
  expiresAt: {
      type: Date,
      default: function() {
          return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from creation
      }
  },
  isActive: { type: Boolean, default: true },
  analytics: {
      viewCount: { type: Number, default: 0 },
      uniqueViewers: { type: Number, default: 0 },
      avgViewDuration: Number,
      completionRate: Number
  }
}, { timestamps: true });

const statusModel = mongoose.model("storyStatus", statusSchema);

module.exports = statusModel;
