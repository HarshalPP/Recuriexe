const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const googleSheetCustomerSchema = new mongoose.Schema({
  LD:           { type: String, required: true,},
  loanNo:       { type: String, default:"" },
  branchId:     { type: ObjectId, default : null},
  customerName: { type: String, default:"" },
  fatherName:   { type: String, default:"" },
  mobile:       { type: Number, default:null },
  salesPerson:  { type: ObjectId, default:null },
  allocatedBranch: { type: ObjectId, default : null},
  village:         { type: String, default:"" },
  address:         { type: String, default:"" },
  partner:         { type: String, default:"" },
  mode:            { type: String, default:"" },
  emiAmount:       { type: Number, default: 0 },
  oldDue:          { type: Number, default: 0 },
  netDue:          { type: Number, default: 0 },
  collectionType:  { type: String, default:"" },
  loanAmount:      { type: Number, default: 0 },
  tenure:          { type: Number, default: 0 },
  roi:             { type: Number, default: 0 }, 
  partnerName:     { type: String, default:"" },
  lat:             { type: Number, default: 0 },
  long:            { type: Number, default: 0 }
}, { timestamps: true });

const GoogleSheetCustomerModel = mongoose.model('GoogleSheetCustomer', googleSheetCustomerSchema);

module.exports = GoogleSheetCustomerModel;
