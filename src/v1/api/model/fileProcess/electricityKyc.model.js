const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const electricityKycModel = new Schema({
    employeeId:              { type: ObjectId , default :null },
    LD:                      { type: String , default :"" },
    customerName:            { type: String , default :"" },
    ivrsNo:                  { type: String , default :"" },
    cusumerName:             { type: String , default :"" },
    billDate:                { type: String , default :"" },

},
{
    timestamps: true,
  }
);

const electricityKycDetail = mongoose.model('electricityKyc', electricityKycModel);

module.exports = electricityKycDetail;
