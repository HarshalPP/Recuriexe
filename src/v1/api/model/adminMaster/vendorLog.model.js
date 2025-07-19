const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const vendorLogSchema = new Schema({
  vendorId: { type: ObjectId, default: null , unique :true },
  createdById: { type: ObjectId, default: null },
  approverId :{ type: ObjectId, default: null },
  createDate: { type: String , default: ""},
  completeDate: { type: String , default: ""},
  approveDate :{ type: String , default: ""},
  approvalRemark :{ type: String , default: ""},
}, {
  timestamps: true
});

const vendorLogModel = mongoose.model("vendorlog", vendorLogSchema);
module.exports = vendorLogModel;
