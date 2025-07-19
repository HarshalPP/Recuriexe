const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const jainamProfileSchema = new Schema({
    employeeId:                     { type: ObjectId, default: null },
    LD:                             { type: String, default: "" },
    customerName:                   { type: String, default: "" },
    partnerName:                    { type: String, default: "" },
    branchName:                     { type: String, default: "" },
    applicantJainamProfileNo:       { type: String, default: "" },
    coApplicantName:                { type: String, default: "" },
    coApplicantJainamProfileNo:     { type: String, default: "" },
    coApplicant2Name:               { type: String, default: "" },
    coApplicant2JainamProfileNo:    { type: String, default: "" },
    guarantorName:                  { type: String, default: "" },
    guarantorJainamProfileNo:       { type: String, default: "" },
    jainamLoanNumber:               { type: String, default: "" },
    caseDisbursedInJainam:          { type: String, default: "" }
},
{
    timestamps: true,
});

const JainamKycModel = mongoose.model('JainamEntryKyc', jainamProfileSchema);

module.exports = JainamKycModel;