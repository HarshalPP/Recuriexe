const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const interviewerSchema = new Schema(
  {
    name: { type: String, default: "" },
    emailId: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const interviewer = mongoose.model("interviewer", interviewerSchema);

module.exports = interviewer;
