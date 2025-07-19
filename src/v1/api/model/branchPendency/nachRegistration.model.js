const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const nachRegistrationKycModel = new Schema({
  employeeId:         [{ type: ObjectId , default :null }],
  customerId:              { type: ObjectId , default :null },
  approvalEmployeeId:       { type: ObjectId , default :null },

  nachRegistrationKycDocument : { type: [String], default : []},
    LD:                      { type: String , default :"" },
    // customerName:            { type: String , default :"" },
    nachRegistrationNoUMRN:  { type: String , default :"" },
    nachDoneDate:            { type: String , default :"" },

    remarkByBranchVendor:  { type: String , default :"" },
    remarkByApproval:        { type: String , default :"" },
    approvalDate :           { type: String , default :"" },
    completeDate:        { type: String , default :"" },
    status :             { type: String, enum: ["incomplete","complete","reject", "approve", "pending"], default: "pending" },
    fileStatus :  {type: String, enum:["active", "inactive"], default: "active"},
},
{
    timestamps: true,
  }
);

const nachRegistrationKyDetail = mongoose.model('nachRegistrationKyc', nachRegistrationKycModel);

module.exports = nachRegistrationKyDetail;
