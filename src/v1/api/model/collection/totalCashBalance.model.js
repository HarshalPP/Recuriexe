const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const totalCashModelSchema = new Schema({
    employeeId:       { type: ObjectId,default:null},
    creditAmount:     { type: Number,default:0},
    // pendingAmount:    { type: Number,default:0},
    // rejectedAmount:   { type: Number,default:0},
    holdAmount:       { type: Number,default:0},
    debitAmount:      { type: Number,default:0},
    status:           { type: String, enum :["active","inactive"], default:"active" },

},
{
  timestamps: true,
}
);

const totalCashModel = mongoose.model("totalCashBalance", totalCashModelSchema);

module.exports = totalCashModel;
