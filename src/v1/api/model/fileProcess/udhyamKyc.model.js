const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const udhyamKycModel = new Schema({
    employeeId:              { type: ObjectId , default :null },
    LD:                      { type: String , default :"" },
    customerName:            { type: String , default :"" },
    udhyamRegistrationNo:    { type: String, default:"" },
    dateOfUdhyamRegistration:{ type: String, default:"" },
    nameOfUnit:              { type: String , default :"" },
    typeOfEnterprises:       { type: String , default :"" },
    typeOfOrganisation:      { type: String , default :"" },
    ownerName:               { type: String , default :"" },
    dateOfIncorporation:     { type: String , default :"" },
    addressOfEnterprises:    { type: String , default :"" },
},
{
    timestamps: true,
  }
);

const udhyamKycDetail = mongoose.model('udhyamKyc', udhyamKycModel);

module.exports = udhyamKycDetail;
