import mongoose from "mongoose";

const postedContentSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    mediaUrls: { type: [String], default: [] },
    mediaFiles: [
      {
        filename: { type: String },
        path: { type: String },
        mimetype: { type: String },
        size: { type: Number },
      },
    ],
    platforms: {
      type: [String],
      enum: ["facebook_page", "instagram_business","instagram_basic"],
      required: true,
    },
    status: {
      type: String,
      enum: ["posted", "scheduled", "failed", "canceled", "draft"],
      default: "posted",
    },
    postedAt: { type: Date },
    scheduledTime: { type: Date },
    facebookPostId: { type: String },
    facebookPageId: { type: String },
    instagramUserId: { type: String },
    instagramMediaId: { type: String },
    facebookPageName: { type: String },
    instagramAccountName: { type: String }, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    postType: {
      type: String,
      enum: ["UGC", "promotion", "news", "update"],
      default: "UGC",
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SocialMediaContent", postedContentSchema);
