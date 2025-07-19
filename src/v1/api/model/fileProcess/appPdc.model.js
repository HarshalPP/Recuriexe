const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const appPdcModel = new Schema({
    employeeId:         { type: ObjectId , default :null },
    customerId:              { type: ObjectId , default :null },
    applicantPdcDocument:   { type: [String]},
    LD:                 { type: String , default :"" },
    customerName:       { type: String , default :"" },
    bankName:           { type: String, default:"" },
    acHolderName:       { type: String , default :"" },
    accountNumber:      { type: String , default :"" },
    ifscCode:           { type: String , default :"" },
    branchName:         { type: String , default :"" },
    accountType:        { type: String , default :"" },
    totalChequeCount:   { type: String , default :"" },
    chequeNo1:          { type: String , default :"" },
    chequeNo2:          { type: String, default  :"" },
    chequeNo3:          { type: String , default :"" },
    chequeNo4:          { type: String , default :"" },
    chequeNo5:          { type: String , default :"" },
    chequeNo6:          { type: String , default :"" },
    chequeNo7:          { type: String , default :"" },
    chequeNo8:          { type: String, default:"" },
    chequeNo9:          { type: String , default :"" },
    chequeNo10:         { type: String , default :"" },

    remarkByBranchVendor:  { type: String , default :"" },
    remarkByApproval:        { type: String , default :"" },
    approvalDate :           { type: String , default :"" },
    completeDate:        { type: String , default :"" },
    status :             { type: String, enum: ["incomplete","complete","reject", "approve", "pending"], default: "pending" }
},
{
    timestamps: true,
  }
);

const appPdcDetail = mongoose.model('appPdc', appPdcModel);

module.exports = appPdcDetail;
