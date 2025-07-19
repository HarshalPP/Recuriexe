const mongoose = require('mongoose')
const paymentSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" }, // Reference to Customer Model
    loan_number: { type: String}, 
    amountPaid: { type: Number}, 
    transactionId: { type: String}, 
    paymentMode: {
      type: String,
    }, 
    paymentDate: { type: Date },
    billNumber: { type: String }, 
    status: { type: String, enum: ["SUCCESS", "FAILED" , "PENDING"], default: "PENDING" }
  },
  { timestamps: true } 
);

// Define the model with a proper name
const BbpsModel = mongoose.model("bbpsPayments", paymentSchema);
module.exports = BbpsModel;
