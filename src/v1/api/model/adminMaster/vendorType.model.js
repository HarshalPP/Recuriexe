const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const vendorTypeSchema = new Schema({
   vendorType: { type: String,default: "" },
   status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
},
{ timestamps: true }
);


const vendorTypeModel = mongoose.model("vendorType", vendorTypeSchema);

module.exports = vendorTypeModel;
 