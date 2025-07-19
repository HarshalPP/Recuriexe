const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const panCompreSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  formId:{type: mongoose.Schema.Types.ObjectId },
  formName: { type: String, default: ""},
  panNumber: { type: String },
  aadhaar_linked: { type: Boolean },
  address: {
    city: { type: String },
    country: { type: String },
    full: { type: String },
    line_1: { type: String },
    line_2: { type: String },
    state: { type: String },
    street_name: { type: String },
    zip: { type: String },
  },
  category: { type: String },
  client_id: { type: String },
  dob: { type: String },
  dob_check: { type: Boolean },
  dob_verified: { type: Boolean },
  email: { type: String },
  full_name: { type: String },
  full_name_split: { type: [String] },
  gender: { type: String },
  input_dob: { type: String },
  less_info: { type: Boolean },
  masked_aadhaar: { type: String },
  pan_number: { type: String },
  phone_number: { type: String },
},
{
  timestamps: true,
}
);

const panCompreDetail = mongoose.model(
  "PanComprehensiveDetail",
  panCompreSchema
);

module.exports = panCompreDetail;
