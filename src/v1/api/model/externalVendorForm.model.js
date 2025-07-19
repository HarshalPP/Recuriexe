const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const vendorSchema = new Schema(
  {
    customerId: { type: ObjectId, default: null },
    externalVendorId: { type: ObjectId, default: null },
    rcu: {
      rcuVendorId: { type: ObjectId, ref: "vendor", default: null },
      uploadRcuDocuments: { type: [String], default: null },
      uploadProperty: { type: String, default: null },
      status: {
        type: String,
        enum: ["incomplete", "negative", "credit Refer", "positive"],
        default: "incomplete",
      },
      reason: { type: String, default: "" },
    },

    legal: {
      legalVendorId: { type: ObjectId, ref: "vendor", default: null },
      uploadLegalDocuments: { type: [String], default: null },
      uploadProperty: { type: String, default: null },
      status: {
        type: String,
        enum: ["incomplete", "negative", "credit Refer", "positive"],
        default: "incomplete",
      },
      reason: { type: String, default: "" },
    },

    technical: {
      technicalVendorId: { type: ObjectId, ref: "vendor", default: null },
      uploadTechnicalDocuments: { type: [String], default: null },
      uploadProperty: { type: String, default: null },
      status: {
        type: String,
        enum: ["incomplete", "negative", "credit Refer", "positive"],
        default: "incomplete",
      },
      reason: { type: String, default: "" },
    },

    otherVendor: {
      otherVendorId: { type: ObjectId, ref: "vendor", default: null },
      uploadOtherDocuments: { type: [String], default: null },
      uploadProperty: { type: String, default: null },
      status: {
        type: String,
        enum: ["incomplete", "negative", "credit Refer", "positive"],
        default: "incomplete",
      },
      reason: { type: String, default: "" },
    },

    branchVendor: {
      branchVendorId: { type: ObjectId, ref: "vendor", default: null },
      uploadBranchDocuments: { type: [String], default: null },
      uploadDoc: { type: [String], },
      requirement: [{ type: String }],
      status: {
        type: String,
        enum: ["incomplete", "negative", "credit Refer", "positive"],
        default: "incomplete",
      },
      reason: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

const externalVendorFormModel = mongoose.model("externalVendorForm", vendorSchema);

module.exports = externalVendorFormModel;
