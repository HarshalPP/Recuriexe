const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const incomeModel = new Schema({
    employeId: { type: ObjectId },
    customerId: { type: ObjectId },
    companyType: {},
    city: { type: String },
    state: { type: String },
    dateOfIncorporation: { type: String },
    district: { type: String },
    pinCode: { type: String },
    bankStatement: { type: String },
    photoUpload :{type:String},
    cin: { type: String },
    status: { type: String, enum: ['approved', 'pending', 'reject'], default: 'pending' },
    remarkMessage: { type: String, default:"" },
},
{
    timestamps: true,
  }
);

const incomeDetail = mongoose.model('Income', incomeModel);

module.exports = incomeDetail;
