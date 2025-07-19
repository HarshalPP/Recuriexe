const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const transferBankNameSchema = new Schema({
//    title:            { type: String,required: [true, "Title Is Required"]},
   bankName:         { type: String,required: [true, "Bank Name Is Required"]},
   bankAcNo:         { type: String,default:""},
   bankIFSCCode:     { type: String,default:""},
   bankAcHolderName: { type: String,default:""},
   bankBranch:       { type: String,default:""},
   status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
},
{ timestamps: true }
);


const transferBankNameModel = mongoose.model("transferBankName", transferBankNameSchema);

module.exports = transferBankNameModel;
 