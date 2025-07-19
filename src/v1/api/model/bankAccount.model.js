const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bankAccountSchema = new Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  formId:{type: mongoose.Schema.Types.ObjectId },
  accountNumber:{type:String},
  "Account Holder Name": { type: String },
  "Bank Account Number": { type: String },
  ["Bank Branch - Address"]: {
    Address: { type: String },
    Branch: { type: String },
    City: { type: String },
    Contact: { type: String },
    District: { type: String },
    State: { type: String }
  },
  "Bank Name": { type: String },
  "IFSC Code": { type: String }
},
{timestamps:true}
);

const bankAccountDetail = mongoose.model("Account", bankAccountSchema);

module.exports = bankAccountDetail;
