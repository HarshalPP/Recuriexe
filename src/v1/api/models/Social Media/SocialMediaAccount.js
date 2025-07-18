// models/SocialMediaAccount.js
import mongoose from "mongoose";

const socialMediaAccountSchema = new mongoose.Schema(
  {
    // Common fields
    provider: {
      type: String,
      enum: ["facebook_page", "instagram_business", "instagram_basic"],
      required: true,
    },
    userId: { type: String }, // FB or IG user ID
    accessToken: { type: String, required: false },
    refreshToken: { type: String },
    expiresAt: { type: Date },
    lastRefreshedAt: Date,

    // Instagram Business specific
    igAccountId: { type: String },
    instagramUsername: { type: String },
    mediaCount: { type: Number },
    accountType: { type: String }, // personal / business

    // Facebook Page specific
    facebookPageId: { type: String },
    facebookPageName: { type: String },
    facebookPageAccessToken: { type: String },

    // Optional profile info
    fullName: { type: String },
    profilePicture: { type: String },
    username: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("SocialMediaAccount", socialMediaAccountSchema);
