import mongoose from "mongoose";

const { Schema, model } = mongoose;

const interviewSchema = new Schema({
  jobApplyFormId: {
    type: Schema.Types.ObjectId,
    ref: "JobApplyForm",
    required: true,
  },
  interviewerId: {
    type: Schema.Types.ObjectId,
    ref: "employee",
    default:null
  },

  managerId:{
    type: Schema.Types.ObjectId,
    ref: "employee",
    default:null
  },


  interviewBy: {
    type: String,
    enum: ["hr", "manager"],
    required: true,
  },

  interviewer:{
    type:String,
    default:""
  },
  interviewDate: String,
  interviewTime: String,
  mode: {
    type: String,
    enum: ["online", "offline", "call"],
  },
  location: String,
  googleLink: String,
  availability: {
    type: String,
    default: "available",
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "rescheduled", "cancelled"],
    default: "scheduled",
  },
  interviewRound: {
    type: Number,
    default: 1,
  },

interviewEventCreated: String,


// Feedback //

feedbackBy:{ 
    type: String,
    enum: ["hr", "interviewer"],
    default: "interviewer",
  },

  interviewTaken:{ 
    type: String,
    enum: ["yes", "no", "notSelected"],
    default: "no",
  },

  furtherProcessProfile: {
    type: String,
    enum: ["yes", "no","active"],
    default: "active",

  },
  remark: { type: String, default: "" },
  candidateReview: { type: String, default: "" },
  skillReview: { type: String, default: "" },
  hireCandidate: { type: String, default: "pending" },
  note: { type: String, default: "" },


}, { timestamps: true });

const InterviewDetail = model("interviewDetails", interviewSchema);

export default InterviewDetail;
