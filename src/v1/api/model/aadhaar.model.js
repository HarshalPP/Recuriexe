const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const aadhaarSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  formId:{type: mongoose.Schema.Types.ObjectId },
  formName: { type: String, default: ""},
  aadharNo: { type: String, default: ""},
  otp:{type:Number},
  transId:{type:String,default:""},
  ["Aadhar No"]: { type: String, default: ""},
  Address: { type: String, default: ""},
  Careof: { type: String, default: ""},
  Country: { type: String, default: ""},
  DOB: { type: String, default: ""},
  District: { type: String, default: ""},
  ["Document Link"]: { type: String, default: ""},
  Gender: { type: String, default: ""},
  House: { type: String, default: ""},
  Image: { type: String, default: ""},
  Landmark: { type: String, default: ""},
  Locality: { type: String, default: ""},
  Name: { type: String, default: ""},
  Pincode: { type: String, default: ""},
  ["Post Office"]: { type: String, default: ""},
  ["Relatationship type"]: { type: String, default: ""},
  ["Relative Name"]: { type: String, default: ""},
  ["Share Code"]: { type: String, default: ""},
  State: { type: String, default: ""},
  Street: { type: String, default: ""},
  ["Sub District"]: { type: String, default: ""},
  ["Village/Town/City"]: { type: String, default: ""},
},
{ timestamps: true }
);

const aadhaarDetail = mongoose.model("AadhaarDetail", aadhaarSchema);

module.exports = aadhaarDetail;
