const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const loginCashPaymentSchema = new Schema(
  {
    approvedBy:   { type: ObjectId, default: null },
    senderId:     { type: ObjectId, required: true }, 
    receiverId:   { type: ObjectId, required: true }, 
    receiverType: { type: String,  enum: ["bank", "cashPerson"],  required: true  }, 
    transactionImage: { type: String, default: "" },
    amount:           { type: Number, required: true },
    transferDate:     { type: String, default: "" }, 
    remark:           { type: String, default: "" }, 
    updateDate:       { type: String, default: "" },
    status:           { type: String, enum: ["pending", "accept", "reject"], default: "pending" },
  },
  {
    timestamps: true,
  }
);

const loginCashPaymentModel = mongoose.model("loginCashPayment", loginCashPaymentSchema);

module.exports = loginCashPaymentModel;
