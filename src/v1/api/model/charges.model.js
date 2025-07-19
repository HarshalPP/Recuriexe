const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const customerCharesModel = new Schema({
  customerId: { type: ObjectId, default: null, unique: true },
  salesemployeId: [{ type: ObjectId, default: null }],
  approveEmployeId: { type: ObjectId, default: null },

  amountDeposited: { type: String, default: "" },
  dateOfDeposition: { type: String, default: "" },
  depositedBy: { type: String, default: "" },
  paymentScreenShot: { type: String, default: "" },
  
  completeDate: { type: [String], default: [] },
  remark : { type: String, default: "" },
  recieveDate: { type: String, default: "" },
  status: { type: String, enum: ['pending', 'complete'], default: 'pending' },
  approveRemark: { type: String, default: "" },
  approveStatus: { type: String, enum: ['pending', 'approve', 'reAssign'], default: 'pending' },
  approveDate: { type: [String], default: [] },
},
  {
    timestamps: true,
  }
);

const customerCharesSchema = mongoose.model("charges", customerCharesModel);

module.exports = customerCharesSchema;
