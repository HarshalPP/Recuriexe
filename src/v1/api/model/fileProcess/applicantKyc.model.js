const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const applicantkycModel = new Schema({
    employeeId:              { type: ObjectId , default :null },
    LD:                      { type: String , default :"" },
    fullNameAadhaar:         { type: String, default:"" },
    aadharNo:                { type: Number , default :null },
    fatherNameAadhaar:       { type: String , default :"" },
    dateOfBirthAadhar:       { type: String , default :"" },
    gender:                  { type: String , default :"" },
    age:                     { type: Number , default :null },
    addressAsPerAadhar:      { type: String , default :"" },
    panCardNo:               { type: String , default :"" },
    fullNamePanCard:         { type: String, default:"" },
    dateOfBirthPan:          { type: String , default :"" },
    fatherNamePanCard:         { type: String , default :"" },
    appFullNameAsPerVoterId: { type: String , default :"" },
    voterIdNo:               { type: String , default :"" },
    // status:               { type: String, enum: ['active', 'inactive'], default: 'active' },

},
{
    timestamps: true,
  }
);

const applicantKycDetail = mongoose.model('applicantKyc', applicantkycModel);

module.exports = applicantKycDetail;
