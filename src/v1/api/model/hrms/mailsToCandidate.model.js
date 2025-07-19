const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const mailsToCandidatesSchema = new Schema(
  {
    jobApplyFormId: { type: ObjectId, ref: "jobApplyForms", default: null },
    recipient: { type: String, default: "" },
    subject: { type: String, default: "" },
    body: { type: String, default: "" },
    mailStatus: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const mailsToCandidatesModel = mongoose.model(
  "mailsToCandidates",
  mailsToCandidatesSchema
);

module.exports = mailsToCandidatesModel;
