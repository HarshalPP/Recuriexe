import mongoose from "mongoose";
const { Schema, model, Types: { ObjectId } } = mongoose;

const CriteriaScoreSchema = new Schema({
  criteria: { type: String, required: true },
  score: { type: Number, min: 0, max: 5, default: 0 },
}, { _id: false });

//telephony status and id
const resultSchema = new Schema(
  {
    unique_id: {
      type: String,
      default: "", // default to null if not provided
      trim: true,
    },
    status: {
      type: String,
      // enum: ["success", "failed", "no-answer"], // add/remove statuses as needed
      // required: true,
      default: "",
    }
  },
  { _id: false }            // don’t create a separate _id for this sub-doc
);

const interviewSchema = new Schema({
  organizationId: { type: ObjectId, ref: "Organization", required: true },
  interviewModel: { type: String, enum: ["AI", "HUMAN"], default: "HUMAN" },
  interviewType: { type: String, enum: ["Online", "Walk-In", "Call"], default: "Online" },
  candidateId: { type: ObjectId, ref: "jobApplyForm", required: true },
  interviewerId: { type: ObjectId, ref: "employee", default:null },
  interviewerName: { type: String, default: "" },
  AIInterviewId: { type: ObjectId, ref: "AIInterview", default: null },
  interviewfeedbackStatus :{ type: String, default: "" },
  roundName: { type: String, default: "" },
  description: { type: String, default: "" },
  roundNumber: { type: Number, default: 1 },
  durationMinutes: { type: Number, default: "" },
  scheduleDate: { type: Date, default: null },
  hrId : { type: ObjectId, ref: "employee", default:null },
  status: {
    type: String,
    enum: ["pending", "schedule","running","reSchedule", "cancel", "complete"],
    default: "pending"
  },
  scheduleLink: { type: String, default: "" },
  feedback: { type: String, default: "" },
  skillsFeedback: [CriteriaScoreSchema],
  callResult: {
    type: resultSchema,    
  },

}, { timestamps: true });

const InterviewDetail = model("interviewDetails", interviewSchema);

export default InterviewDetail
