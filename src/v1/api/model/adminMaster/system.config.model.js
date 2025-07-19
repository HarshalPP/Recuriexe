const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const systemConfigSchema = new Schema({
 mobileAllowed:[{type:String,enum:[""]}]
},{
  timestamps:true
});



const systemConfigModel = mongoose.model("systemConfig", systemConfigSchema);

module.exports = systemConfigModel;
