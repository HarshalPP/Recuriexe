const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const loanTypeSchema = new Schema({
  name: { type: String,required: [true, "Name is required"]},
  paymentRequired : {type :Boolean , default: true},
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
}, {
  timestamps: true
});


const loanTypeModel = mongoose.model("loanType", loanTypeSchema);

module.exports = loanTypeModel;
 