const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const interviewDetailsSchema = new Schema(
  {
    interviewDate: { type: Date },
    interviewTime: { type: String },
    mode: { type: String },
    interviewBy: { type: String, default: "" },
    location: { type: String, default: "" },
    googleLink: { type: String, default: "" },
    interviewerId: { type: ObjectId, ref: "employee" },
    reasonCancel: { type: String, default: "" },
    alternateInterviewerId: [
      {
        interviewerId: { type: ObjectId, ref: "employee" },
        name: { type: String, default: "" },
        reason: { type: String, default: "" }, // Reason connected to the ID
        _id: false, // Disable automatic _id creation
      },
    ],
    jobApplyFormId: { type: ObjectId, ref: "jobApplyForm" },
    availability: {
      type: String,
      enum: ["available", "notAvailable", "active"],
      default: "active",
    },
    interviewEventCreated: {
      type: String,
      enum: ["created", "notCreated"],
      default: "notCreated",
    },
    interviewStatus: {
      type: String,
      enum: ["active", "done","cancelled"],
      default: "active",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const interviewDetails = mongoose.model(
  "interviewDetails",
  interviewDetailsSchema
);

module.exports = interviewDetails;
