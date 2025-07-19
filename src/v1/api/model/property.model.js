const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const propertyModelSchema = new Schema({
  employeId: { type: ObjectId },
  customerId: { type: ObjectId },
  status: { type: String, enum: ['approved', 'pending', 'reject'], default: 'pending' },
  remarkMessage: { type: String, default:"" },
},
{
  timestamps: true,
}
);

const propertyModel = mongoose.model("property", propertyModelSchema);

module.exports = propertyModel;
