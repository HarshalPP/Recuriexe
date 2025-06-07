const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  description: { type: String, default: "" },
  amount: { type: Number, required: true, min: 0 },
});

const expenseSchema = new mongoose.Schema(
  {
    report: { type: String },
    expenseDate: { type: Date },
    merchant: { type: String, default: "" },
    category: { type: Schema.Types.ObjectId }, // Used when not itemized
    amount: { type: Number, default: 0, required: true }, // Used when not itemized
    itemized: { type: Boolean, default: false },
    lineItems: [lineItemSchema], // Only used if itemized === true
    claimReimbursement: { type: Boolean, default: false },
    currency: { type: String, default: "INR" },
    description: { type: String, default: "" },
    reference: { type: String, default: "" },
    purchaseRequest: { type: String, default: "" },
    attachments: { type: [String] },
    status: { type: String, enum: ["unreported", "reimbursed", "unsubmitted"] },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "employee",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
