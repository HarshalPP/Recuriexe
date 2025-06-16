// models/AIPostGenerationJob.js
import mongoose from 'mongoose';

const AIPostGenerationJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'jobPosts',
      required: true
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing'
    },
    post: {
      type: Object, // Contains postText, imageUrls, etc.
      default: {}
    },
    error: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model('AIPostGenerationJob', AIPostGenerationJobSchema);
