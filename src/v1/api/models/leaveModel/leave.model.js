import mongoose from "mongoose";

const { Schema } = mongoose;

const employeeLeaveModelSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "employee" },
    startDate: { type: Date },
    endDate: { type: Date },
    reasonForLeave: { type: String, default: "" },
    leaveType: { type: Schema.Types.ObjectId, ref: "LeaveType" },
    title: { type: String, default: "" },
    approvalByReportingManager: {
      type: String,
      enum: ["yes", "no", "active"],
      default: "active",
    },
    reasonByReportingManager: { type: String, default: "" },
    reportingManagerId: {
      type: Schema.Types.ObjectId,
      ref: "employee",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const EmployeeLeave = mongoose.model("employeeLeave", employeeLeaveModelSchema);

export default EmployeeLeave;
