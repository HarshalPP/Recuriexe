const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const propertyTypeSchema = new Schema({
  name: { type: String,required: [true, "Name is required"]},
  documentsName : {type :[String] , required :[true , "Document Name Required"]},
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
}, {
  timestamps: true
});


const propertyTypeModel = mongoose.model("propertyType", propertyTypeSchema);

module.exports = propertyTypeModel;
 