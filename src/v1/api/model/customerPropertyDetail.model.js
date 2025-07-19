const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const propertyDetailsModel = new Schema({
  customerId: { type: ObjectId, default: null, unique: true },
  salesEmployeeId: { type: ObjectId, default: null },
  cibilEmployeId: { type: ObjectId, default: null },

  propertyDocuments: {
    completeDate: { type: [String], default: [] },
    salesEmployeeId: [{ type: ObjectId, default: null }],
    salesStatus: { type: String, enum: ['pending', 'complete'], default: 'pending' },
    document: [{
      documentName: { type: String, default :"" },
      propertyDocument: { type: [String], default: [] },
    }],
    propertyDocument: { type: [String], default: [] },
    cibilRemark: { type: String, default: "" },
    cibilReAssignDate: { type: String, default: "" },
    cibilByApproveDate: { type: String, default: "" },
    cibilStatus: { type: String, enum: ['approve', 'reDocument', 'notComplete'], default: 'notComplete' },
  },



  incomeDocument: {
    completeDate: { type: [String], default: [] },
    salesEmployeeId: [{ type: ObjectId, default: null }],
    salesStatus: { type: String, enum: ['pending', 'complete'], default: 'pending' },

    familyCardDocument: { type: [String], default: [] },
    udyamCertificateDocument: { type: [String], default: [] },
    bankStatementDocument: { type: [String], default: [] },
    incomeStatemenDocument: { type: [String], default: [] },
    utilityBillDocument: { type: [String], default: [] },
    gasDiaryDocument: { type: [String], default: [] },

    cibilRemark: { type: String, default: "" },
    cibilReAssignDate: { type: String, default: "" },
    cibilByApproveDate: { type: String, default: "" },
    cibilStatus: { type: String, enum: ['approve', 'reDocument', 'notComplete'], default: 'notComplete' },
  },

  disbursementDocument: {
    completeDate: { type: [String], default: [] },
    salesEmployeeId: [{ type: ObjectId, default: null }],
    salesStatus: { type: String, enum: ['pending', 'complete'], default: 'pending' },

    emAandRmDeedDocument: { type: [String], default: [] },
    coOwnerShipDeedDocument: { type: [String], default: [] },

    cibilRemark: { type: String, default: "" },
    cibilReAssignDate: { type: String, default: "" },
    cibilByApproveDate: { type: String, default: "" },
    cibilStatus: { type: String, enum: ['approve', 'reDocument', 'notComplete'], default: 'notComplete' },

  },

  otherDocument: {
    completeDate: { type: [String], default: [] },
    salesEmployeeId: [{ type: ObjectId, default: null }],
    salesStatus: { type: String, enum: ['pending', 'complete'], default: 'pending' },

    document: [{
      nameOfOtherDocument: { type: String, required: true },
      otherDocument: { type: [String], default: [] },
    }],

    cibilRemark: { type: String, default: "" },
    cibilReAssignDate: { type: String, default: "" },
    cibilByApproveDate: { type: String, default: "" },
    cibilStatus: { type: String, enum: ['approve', 'reDocument', 'notComplete'], default: 'notComplete' },
  },

  signApplicantKyc:{ type: [String], default: [] },
  signCoApplicantKyc:{ type: [String], default: [] },
  signCoTwoApplicantKyc:{ type: [String], default: [] },
  signGurantorKyc:{ type: [String], default: [] },

},
  {
    timestamps: true,
  }
);

const propertyModelSchema = mongoose.model("customerDocumentDetail", propertyDetailsModel);

module.exports = propertyModelSchema;
