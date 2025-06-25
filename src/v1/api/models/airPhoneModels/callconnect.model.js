import mongoose from 'mongoose';

const callConnectSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['before', 'after'], // Distinguish the type of data
      required: true
    },
    mobile_number: {
      type: String // For 'before' type
    },
    virtual_number: {
      type: String // For 'before' type
    },
    caller: {
      type: String // For 'after' type
    },
    receiver: {
      type: String // For 'after' type
    },
    call_id: {
      type: String,
      required: true
    },
    receivedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('CallConnect', callConnectSchema);
