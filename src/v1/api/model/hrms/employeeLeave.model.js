const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const employeeLeaveModelSchema = new Schema(
  {
    employeeId: { type: ObjectId, ref: "employee" },
    startDate: { type: Date },
    endDate: { type: Date },
    reasonForLeave: { type: String, default:"" },
    leaveType:{ type: ObjectId, ref: "leaveType" },
    title: { type: String, default:"" },
    approvalByReportingManager: {
        type: String,
        enum: ["yes", "no", "active"],
        default: "active",
    },
    reasonByReportingManager: { type: String, default:"" },
    reportingManagerId: { type: ObjectId, ref: "employee", default: null },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const employeeLeaveModel = mongoose.model("employeeLeave", employeeLeaveModelSchema);

module.exports = employeeLeaveModel;
