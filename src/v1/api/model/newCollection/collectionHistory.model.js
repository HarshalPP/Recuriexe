const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const collectionHistory = new mongoose.Schema({
    LD: { type: String, default: "" },
    history: [{
        historyDate:        { type: String, default: "" },
        emiAmount:          { type: Number, default: 0 },
        oldDueAmount:       { type: Number, default: 0 },
        netDueAmount:       { type: Number, default: 0 },
        totalEmiAmountPaid: { type: Number, default: 0 },
        posOutStanding:     { type: Number, default: 0 },
        dpdBucket:          { type: Number, default: 0 },
        UpdateDate:         { type: String, default: "" }
    }]
}, {
    timestamps: true
});

const collectionHistoryModel = mongoose.model('collectionHistory', collectionHistory);

module.exports = collectionHistoryModel;