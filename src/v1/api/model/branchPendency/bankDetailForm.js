const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const bankStatementModel = new Schema({
    employeeId:             [{ type: ObjectId , default :null }],
    customerId:              { type: ObjectId , default :null , unique: true},
    approvalEmployeeId:       { type: ObjectId , default :null },
    bankStatementDocument:   { type: [String] , default : []},
    LD:                      { type: String , default :"" },
    bankName:                { type: String ,  default:"" },
    acHolderName:            { type: String , default :"" },
    accountNumber:           { type: String , default :"" },
    ifscCode:                { type: String , default :"" },
    branchName:              { type: String , default :"" },
    accountType:             { type: String , default :"" },
    statementFromDate:       { type: String , default :"" },
    statementToDate:         { type: String , default :"" },

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

const bankStatementDetail = mongoose.model('bankStatement', bankStatementModel);

module.exports = bankStatementDetail;
