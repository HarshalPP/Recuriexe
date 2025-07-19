const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const bankStatementModel = new Schema({
    employeeId:             [{ type: ObjectId , default :null }],
    customerId:              { type: ObjectId , default :null },
    approvalEmployeeId:      { type: ObjectId , default :null },
    LD:                      { type: String , default :"" },
    typekeys:                { type: [String] , default :"" },//coApplicant,guarantor
//new
    bankDetails:[{
    Type:                    { type: String , default :"" },//coApplicant,guarantor
    bankName:                { type: String ,  default:"" },
    acHolderName:            { type: String , default :"" },
    accountNumber:           { type: String , default :"" },
    ifscCode:                { type: String , default :"" },
    branchName:              { type: String , default :"" },
    accountType:             { type: String , default :"" },
    chequeDetail:            { type: [String] , default :[] },
    bankStatementDocument:   { type: [String] , default : []},
    bankDetailsPdc :         { type: [String] , default :[] },
    bankDetailsBSV :         { type: [String] , default :[] },
    }],

    guarantorDetails:[{
        Type: { type: String , default :"" },
        bankName: { type: String , default:"" },
        acHolderName: { type: String , default :"" },
        accountNumber: { type: String , default :"" },
        ifscCode: { type: String , default :"" },
        branchName: { type: String , default :"" },
        accountType: { type: String , default :"" },
        }],
     gtrInventryDetails: { type: [String] , default :[] },    
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

const guarantorStatementDetails = mongoose.model('gurranterBankDetails', bankStatementModel);

module.exports = guarantorStatementDetails;
