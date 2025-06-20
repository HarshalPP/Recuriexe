// models/PostedContent.js
import mongoose from 'mongoose';

const PostedContentSchema = new mongoose.Schema(
  {
    orgIds: {
      type: [
        {
          orgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LinkedInOrganization',
            required: true
          }
        }
      ],
      _id: false // 👈 This disables automatic _id generation per array item
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'jobPosts',
      required: true
    },

    message: {
      type: String,
      required: false
    },

    imageUrls: [
      {
        type: String
      }
    ],

    mediaFiles: [
      {
        filename: String,
        path: String,
        mimetype: String,
        size: Number
      }
    ],

    postedAt: {
      type: Date,
      default: Date.now
    },

    linkedinPostId: {
      type: String,
      required: false
    },

    status: {
      type: String,
      enum: ['processing', 'ready', 'posted', 'failed', 'draft'],
      default: 'processing'
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    },

    position: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('PostedContent', PostedContentSchema);