const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const legalNoticeModelSchema = new Schema({
   employeeId: { type:ObjectId,default:null},
   customerFincNo: { type: String,required: [true, "cusotmer FincNo Is Required"]},
   noticeTypeId: { type: ObjectId,required: [true, "Notice Type Is Required"]},
   document: { type: String,required: [true, "Document Is Required"]},
   status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
},
{ timestamps: true }
);


const legalNoticeModel = mongoose.model("legalNotice", legalNoticeModelSchema);

module.exports = legalNoticeModel;
 