const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const sentForSanctionKycSchema = new Schema({
    employeeId:            { type: ObjectId, default: null },
    LD:                    { type: String, default: "" },
    customerName:          { type: String, default: "" },
    partnerName:           { type: String, default: "" },
    caseType:              { type: String, default: "" },
    branchName:            { type: String, default: "" },
    fatherName:            { type: String, default: "" },
    contactNo:             { type: Number, default: null },
    loanAmount:            { type: Number, default: 0 }, 
    loanAmountInWords:     { type: String, default: "" },
    principalAmount:       { type: Number, default: 0 }, 
    interestAmount:        { type: Number, default: 0 }, 
    totalAmount:           { type: Number, default: 0 }, 
    roi:                   { type: Number, default: 0 }, 
    tenure:                { type: Number, default: 0 },
    emiAmount:             { type: Number, default: 0 }, 
   
}, {
    timestamps: true,
});

const sentForSanctionKycModel = mongoose.model('sentForSanctionKyc', sentForSanctionKycSchema);

module.exports = sentForSanctionKycModel;
