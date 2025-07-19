const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const cashTransferModelSchema = new Schema({
    employeeId:     { type: ObjectId,default:null},
    bankNameId:     { type: ObjectId,default:null},
    payeeTo:        { type: ObjectId,default:null},
    transferRecipt: { type: String,default:""},
    tranferDate:    { type: String,default:""},
    transferAmount: { type: Number,required: [true, "Amount Is Required"]},
    remark:         { type: String,default:""},
    approvedOrRejectedBy: { type: ObjectId,default:null},
    status:         { type: String, enum :["hold","accept","reject"], default:"hold" },
    statusUpdateDate :  { type: String,default:""},
},
{
  timestamps: true,
}
);

const cashTransferModel = mongoose.model("cashTransfer", cashTransferModelSchema);

module.exports = cashTransferModel;
