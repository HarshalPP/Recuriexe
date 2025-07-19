const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const emiCollectModelSchema = new Schema({
  emiCollectDate:     { type: String, default:"" },
  loanNo:             { type: String, required: [true, 'Loan No Is Required'] },
  emiAmount:          { type: Number, default:0 },
  penaltyAmount:      { type: Number, default:0 },
  modeOfCollectionId: { type: ObjectId, default:null },
  customerName:       { type: String, required: [true, 'Customer Name Is Required'] },
  email:              { type: String, default:"" },
  mobileNo:           { type: Number, required: [true, 'Mobile No Is Required'] },
  collectedById:      { type: ObjectId, default:null },
  transId:            { type: String, default:"" },
  transitionImage:    { type: String, default:"" },
  status:             { type: String, enum :["accept","pending","hold"], default:"pending" },
},
{
  timestamps: true,
}
);

const emiCollectModel = mongoose.model("emiCollect", emiCollectModelSchema);

module.exports = emiCollectModel;
