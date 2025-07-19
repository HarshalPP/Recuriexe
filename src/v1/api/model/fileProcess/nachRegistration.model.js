const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const nachRegistrationKycModel = new Schema({
    employeeId:              { type: ObjectId , default :null },
    LD:                      { type: String , default :"" },
    customerName:            { type: String , default :"" },
    nachRegistrationNoUMRN:  { type: String , default :"" },
    nachDoneDate:            { type: String , default :"" },
},
{
    timestamps: true,
  }
);

const nachRegistrationKyDetail = mongoose.model('nachRegistrationKyc', nachRegistrationKycModel);

module.exports = nachRegistrationKyDetail;
