const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const coApplicantkycModel = new Schema({
    employeeId:              { type: ObjectId , default :null },
    LD:                      { type: String , default :"" },
    customerName:            { type: String , default :"" },
    coApplicantNo:           { type: Number, default:1 },
    fullNameAadhaar:         { type: String, default:"" },
    aadharNo:                { type: Number , default :null },
    dateOfBirthAadhar:       { type: String , default :"" },
    gender:                  { type: String , default :"" },
    age:                     { type: Number , default :null },
    addressAsPerAadhar:      { type: String , default :"" },
    panCardNo:               { type: String , default :"" },
    fullNamePanCard:         { type: String, default:"" },
    dateOfBirthPan:          { type: String , default :"" },
    voterIdNo:               { type: String , default :"" },
    coAppFullNameAsPerVoterId: { type: String , default :"" },
    fatherNameAadhaar:       { type: String , default :"" },
    fatherNamePanCard:         { type: String , default :"" },

},
{
    timestamps: true,
  }
);

const coApplicantKycDetail = mongoose.model('coApplicantKyc', coApplicantkycModel);

module.exports = coApplicantKycDetail;
