
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const collectionSheetSchema = new mongoose.Schema({
    // bankNameId:         { type: ObjectId, default:null },
    emiUpdateBy:        { type: ObjectId, default:null },
    LD:                 { type: String, default:"" },
    collectedBy:        { type: String, default:"" },
    customerName:       { type: String, default:"" },
    fatherName:         { type: String, default:"" },
    mobileNo:           { type: Number, default:null},
    receivedAmount:     { type: Number, required: [true, "Received Amount Is Required"] },
    transactionId:      { type: String, default:"" },
    transactionImage:   { type: String, default:null },
    customerEmail:      { type: String, default:null },
    modeOfCollectionId: { type: ObjectId, required: [true, "Mode Of Collection Is Required"]},
    commonId:           { type: ObjectId,  default:null},
    partner:            { type: String, default:""},
    emiReceivedDate:    { type: String, default:null },
    emiReceivedTime:    { type: String, default:null },
    remarkByCollection: { type: String, default:null },
    remarkByManager:    { type: String, default:null },
    status:             { type: String, enum:["accept","pending", "initiate","reject"], default:"pending" },
    pdf:                { type: String,  default:"" },
    receiptNo:          { type: Number,  default:0},
    reason:             { type: String, default:"" },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true }
   },
    // emiUpdateDate :{ type: String, default:"" },
  },
  {
    timestamps: true,
  });

const collectionModel = mongoose.model('collectionSheet', collectionSheetSchema);

module.exports =  collectionModel 