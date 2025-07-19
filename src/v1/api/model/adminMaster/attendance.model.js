const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const attendanceModelSchema = new Schema(
  {
    
    employeeId: { type: ObjectId, default: "" },
    date: { type: Date, default: "" },
    punchInTime: { type: String, default: "" },
    punchOutTime: { type: String, default: "" },
    workedHour: { type: String, default: "" },
    remark: { type: String, default: "" },
    locationPunchIn: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number] },
    },
    locationPunchOut: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number] },
    },
    approvedById: { type: String, ref: "employee", default: null },
    approvalStatus: {
      type: String,
      enum: ["approved", "notApproved", "new"],
      default: "new",
    },
    punchInFrom: {
      type: String,
      enum: ["branch", "outsideBranch","new"],
      default: "new",
    },

    emailSend:{
      type: String,
      default: "false",
    }
  },
  {
    timestamps: true,
  }
);

const attendanceModel = mongoose.model("attendance", attendanceModelSchema);

module.exports = attendanceModel;
