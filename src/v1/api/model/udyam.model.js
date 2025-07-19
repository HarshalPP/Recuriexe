const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const udyamDataSchema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customerdetail",
    },
    formId:{type: mongoose.Schema.Types.ObjectId },
    udyamNumber: { type: String },
    ["DIC Name"]: { type: String },
    ["Date of Commencement of Production/Business"]: { type: String },
    ["Date of Incorporation"]: { type: String },
    ["Date of Udyam Registration"]: { type: String },
    ["Enterprise Type"]: [
      {
        ["Classification Date"]: { type: String },
        ["Classification Year"]: { type: String },
        ["Enterprise Type"]: { type: String },
      },
    ],
    ["MSME-DFO"]: { type: String },
    ["Major Activity"]: { type: String },
    ["Name of Enterprise"]: { type: String },
    ["National Industry Classification Code(S)"]: [
      {
        ["Activity"]: { type: String },
        ["Date"]: { type: String },
        ["Nic 2 Digit"]: { type: String },
        ["Nic 4 Digit"]: { type: String },
        ["Nic 5 Digit"]: { type: String },
      },
    ],
    ["Official address of Enterprise"]: {
      ["Block"]: { type: String },
      ["City"]: { type: String },
      ["District"]: { type: String },
      ["Email"]: { type: String },
      ["Flat/Door/Block No"]: { type: String },
      ["Mobile"]: { type: String },
      ["Name of Premises/ Building"]: { type: String },
      ["Pin"]: { type: String },
      ["Road/Street/Lane"]: { type: String },
      ["State"]: { type: String },
      ["Village/Town"]: { type: String },
    },
    ["Organisation Type"]: { type: String },
    ["Social Category"]: { type: String },
    ["Type of Enterprise"]: { type: String },
    ["Unit(s) Details"]: [
      {
        ["Block"]: { type: String },
        ["Building"]: { type: String },
        ["City"]: { type: String },
        ["District"]: { type: String },
        ["Flat"]: { type: String },
        ["Pin"]: { type: String },
        ["Road"]: { type: String },
        ["SN"]: { type: Number },
        ["State"]: { type: String },
        ["Unit_Name"]: { type: String },
        ["Village/Town"]: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const udyamDataModel = mongoose.model("udyam", udyamDataSchema);

module.exports = udyamDataModel;
