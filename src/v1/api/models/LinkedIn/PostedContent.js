// models/PostedContent.js
import mongoose from 'mongoose';
import { type } from 'os';

const PostedContentSchema = new mongoose.Schema(
  {
  orgIds: [{ // <-- Now an array
    orgId:
    { type: mongoose.Schema.Types.ObjectId,
      ref: 'LinkedInOrganization',
      required: true },
    }],
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'jobPosts',
      required: true
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
      path: String, // Only used if files were saved locally
      mimetype: String,
      size: Number
    }],
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
      enum: ['processing', 'ready', 'posted', 'failed','draft'],
      default: 'processing'
    },
    organizationId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization' 
    }, 
    position : String,
  },
  {
    timestamps: true
  }
);

export default mongoose.model('PostedContent', PostedContentSchema);