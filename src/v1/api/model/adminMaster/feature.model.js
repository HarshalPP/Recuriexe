const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const featureSchema = new Schema({
  title: { type: String, required: [true, "Title Is Required"] },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});



const featureModel = mongoose.model("permissionForm", featureSchema);

module.exports = featureModel;
