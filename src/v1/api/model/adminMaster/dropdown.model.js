const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const dropdownSchema = new Schema({
   title:            { type: String,required: [true, "Title Is Required"]},
   modelName:         { type: String,required: [true, "ModelName Is Required"]},
   status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
},
{ timestamps: true }
);


const dropdownModel = mongoose.model("dropdown", dropdownSchema);

module.exports = dropdownModel;
 