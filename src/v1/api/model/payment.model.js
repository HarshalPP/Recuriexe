const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const paymentSchema = new Schema({
  employeId: { type: ObjectId },
  customerId: { type: ObjectId },
  paymentPhoto:{type:String},
  transactionId : {type:String},
},
{
  timestamps: true,
}
);

const paymentModel = mongoose.model("payment",paymentSchema);

module.exports = paymentModel;
