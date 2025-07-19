const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const vendorSchema = new Schema({
  roleId: { type: ObjectId, required: [true, "role is required"] },
  vendorType: [{ type: ObjectId, ref: 'vendorType', required: [true, "vendor type is required"] }],
  branchId: [{ type: ObjectId, default: null }],
  partnerId: [{ type: ObjectId, default: null }],
  fullName: { type: String, default: "" },
  userName: { type: String, default: "" },
  contact: { type: Number, default: null },
  password: { type: String, default: "" },
  email: { type: String, default: "" },
  employeUniqueId: { type: String, default: "" },
  registeredAddress: { type: String, default: "" },
  uploaDoc: { type: [String], default: "" },
  companyName: { type: String, enum: ["FIN COOPERS CAPITAL", "UGRO", "AMBIT", "FIN COOPERS INDIA"], default: "FIN COOPERS CAPITAL" },
  rate: { type: Number, default: 0 },
  communicationToMailId: { type: String, default: "" },
  communicationCcMailId: { type: [String], default: [] },
  ownerName: { type: String, default: "" },
  corporateAddress: { type: String, default: "" },
  CINNumber: { type: String, default: "" }, 
  GSTNumber: { type: String, default: "" }, 

  serviceAgreement: { type: String, default: "" },
  panCard: { type: String, default: "" },
  aadharCard: { type: String, default: "" },
  idProof: { type: String, default: "" },
  addressProof: { type: String, default: "" },
  kycDirectors: { type: String, default: "" },
  gstCertificate: { type: String, default: "" },
  vendorPhoto: { type: String, default: "" },
  agencyDetails: { type: String, default: "" },
  bankDetails: { type: String, default: "" },
  briefProfile: { type: String, default: "" },
  // Sole Proprietorship fields
  soleProprietorship:{
    proprietorshipDeclaration: { type: String, default: "" },
    boardResolution: { type: String, default: "" },
    listOfDirectors: { type: String, default: "" },
    shareholdingPattern: { type: String, default: "" },
    certificateOfIncorporation: { type: String, default: "" },
    moaAoa: { type: String, default: "" },
  },

  // Partnership Firm fields
  partnershipFirm :{
    partnershipDeclaration: { type: String, default: "" },
    partnershipRegistrationCertificate: { type: String, default: "" },
    partnershipDeed: { type: String, default: "" },
  },
  vendorStatus: { type: String, enum: ["incomplete", "pending", "approve", "reject"], default: "incomplete" },
  status: { type: String, enum: ["new","active", "inactive"], default: "active" },
  rateHistory: [
    {
      startDate: { type: String, default: "" },
      updateById: { type: ObjectId,  default: null },
      generalRate: { type: Number, default: 0},
      legalRates: {
        firstLegalRate: { type: Number , default: 0 },
        finalLegalRate: { type: Number , default: 0 },
        vettingLegalRate: { type: Number , default: 0 }
      }
    }
  ],

}, {
  timestamps: true
});


const vendorModel = mongoose.model("vendor", vendorSchema);
module.exports = vendorModel;
