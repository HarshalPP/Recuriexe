const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const endUseOfLoanSchema = new Schema({
    name: { type: String, default: "", unique: true, trim: true }
},
{
  timestamps: true,
}
);

const endUseOfLoanModel = mongoose.model("endUseOfLoan", endUseOfLoanSchema);

module.exports = endUseOfLoanModel;
