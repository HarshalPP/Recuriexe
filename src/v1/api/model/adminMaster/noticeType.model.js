const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const noticeTypeModelSchema = new Schema({
   title: { type: String,required: [true, "Notice Title Is Required"]},
   noticeLogo: { type: String,default:null},
   status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
},
{ timestamps: true }
);


const noticeTypeModel = mongoose.model("noticetype", noticeTypeModelSchema);

module.exports = noticeTypeModel;
 