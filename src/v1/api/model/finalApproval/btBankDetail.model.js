const mongoose = require("mongoose");

const btDetailsSchema = new mongoose.Schema(
  {
    customerId: { type: ObjectId, unique: true, ref: "customerdetail" },
    bankName: { type: String , default :"" },
    amount: { type: Number ,  default: 0},
    topUpAmount: { type: Number, default: 0 },
    bankAccountHolderName: { type: String , default :"" },
    bankBankName: { type: String , default :"" },
    accountNumber: { type: String , default :"" },
    accountType: { type: String , default :"" },
    ifscCode: { type: String , default :"" },
    bankAddress: { type: String , default :"" },
    first_Trance_Amount:{type:String , default:""},
    second_Trance_Amount:{type:String , default:""},
     //BT documents
    Foreclosure_Letter: {
      file: { type: String, default: "" },
    },
    SOA: {
      file: { type: String, default: "" },
    },
    LOD: {
      file: { type: String, default: "" },
    },
    BT_Bank_Sanction_Letter: {
      file: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const btDetailsModel = mongoose.model("btDetails", btDetailsSchema);
module.exports = btDetailsModel;
