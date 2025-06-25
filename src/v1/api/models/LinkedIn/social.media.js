// models/PostedContent.js
import mongoose from 'mongoose';

const PostContentSchema = new mongoose.Schema(
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
    message: {
      type: String,
      required: false
    },
    imageUrls: [{
      type: String
    }],
    mediaFiles: [{
      filename: String,
      path: String,
      mimetype: String,
      size: Number
    }],
    postedAt: {
      type: Date
    },
    linkedinPostId: {
      type: String,
      required: false
    },
    scheduleTime: {
      type: Date, // New field
      required: false
    },
    status: {
      type: String,
      enum: ['processing', 'ready', 'posted', 'failed', 'draft', 'scheduled'],
      default: 'draft'
    },
    organizationId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization' 
    }, 
    position: String,

  },
  {
    timestamps: true
  }
);

export const PostContent = mongoose.model('PostContent', PostContentSchema);