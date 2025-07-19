const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const countrySchema = new Schema({
   countryName: { type: String,required: [true, "Country Name Is Required"]},
   countryCode: { type: String,required: [true, "Country Code Is Required"]},
   countryNumericCode: { type: Number,default:null},
   status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
},
{ timestamps: true }
);


const countryModel = mongoose.model("country", countrySchema);

module.exports = countryModel;
 