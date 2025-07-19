const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SignKycModel = new Schema({
    employeeId:         { type: ObjectId , default :null },
    customerId:              { type: ObjectId , default :null },
    approvalEmployeeId:       { type: ObjectId , default :null },
    LD:                 { type: String , default :"" },
    ApplicantSignDocument:   { type: [String] , default : []},
    coApplicantSignDocument:   { type: [String] , default : []},
    guarantorSignDocument:   { type: [String] , default : []},
    remarkByBranchVendor:  { type: String , default :"" },
    remarkByApproval:        { type: String , default :"" },
    approvalDate :           { type: String , default :"" },
    completeDate:        { type: String , default :"" },
    status :             { type: String, enum: ["incomplete","complete","reject", "approve", "pending"], default: "pending" },
    fileStatus :  {type: String, enum:["active", "inactive"], default: "active"},
},{
    timestamps: true,
})

const SignKycDetails = mongoose.model('SignKycDetails', SignKycModel);
module.exports = SignKycDetails;