const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const patnershipRequestSchema = new Schema(
  {
    companyName: { type: String, default: "" },
    auhtorizedPersonName: { type: String, default: "" },
    email: { type: String, default: "" },
    mobileNo: { type: Number, default: null },
    location: { type: String, default: "" },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const patnershipRequest = mongoose.model(
  "patnershipRequest",
  patnershipRequestSchema
);

module.exports = patnershipRequest;
