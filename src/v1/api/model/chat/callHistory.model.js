const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;


const callHistorySchema = new Schema({
  callType: {
      type: String,
      enum: ['audio', 'video', 'screen_share', 'conference'],
      required: true
  },
  initiator: {
      type: ObjectId,
      ref: 'chatProfileDetail',
      required: true
  },
  participants: [{
      chatProfileDetail: { type: ObjectId, ref: 'chatProfileDetail' },
      joinedAt: Date,
      leftAt: Date,
      status: { type: String, enum: ['joined', 'declined', 'missed', 'left'] }
  }],
  conversation: {
      type: ObjectId,
      ref: 'conversation'
  },
  callDetails: {
      startTime: { type: Date, default: Date.now },
      endTime: Date,
      duration: Number, // in seconds
      totalParticipants: Number,
      maxConcurrentParticipants: Number,
      quality: {
          average: Number,
          breakdown: [{
              participant: { type: ObjectId, ref: 'chatProfileDetail' },
              score: Number,
              issues: [String]
          }]
      },
      recording: {
          isRecorded: { type: Boolean, default: false },
          recordingUrl: String,
          recordingDuration: Number,
          recordedBy: { type: ObjectId, ref: 'chatProfileDetail' }
      }
  },
  status: {
      type: String,
      enum: ['initiated', 'ringing', 'ongoing', 'missed', 'declined', 'completed', 'failed'],
      default: 'initiated'
  },
  errorInfo: {
      errorCode: String,
      errorMessage: String
  },
  analytics: {
      networkQuality: String,
      bandwidthUsed: Number,
      dropCount: Number
  }
}, { timestamps: true });

  const callHistorySchemaModel = mongoose.model("callHistory", callHistorySchema);

  module.exports = callHistorySchemaModel;