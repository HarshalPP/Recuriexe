const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const productSchema = new mongoose.Schema(
  {
    permissionFormId: { type: ObjectId, default: null, ref: "permissionForm" },
    productName: { type: String, required: true },
    productFinId: { type: String, required: true },
    incomeCatagoryIds : [{ type: ObjectId, ref: 'incomeCatagory', default: [] }],
    propertyTypeIds : [{ type: ObjectId, ref: 'propertyType', default: [] }],
    loanAmount: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    },
    roi: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    },
    tenure: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    },
    loginFees: {
      type: Number,
      default: 0,
    },
    branchIds: { type: [String], default: [] },
    employeIds: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    pdPaymentFees: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;
