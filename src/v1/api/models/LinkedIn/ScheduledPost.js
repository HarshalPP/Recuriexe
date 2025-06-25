// models/ScheduledPost.js
import mongoose from "mongoose";

const scheduledPostSchema = new mongoose.Schema(
  {
    orgIds: {
      type: [
        {
          orgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LinkedInOrganization",
            required: true,
          },
        },
      ],
      _id: false, // 👈 This disables automatic _id generation per array item
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "jobPosts",
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    imageUrls: [
      {
        type: String,
      },
    ],
    imageFiles: [
      {
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
      },
    ],
    scheduleTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "posted", "cancelled", "failed"],
      default: "scheduled",
    },
    linkedinPostId: {
      type: String,
      default: null,
    },
    jobName: {
      type: String,
      unique: true,
      required: true,
    },
    error: {
      type: String,
      default: null,
    },
    postedAt: {
      type: Date,
      default: null,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },  
    postType: {
      type: String,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ScheduledPost", scheduledPostSchema);
