const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const attendanceChangeModelSchema = new Schema(
  {
    employeeId: { type: ObjectId, ref: "employee" },
    date: { type: Date, default: "" },
    approvalStatus: {
      type: String,
      enum: ["approved", "rejected", "pending"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const attendanceChangeModel = mongoose.model("attendanceChange", attendanceChangeModelSchema);

module.exports = attendanceChangeModel;
