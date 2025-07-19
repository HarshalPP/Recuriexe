const mongoose = require("mongoose");

const pincodeSchema = new mongoose.Schema({
  officeName: { type: String, required: true },
  pincode: { type: Number, required: true },
  taluk: { type: String, required: true },
  districtName: { type: String, required: true },
  stateName: { type: String, required: true },
});

const Pincode = mongoose.model("pincode", pincodeSchema);

module.exports = Pincode;
