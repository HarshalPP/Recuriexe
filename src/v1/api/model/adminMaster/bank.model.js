const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const banknameSchema = new Schema({
   title:            { type: String,required: [true, "Title Is Required"]},
   bankName:         { type: String,default:""},
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


const bankNameModel = mongoose.model("bankname", banknameSchema);

module.exports = bankNameModel;
 