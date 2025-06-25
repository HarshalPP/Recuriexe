import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema({
  unique_id: { type: String, default: "" },
  caller_id: { type: String, default: "" },
  received_id: { type: String, default: "" },
  ivr_number: { type: String, default: "" },
  recording_url: { type: String, default: "" },
  Rec_duration: { type: String, default: "00:00:00" },
  call_type: {
    type: String,
    // enum: ["Incoming", "Outgoing", ""],
    default: ""
  },
  call_status: {
    type: String,
    // enum: ["Answered", "Call Missed", "No Answer", "Off Hour", ""],
    default: ""
  },
  datetime: { type: String, default: "" },
  duration: { type: String, default: "00:00:00" }
}, { timestamps: true });

export default mongoose.model("CallLog", callLogSchema);
