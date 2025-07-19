
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const customerFinanceSummarySchema = new mongoose.Schema({
    LD:                 { type: String, default:"" },
    emiAmount:          { type: Number, default:0},
    oldDueAmount:       { type: Number, default:0},
    netDueAmount:       { type: Number, default:0},
    totalEmiAmountPaid: { type: Number, default:0},
    posOutStanding:     { type: Number, default:0},
    dpdBucket:          { type: Number, default:0},
    collectionType:     { type: String, default:"" },
    lastEmiDate:        { type: String, default:"" },
    lastEmiReceivedDate:{ type: String, default:"" },
    UpdateDate :        { type: String, default:"" },
  },
  {
    timestamps: true,
  });

const customerFinanceModel = mongoose.model('customerFinanceSummary', customerFinanceSummarySchema);

module.exports =  customerFinanceModel 