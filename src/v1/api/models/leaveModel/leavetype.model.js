import mongoose from "mongoose";

const { Schema } = mongoose;

const leaveTypeModelSchema = new Schema(
  {
    leaveTypeName: { type: String, required: true },
    code:{type:String , required:false},
    Description:{type:String},
    Valid_from:{type:Date , default:null},
    ExpiresOn:{type:Date ,  default:null},
    maxDaysAllowed: { type: Number, required: false },
    carryForwardAllowed: { type: Boolean, default: false },
    status:{type:String ,  default:"active"}
  },
  { timestamps: true }
);

const LeaveType = mongoose.model("LeaveType", leaveTypeModelSchema);

export default LeaveType;
