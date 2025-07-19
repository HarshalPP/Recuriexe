const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const bankingModelSchema = new Schema({
  employeId: { type: ObjectId },
  customerId: { type: ObjectId },
  bankDetails: [
    {
      bankACNumber:       { type: String, default: "" },
      bankIFSCNumber:     { type: String, default: "" },
      accountHolderName:  { type: String, default: "" },
      branchName:         { type: String, default: "" },
      branchAddress:      { type: String, default: "" },
      bankStatement:      { type: [String]}
    },
  ],
  status: {
    type: String,
    enum: ["approved", "pending", "reject"],
    default: "pending",
  },
  remarkMessage: { type: String, default: "" },
},
{
  timestamps: true,
}
);

const bankAccountModel = mongoose.model(
  "bankaccountdetails",
  bankingModelSchema
);

module.exports = bankAccountModel;
