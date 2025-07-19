const mongoose = require("mongoose");

const aadharOcrSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    formId:{type: mongoose.Schema.Types.ObjectId },
    formName: { type: String, default: ""},
    aadhaarOrcFrontImage:{ type: String, default: "" },
    aadhaarOrcBackImage:{ type: String, default: "" },
    address:    { type: String, default: "" },
    age:        { type: Number, default: 0 },
    district:   { type: String, default: "" },
    dob:        { type: String, default: "" },
    doc_id:     { type: String, default: "" },
    doi:        { type: String, default: "" },
    gender:     { type: String, default: "" },
    is_scanned: { type: String, default: "" },
    minor:      { type: String, default: "" },
    name:      { type: String, default: "" },
    pincode:     { type: String, default: "" },
    relation_name:{ type: String, default: "" },
    relation_type:{ type: String, default: "" },
    scan_type:    { type: String, default: "" },
    state:        { type: String, default: "" },
    street_address:{ type: String, default: "" },
    yob:          { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const aadharOcrModel = mongoose.model("aadharOcr", aadharOcrSchema);

module.exports = aadharOcrModel;
