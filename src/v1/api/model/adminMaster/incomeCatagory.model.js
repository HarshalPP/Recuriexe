const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const incomeCatagorySchema = new Schema({
  name: { type: String,required: [true, "Name is required"]},
  // propertyTypeIds: [{ type: ObjectId, ref: "propertyType" , default: []  }],
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
}, {
  timestamps: true
});


const incomeCatagoryModel = mongoose.model("incomeCatagory", incomeCatagorySchema);

module.exports = incomeCatagoryModel;
 