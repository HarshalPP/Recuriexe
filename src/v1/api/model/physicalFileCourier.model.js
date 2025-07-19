const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const physicalFileCourierModel = new Schema({
  customerId: { type: ObjectId, default: null, unique: true },
  salesemployeId: [{ type: ObjectId, default: null }],
  completeDate: { type: [String], default: "" },
  documentNames: { type: [String], default: [] },
  
  courierDate: { type: String, default: "" },
  sentBy: { type: String, default: "" },
  podNo: { type: String, default: "" },
  uploadReceipt: { type: String, default: "" },
  recieveDate: { type: String, default: "" },
  status: { type: String, enum: ["complete", "pending"], default: "pending" },
  approveEmployeId: { type: ObjectId, default: null },
  approveStatus: { type: String, enum: ['pending' , 'approve', 'reAssign'], default: 'pending' },
  approveRemark : { type: String, default: "" },
  approveDate: { type: [String], default: [] },
},
  {
    timestamps: true,
  }
);

const physicalFileCourierDetail = mongoose.model('physicalFileCourier', physicalFileCourierModel);

module.exports = physicalFileCourierDetail;


// this physical file courier model is used branch to ho 