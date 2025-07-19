
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const emiCollectionModelSchema = new mongoose.Schema({
    emiStatusUpdateBy:  { type: ObjectId, default:null },
    LD:                 { type: String, default:"" },
    collectedBy:        { type: String, default:"" },
    receivedAmount:     { type: Number, required: [true, "Received Amount Is Required"] },
    transactionId:      { type: String, default:"" },
    transactionImage:   { type: String, default:null },
    customerEmail:      { type: String, default:null },
    modeOfCollectionId: { type: ObjectId, required: [true, "Mode Of Collection Is Required"]},
    commonId:           { type: ObjectId,  default:null},
    emiReceivedDate:    { type: String, default:null },
    emiReceivedTime:    { type: String, default:null },
    remarkByCollection: { type: String, default:null },
    remarkByManager:    { type: String, default:null },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true }
   },
    status:             { type: String, enum:["accept","pending", "initiate","reject"], default:"pending" },
    pdf:                { type: String,  default:"" },
    receiptNo:          { type: Number,  default:0},
    reason:             { type: String, default:"" },
    emiUpdateDate :     { type: String, default:"" },
  },
  {
    timestamps: true,
  });

const emiCollectionModel = mongoose.model('emiCollection', emiCollectionModelSchema);

module.exports =  emiCollectionModel 