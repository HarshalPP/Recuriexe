const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const internalLegalSchema = new Schema(
  {
    LoanType: { type: String, default: null },
    LegalType: { type: String, default: null },
    propertyPaperType: { type: String, default: null },
    customerId: { type: ObjectId, default: null, ref: "customerdetail" },
    buyerName: { type: String, default: null },//ref:"coApplicantDetail,applicantDetail"
    sellerName: { type: String, default: null },
    sellerFatherName: { type: String, default: null },
    propertyPaperType: {
      type: String, default: null,
    },
    customDocument: { //ad
      type: [String],
      default: []
    },  //otherDocuments
    otherDocuments: { //ad
      type: [String],
      default: []
    },
    SealandSignedBy: { 
      no: { type: String, default: null },
      date: { type: String, default: null },
      signedBy: { type: String, default: null },
      file: { type: [String], default: null },
     },
    pramanPatra: {//type: Date
      no: { type: String, default: null },
      date: { type: String, default: null },
      signedBy: { type: String, default: null },
      file: { type: [String], default: null },
    },
    taxReceipt: {
      no: { type: String, default: null },
      date: { type: String, default: null },
      signedBy: { type: String, default: null },
      file: { type: [String], default: null },
    },


    // --- PROPERTY PAPERTYPE IS 1 PAGGER PATTERN // ---NEW CO-OWNERSHIP DEED // 
    co_ownership_deed: {
      no: { type: String, default: null },
      date: { type: String, default: null },
      signedBy: { type: String, default: null },
      file: { type: [String], default: null },
    },

    draftingDocument: {
      no: { type: String, default: null },
      date: { type: String, default: null },
      signedBy: { type: String, default: null },
      file: { type: [String], default: null },
    },

    thirteenYearChainDocument: {
      file: { type: [String], default: null },
    },

    registry: {
      no: { type: String, default: null },
      date: { type: String, default: null },
      signedBy: { type: String, default: null },
      file: { type: [String], default: null },
    },
    

    EM_DEED: {
      no: { type: String, default: null },
      date: { type: String, default: null },
      signedBy: { type: String, default: null },
      file: { type: [String], default: null },
    },
    RM_DEED: {
      no: { type: String, default: null },
      date: { type: String, default: null },
      signedBy: { type: String, default: null },
      file: { type: [String], default: null },
    },

    // --- PROPERTY PAPERTYPE IS 7 PAGGER PATTERN // ---

    PropertyOwnerName: { type: String, default: null },
    PropertyOwnerFatherName: { type: String, default: null },

    gramPanchayat: {
      no: { type: String, default: null },
      date: { type: String, default: null },
      signedBy: { type: String, default: null },
      file: { type: [String], default: null },
    },

    Noc_certificate: {
      no: { type: String, default: null },
      date: { type: String, default: null },
      signedBy: { type: String, default: null },
      file: { type: [String], default: null },
    },

    Buliding_Permission_Certificate: {
      no: { type: String, default: null },
      date: { type: String, default: null },
      signedBy: { type: String, default: null },
      file: { type: [String], default: null },
    },

    Mutation_Certificate: {
      no: { type: String, default: null },
      date: { type: String, default: null },
      signedBy: { type: String, default: null },
      file: { type: [String], default: null },
    },

    Owner_Certificate: {
      no: { type: String, default: null },
      date: { type: String, default: null },
      signedBy:{ type: String, default: null },
      file:{ type: [String], default: null },
    },

    Property_Tax_Reciept: {
      no: { type: String, default: null },
      date: { type: String, default: null },
      signedBy: { type: String, default: null },
      file: { type: [String], default: null },
    },

    // -------- BT -----//  

    BT_BANK_NAME:{
      type: String, default: null,
    },

    // url and status //
    Generate_new_legal: {
      type: String, enum: ["true", "false"], default: false,
    },

    Generate_final_legal: {
      type: String, enum: ["true", "false"], default: false,
    },

    Generate_vetting_Report: {
      type: String, enum: ["true", "false"], default: false,
    },

    Generate_new_legal_link: {
      type: String, default: null,
    },

    Generate_final_legal_link: {
      type: String, default: null,
    },

    Generate_vetting_Report_link: {
      type: String, default: null,
    },

    Allow_Permission: {
      type: String, enum: ["true", "false"], default: false,
    },
    
   
  },
  {
    timestamps: true,
  }
);

const internalLegalModel = mongoose.model(
  "internalLegal",
  internalLegalSchema
);
module.exports = internalLegalModel;
