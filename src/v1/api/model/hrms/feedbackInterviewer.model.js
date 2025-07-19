const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const feedbackInterviewerSchema = new Schema(
  {
    jobApplyFormId: { type: ObjectId, ref: "jobApplyForm" },
    feedbackBy:{ 
      type: String,
      enum: ["HR", "interviewer",],
      default: "interviewer",
    },
    interviewerId: { type: ObjectId, ref: "employee" }, //employe id who took interview 
    interviewTaken:{ 
      type: String,
      enum: ["yes", "no", "notSelected"],
      default: "notSelected",
    },
    furtherProcessProfile: {
      type: String,
      enum: ["yes", "no","active"],
      default: "active",

    },
    remark: { type: String, default: "" },
    candidateReview: { type: String, default: "" },
    skillReview: { type: String, default: "" },
    hireCandidate: { type: String, default: "" },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const feedbackInterviewer = mongoose.model(
  "feedbackInterviewer",
  feedbackInterviewerSchema
);

module.exports = feedbackInterviewer;
