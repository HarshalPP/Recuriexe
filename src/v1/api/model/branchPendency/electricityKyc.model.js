const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const electricityKycModel = new Schema({
  employeeId: [{ type: ObjectId, default: null }],
  customerId: { type: ObjectId, default: null },
  approvalEmployeeId:       { type: ObjectId , default :null },
  // electricityKycDocument: { type: [String], default :[] },
  // LD: { type: String, default: "" },
  // customerName:            { type: String , default :"" },
  // electricityBillUpload: { type: String , default :"" },
  // meterPhoto: { type: String , default :"" },
  
  customerName : { type: String , default :"" },
  consumerName : { type: String , default :"" },
  electricityBoard: { type: String , default :"" },
  InterServiceNumber: { type: String , default :"" },
  addressOfConsumer: { type: String , default :"" },
  billAmount: { type: Number , default :0},
  cashDueDate: { type: String , default :"" },
  chequeDueDate: { type: String , default :"" },
  ivrsNo: { type: String , default :"" },
  nameOfConsumer: { type: String , default :"" },
  serviceNo: { type: String , default :"" },
  consumerNo: { type: String , default :"" },
  relationWithApplicant: { type: String , default :"" },
  nameOfElectricityBillOwner: { type: String , default :"" },
  billDate: { type: String, default: "" },

  remarkByBranchVendor: { type: String, default: "" },
  remarkByApproval: { type: String, default: "" },
  approvalDate: { type: String, default: "" },
  completeDate: { type: String, default: "" },
  status: { type: String, enum: ["incomplete", "complete", "reject", "approve", "pending"], default: "pending" },
  fileStatus :  {type: String, enum:["active", "inactive"], default: "active"},
},
  {
    timestamps: true,
  }
);

const electricityKycDetail = mongoose.model('branchElectricityKyc', electricityKycModel);

module.exports = electricityKycDetail;
