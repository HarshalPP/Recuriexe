const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const postDisbursementKycSchema = new Schema({
    employeeId:             { type: ObjectId, default: null },
    LD:                     { type: String, default: "" },
    customerName:           { type: String, default: "" },
    fatherName:             { type: String, default: "" },
    loanNumber:             { type: String, default: "" },
    actualPreEmi:           { type: Number, default: 0 },
    dateOfDisbursement:     { type: String, default: null },
    dateOfFirstEmi:         { type: String, default: null },
    utrNumber1:             { type: String, default: "" },
    utrNumber2:             { type: String, default: "" },
    disbursementDoneBy:     { type: String, default: "" },

}, {
    timestamps: true,
});

const postDisbursementKycModel = mongoose.model('postDisbursementKyc', postDisbursementKycSchema);

module.exports = postDisbursementKycModel;