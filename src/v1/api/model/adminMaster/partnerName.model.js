const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const partnerNameModelSchema = new Schema({
   name: { type: String,required: [true, "Name is required"]},
   status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
},
{ timestamps: true }
);


const partnerNameModel = mongoose.model("partnerName", partnerNameModelSchema);

module.exports = partnerNameModel;
 