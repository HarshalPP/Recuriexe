const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const panFatherSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  formId:{type: mongoose.Schema.Types.ObjectId },
  formName: { type: String, default: ""},
  panNumber: { type: String },
  additional_check: { type: [String] },
  category: { type: String },
  client_id: { type: String },
  dob: { type: String },
  dob_check: { type: Boolean },
  dob_verified: { type: Boolean },
  father_name: { type: String },
  full_name: { type: String },
  less_info: { type: Boolean },
  pan_number: { type: String },
},
{
  timestamps: true,
}
);

const panFatherDetail = mongoose.model("panFatherDetail", panFatherSchema);

module.exports = panFatherDetail;
