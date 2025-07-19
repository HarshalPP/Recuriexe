const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const electricitySchema = new Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  formId:{type: mongoose.Schema.Types.ObjectId },
  docNumber:{type:String},
  "Address Of Consumer": { type: String },
  "Bill Amount": { type: String },
  "Cash Due Date": { type: String },
  "Cheque Due Date": { type: String },
  "Current Surcharge": { type: String },
  "Ivrs No": { type: String },
  "Name Of Consumer": { type: String},
  "Service No": { type: String  },
  "Consumer No": { type: String },
},
{timestamps:true}
);

const ElectricityDetail = mongoose.model("ElectricityDetail", electricitySchema);

module.exports = ElectricityDetail;
