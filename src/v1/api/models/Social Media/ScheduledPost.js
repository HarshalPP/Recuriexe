import mongoose from "mongoose";

const scheduledPostSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ["facebook_page", "instagram_business"],
      required: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SocialMediaAccount",
      required: true,
    },
    facebookPageName: { type: String },
    instagramAccountName: { type: String },
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
    // scheduleTime: { type: Date, required: true },
    scheduleTimes: [Date],
    jobNames: [String],
    status: {
      type: String,
      enum: ["scheduled", "posted", "failed", "canceled"],
      default: "scheduled",
    },
    scheduleStatuses: [
      {
        time: { type: Date },
        status: { type: String, enum: ["pending", "posted", "failed"] },
      },
    ],
    // jobName: { type: String },
    resultId: { type: String },
    error: { type: String },
    postedAt: { type: Date },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SocialPostSchedule", scheduledPostSchema);
