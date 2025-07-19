const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const incomeDetailsModel = new Schema({
  customerId: { type: ObjectId, default: null , unique: true },
  salesemployeId: { type: ObjectId, default: null },
  salesRemark: { type: String, default: "" },
  salesCompleteDate: { type: String, default: "" },
  salesStatus: { type: String, enum: ['pending', 'complete'], default: 'pending' },
  incomeDocument: { type: [String], default: []},
  bankStatementDocument: { type: [String], default: []},
  udyamCertificateDocument: { type: [String], default: []},
  familyCardDocument: { type: [String], default: []},
  
  cibilEmployeId: { type: ObjectId, default: null },
  cibilRemark: { type: String, default: "" },
  cibilReAssignDate: { type: String, default: "" },
  cibilByApproveDate: { type: String, default: "" },
  cibilStatus: { type: String, enum: ['approve','reDocument','notComplete'], default: 'notComplete' },
},
  {
    timestamps: true,
  }
);

const incomeDetailsSchema = mongoose.model("customerincomeDetails", incomeDetailsModel);

module.exports = incomeDetailsSchema;
