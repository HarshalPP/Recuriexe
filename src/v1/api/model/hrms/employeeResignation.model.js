const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const employeeResignationModelSchema = new Schema(
  {
    employeeId: { type: ObjectId, ref: "employee" },
    appliedDate: { type: Date },
    lastWorkingDate: { type: Date },
    lastWorkingDateByManager: { type: Date },
    resignationReason: [{ type: String, default:"" }],
    comment: { type: String, default:"" },
    employeeSignature: { type: String, default: null },
    otherReason: { type: String, default: null },
    approvalByReportingManager: {
        type: String,
        enum: ["approved", "notApproved", "active"],
        default: "active",
    },
    resignationType: {
        type: String,
        enum: ["self", "onBehalf"],
    },
    adminApproval_id:{type:ObjectId , ref:"employee" , default:null},
    adminApproval_Status:{
      type:String,
      default:"pending"
    },
    admin_Remarks: { type: String, default:"" },


    HodApproval_id:{type:ObjectId , ref:"employee" , default:null},
    HodApproval_status:{
      type:String,
      default:"pending"
    },
    Hod_Remarks: { type: String, default:"" },



    accountApproval_id:{type:ObjectId , ref:'employee' , default:null},
    accountApproval_status:{
      type:String,
      default:"pending"
    },
    account_Remarks: { type: String, default:"" },


    reasonByReportingManager: { type: String, default:"" },
    reportingManagerId: { type: ObjectId, ref: "employee", default: null },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    }
  },

  { timestamps: true }
);




const employeeResignationModel = mongoose.model("employeeResignation", employeeResignationModelSchema);

module.exports = employeeResignationModel;
