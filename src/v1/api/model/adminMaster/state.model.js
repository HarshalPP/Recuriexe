const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const stateSchema = new Schema({
   countryCode:  { type: String,default:""},
   stateName:    { type: String,default:""},
   stateCode:    { type: String,default:""},
   statePincode: { type: Number,default:null},
   status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
},
{ timestamps: true }
);


const stateModel = mongoose.model("state", stateSchema);

module.exports = stateModel;
 