// models/apiUsageLog.model.js
import mongoose from "mongoose";

const apiUsageLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  apiId: {
    type: Number,
    required: true,
  },

  apiName: {
    type: String,
    required: false,
  },
  count: {
    type: Number,
    default: 1,
  },

  limit: {
    type: Number, // Can be overridden per user
  },

  lastAccessed: {
    type: Date,
    default: Date.now,
  },

  status:{
    type:String,
    default:"active"
  }
}, {
  timestamps: true,
  versionKey: false
});

export default mongoose.model("ApiUsageLog", apiUsageLogSchema);