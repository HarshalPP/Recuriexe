const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const policySchema = new Schema({
  LeaveAllowed: { type: Number, default: null},
  earlyGoingAllowed: { type: Number, default: null},
  lateComingAllowed: { type: Number, default: null},

  // earlyGoingCountedTime: { type: Number, default: null},//min
  // lateComingCountedTime: { type: Number, default: null},//min
  // halfyDayDeductionTime: { type: Number, default: null},//min

  // halfDayPunchInTimeComing: { type: Number, default: null},//hour
  // halfDayPunchOutTimeGoing: { type: Number, default: null},//hour

  // halfDayPunchInTimeComing: { type: String, default: "" },
  // halfDayPunchOutTimeGoing: { type: String, default: "" },
  
  
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
},{
  timestamps:true
});



const policyModel = mongoose.model("policy", policySchema);

module.exports = policyModel;
