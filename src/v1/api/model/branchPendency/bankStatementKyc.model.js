const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const bankStatementModel = new Schema({
    employeeId:             [{ type: ObjectId , default :null }],
    customerId:              { type: ObjectId , default :null,ref: "customerdetail"},
    approvalEmployeeId:       { type: ObjectId , default :null },
    bankStatementDocument:   { type: [String] , default : []},
    LD:                      { type: String , default :"" },
    // customerName:            { type: String , default :"" },
    // bankName:                { type: String ,  default:"" },
    // acHolderName:            { type: String , default :"" },
    // accountNumber:           { type: String , default :"" },
    // ifscCode:                { type: String , default :"" },
    // branchName:              { type: String , default :"" },
    // accountType:             { type: String , default :"" },
    // statementFromDate:       { type: String , default :"" },
    // statementToDate:         { type: String , default :"" },

    bankDetails:[{
    Type:                    { type: String , default :"" },
    bankName:                { type: String ,  default:"" },
    bankStatementPdf:        { type: [String] ,  default:"" },
    bankDetailsPdc:          { type: [String] ,  default:"" },
    bankDetailsBsv:          { type: [String] ,  default:"" },
    chequeDetail:            { type: [String] ,  default:"" },
    acHolderName:            { type: String , default :"" },
    accountNumber:           { type: String , default :"" },
    ifscCode:                { type: String , default :"" },
    branchName:              { type: String , default :"" },
    accountType:             { type: String , default :"" },
    statementFromDate:       { type: String , default :"" },
    statementToDate:         { type: String , default :"" },
    Remarks:                 { type: String , default :"" },
    E_Nach_Remarks:          {type :String , enum:["true","false"], default:"false"},
    mandate_start_date:      { type: String , default :"" },
    mandate_end_date:       { type: String , default :"" },
    uploadpdf:              { type: [String] , default :"" },
    e_Nachamount:           { type:String , default :"" },
    repaymentBank:          { type:Boolean , default : true },
    }],
    inventryDetails:        { type: [String] , default :[] },  
    Nachlink:                { type: String , default :"" },
    pasteNachlink:                { type: String , default :"" },
    Account_Aggregator_Link : {type:String ,  default:""},
    remarkByBranchVendor:  { type: String , default :"" },
    remarkByApproval:        { type: String , default :"" },
    approvalDate :           { type: String , default :"" },
    completeDate:        { type: String , default :"" },
    status :             { type: String, enum: ["incomplete","complete","reject", "approve", "pending"], default: "pending" },
    fileStatus :  {type: String, enum:["active", "inactive"], default: "active"},
    Allow_Permission: { type: Boolean, enum: [true, false], default: false },

},
{
    timestamps: true,
}
);

const bankStatementDetail = mongoose.model('bankStatementKyc', bankStatementModel);

module.exports = bankStatementDetail;
