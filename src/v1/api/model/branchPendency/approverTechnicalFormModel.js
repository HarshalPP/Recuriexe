const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const technicalApproveFormSchema = new Schema({

  customerId: { type: ObjectId, default: null, unique: true },
  employeeId: { type: ObjectId, default: null },
  vendorId: { type: ObjectId, default: null },

  nameOfDocumentHolder: { type: String, default: "" },
  fatherName: { type: String, default: "" },
  relationWithApplicant: { type: String, default: "" },
  houseNo: { type: String, default: "" },
  surveyNo: { type: String, default: "" },
  patwariHalkaNo: { type: String, default: "" },
  wardNo: { type: String, default: "" },
  villageName: { type: String, default: "" },
  gramPanchayat: { type: String, default: "" },
  tehsil: { type: String, default: "" },
  district: { type: String, default: "" },
  state: { type: String, default: "" },
  pinCode: { type: String, default: "" },
  fullAddressOfProperty: { type: String, default: "" },
  eastBoundary: { type: String, default: "" },
  westBoundary: { type: String, default: "" },
  northBoundary: { type: String, default: "" },
  southBoundary: { type: String, default: "" },
  valuationDoneBy: { type: String, default: "" },
  developmentPercentage: { type: String, default: "" },
  // valuationDoneBy: { type: String, default: "" },
  remarkByApproval: { type: String, default: "" },
  Ltv: { type: String, default: "" },
  distanceOfMap: { type: String, default: "" },
  propertyLandmark: { type: String, default: "" },
  latitude: { type: Number, default: "" },
  longitude: { type: Number, default: "" },
  propertyType: { type: String, default: "" },
  totalLandArea: { type: String, default: "" },
  totalBuiltUpArea: { type: String, default: "" },
  constructionType: { type: String, default: "" },
  constructionQuality: { type: String, default: "" },
  propertyAge: { type: String, default: "" },
  landValue: { type: String, default: "" },
  constructionValue: { type: String, default: "" },
  fairMarketValueOfLand: { type: String, default: "" },
  realizableValue: { type: String, default: "" },
  vendorByCompleteDate: { type: String, default: "" },
  vendorStatus: { type: String, enum: ["complete", "pending"], default: "pending" },

  sellerName:{ type: String, default: "" },
  sellerFatherName:{ type: String, default: "" },
  buyerName:{ type: String, default: "" },
  buyerFatherName:{ type: String, default: "" },

  receivedDate: { type: String, default: "" },
  completeDate: { type: String, default: "" },
  status: { type: String, enum: ["incomplete", "complete", "reject", "approve", "pending"], default: "pending" },
  Allow_Permission: { type: String, enum: ["true", "false"], default: "false" },
}, {
  timestamps: true
});

module.exports = mongoose.model('approveTechnicalForm', technicalApproveFormSchema);
