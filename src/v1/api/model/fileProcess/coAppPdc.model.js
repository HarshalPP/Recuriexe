const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const coAppPdcModel = new Schema({
    employeeId:         { type: ObjectId , default :null },
    LD:                 { type: String , default :"" },
    customerName:       { type: String , default :"" },
    coAppName:          { type: String , default :"" },
    bankName:           { type: String , default :"" },
    acHolderName:       { type: String , default :"" },
    accountNumber:      { type: String , default :"" },
    ifscCode:           { type: String , default :"" },
    branchName:         { type: String , default :"" },
    accountType:        { type: String , default :"" },
    totalChequeCount:   { type: String , default :"" },
    chequeNo1:          { type: String , default :"" },
    chequeNo2:          { type: String , default :"" },
    chequeNo3:          { type: String , default :"" },
    chequeNo4:          { type: String , default :"" },
    chequeNo5:          { type: String , default :"" },
    chequeNo6:          { type: String , default :"" },
    chequeNo7:          { type: String , default :"" },
    chequeNo8:          { type: String , default :"" },
    chequeNo9:          { type: String , default :"" },
    chequeNo10:         { type: String , default :"" },
},
{
    timestamps: true,
  }
);

const coAppPdcDetail = mongoose.model('coAppPdc', coAppPdcModel);

module.exports = coAppPdcDetail;
