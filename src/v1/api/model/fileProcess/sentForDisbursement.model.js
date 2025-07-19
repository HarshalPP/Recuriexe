const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sentForDisbursementSchema = new Schema(
  {
    employeeId:        { type: ObjectId, default: null },
    LD:                { type: String, required: true, unique: true }, // Loan ID, ensuring it's unique
    customerName:      { type: String, default: "" },
    fatherName:        { type: String, default: "" },
    contactNo:         { type: Number, default: null },
    branchName:        { type: String, default: "" },
    partnerName:       { type: String, default: "" },
    loanNumber:        { type: String, default: "" },
    loanAmount:        { type: Number, default: 0 },
    emiAmount:         { type: Number, default: 0 },
    roi:               { type: Number, default: 0 }, // Rate of Interest
    processingFees:    { type: Number, default: 0 },
    documentsCharges:  { type: Number, default: 0 },
    cersaiCharges:     { type: Number, default: 0 },
    preEmiInterest:    { type: Number, default: 0 },
    netDisbursementAmount: { type: Number, default: 0 },
  },
  { timestamps: true });

const sentForDisbursement= mongoose.model( 'sentForDisbursement',sentForDisbursementSchema);

module.exports = sentForDisbursement
