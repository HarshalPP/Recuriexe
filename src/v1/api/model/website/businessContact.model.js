const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const businessContactSchema = new Schema(
  {
    loanDisbursed: { type: Number, default: null },
    sourcingPincodes: { type: Number, default: null },
    branches: { type: Number, default: null },
    amountDisbursed: { type: Number, default: null },
    patners: { type: Number, default: null },
    employess: { type: Number, default: null },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const businessContact = mongoose.model(
  "businessContact",
  businessContactSchema
);

module.exports = businessContact;
