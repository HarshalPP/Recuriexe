const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const dailyTargetSchema = new Schema(
  {
    employeeId: { type: ObjectId, ref: "employee", default: null },
    sales: {
      lead: { type: Number, default: 0 },
      login: { type: Number, default: 0 },
    },
    pd: {
      pdFile: { type: Number, default: 0 },
    },
    fileProcess: {
      file: { type: Number, default: 0 },
    },
    finalApproval: {
      sanction: { type: Number, default: 0 },
      disbursement: { type: Number, default: 0 },
    },
    collectionEmi: {
      visit: { type: Number, default: 0 },
      emiCollect: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const dailyTarget = mongoose.model("dailyTarget", dailyTargetSchema);

module.exports = dailyTarget;
