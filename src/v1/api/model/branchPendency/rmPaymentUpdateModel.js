const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const rmPaymentUpdateSchema = new Schema({
        employeeId:            [{ type: ObjectId, default: null }],
        customerId:            { type: ObjectId, default: null },
        approvalEmployeeId:       { type: ObjectId , default :null },
        LD:                    { type: String, default: "" },
        rmPaymentDocument:     {type:[String]},
        contactNo:             { type: String, default: "" },        
        branchName:            { type: String, default: "" },       
        amountDeposited:       { type: Number, default: 0 },         
        utrReferenceNo:        { type: String, default: "" },        
        dateOfDeposition:      { type: Date, default: null },        
        depositedBy:           { type: String, default: "" },
        
        remarkByBranchVendor:  { type: String, default: "" },
        remarkByApproval:      { type: String, default: "" },
        approvalDate:          { type: String, default: "" },
        completeDate:          { type: String, default: "" },
        status:                { type: String, enum: ["incomplete", "complete", "reject", "approve", "pending"], default: "pending" },
        fileStatus :  {type: String, enum:["active", "inactive"], default: "active"},
       },       
    {
        timestamps: true,
    });
    

const rmPaymentUpdateModel = mongoose.model('rmPaymentUpdate', rmPaymentUpdateSchema);

module.exports = rmPaymentUpdateModel;
