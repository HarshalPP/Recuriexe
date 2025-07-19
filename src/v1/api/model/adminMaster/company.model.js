const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const companyModelSchema = new Schema({
   companyName: { type: String,required: [true, "Company Name is required"]},
   status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
},
{ timestamps: true }
);


const companyModel = mongoose.model("company", companyModelSchema);

module.exports = companyModel;
 