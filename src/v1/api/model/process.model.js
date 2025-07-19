const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const processSchema = new Schema({

  customerId: { type: ObjectId, default: null  ,unique: true},

  employeId: { type: ObjectId, ref: "employee", default: null, },

  cibilId: { type: ObjectId, default: null },

  externalManagerId: { type: ObjectId, default: null },

  creditPdId: { type: ObjectId, default: null },

  tlPdId: { type: ObjectId, default: null },

  finalApprovedId: { type: ObjectId, default: null },

  customerFormStart: { type: Boolean, default: false },
  customerFormComplete: { type: Boolean, default: false },

  applicantFormStart: { type: Boolean, default: false },
  applicantFormComplete: { type: Boolean, default: false },

  coApplicantFormStart: { type: Boolean, default: false },
  coApplicantFormComplete: { type: Boolean, default: false },

  guarantorFormStart: { type: Boolean, default: true },
  guarantorFormComplete: { type: Boolean, default: true },
  
  incomeDocumentFormStart: { type: Boolean, default: false },
  incomeDocumentFormComplete: { type: Boolean, default: false },
  
  propertyDocumentFormStart: { type: Boolean, default: false },
  propertyDocumentFormComplete: { type: Boolean, default: false },
  
  disbursementDocumentFormStart: { type: Boolean, default: false },
  disbursementDocumentFormComplete: { type: Boolean, default: false },

  otherDocumentFormStart: { type: Boolean, default: false },
  otherDocumentFormComplete: { type: Boolean, default: false },

  chargesFormStart: { type: Boolean, default: false },
  chargesFormComplete: { type: Boolean, default: false },

  physicalFileCourierFormStart: { type: Boolean, default: false },
  physicalFileCourierFormComplete: { type: Boolean, default: false },

  referenceFormStart: { type: Boolean, default: true },
  referenceFormComplete: { type: Boolean, default: true },

  bankDetailFormStart: { type: Boolean, default: true },
  bankDetailFormComplete: { type: Boolean, default: true },

  salesCaseDetailFormStart: { type: Boolean, default: false },
  salesCaseDetailFormComplete: { type: Boolean, default: false },

  salesCompleteDate : {type : String , default: ""},
  
  cibilFormStart: { type: Boolean, default: false },
  cibilFormComplete: { type: Boolean, default: false },
  
  pdfCreateByTlPd: { type: String ,default:""},
  pdfCreateByCreditPd: { type: String ,default : ""},

  statusByCibil: { type: String, enum: ["notAssign","incomplete", "pending","query", "rejected", "approved", "complete"], default: "notAssign" },

  remarkByCibil: { type: String, default: "" },

  statusByExternalManager: { type: String, enum: ["incomplete", "pending", "rejected", "approved", "complete"], default: "incomplete" },

  remarkByExternalManager: { type: String, default: "" },

  remarkByCreditPd: { type: String, default: "" },
  statusByCreditPd: { type: String, enum: ["incomplete", "pending", "rejected", "approved", "notAssign"], default: "notAssign" },

  remarkByTlPd: { type: String, default: "" },
  statusByTlPd: { type: String, enum: ["incomplete", "pending", "rejected", "approved", "notAssign"], default: "notAssign" },
  statusByFinalApproval: { type: String, enum: ["incomplete", "pending", "complete"], default: "incomplete" },

// file process and final approval from completion  
    propertyPaperDetailFormStart: { type: Boolean, default: false },
    propertyPaperDetailFormComplete: { type: Boolean, default: false },
// loan details
    cibilDetailFormStart: { type: Boolean, default: false },
    cibilDetailFormComplete: { type: Boolean, default: false },
//depended details
    dependedDetailFormStart: { type: Boolean, default: false },
    dependedDetailFormComplete: { type: Boolean, default: false },

    udyamDetailFormStart: { type: Boolean, default: false },
    udyamDetailFormComplete: { type: Boolean, default: false },

    electricityDetailFormStart: { type: Boolean, default: false },
    electricityDetailFormComplete: { type: Boolean, default: false },

    bankDetailsFormStart: { type: Boolean, default: false },
    bankDetailsFormComplete: { type: Boolean, default: false },

    finalSanctionDetailsFormStart: { type: Boolean, default: false },
    finalSanctionDetailsFormComplete: { type: Boolean, default: false },

    udyamDetailsFormStart: { type: Boolean, default: false },
    udyamDetailsFormComplete: { type: Boolean, default: false },

    electricityDetailsFormStart: { type: Boolean, default: false },
    electricityDetailsFormComplete: { type: Boolean, default: false },

    chargesDetailsFormStart: { type: Boolean, default: false },
    chargesDetailsFormComplete: { type: Boolean, default: false },

    pdcDetailsFormStart: { type: Boolean, default: false },
    pdcDetailsFormComplete: { type: Boolean, default: false },

    gurantorDetailsFormStart: { type: Boolean, default: false },
    gurantorDetailsFormComplete: { type: Boolean, default: false },
//final approval
    postDisbursementFormStart: { type: Boolean, default: false },
    postDisbursementFormComplete: { type: Boolean, default: false },

    fileRevertStatusByPd : {type:String , enum: ["allDone" , "formRequired", ], default: "allDone" },
    fileRevertRemarkByPd : {type :String , default:""},
    fileRevertStatusBySales : { 
      coApplicant : {type : Boolean , default: true},
      coApplicantCount : {type :Number , default : 1},
      guarantor : {type : Boolean , default: true},
    },
    fileRevertStatusByCibil : { type : Boolean , default: true},
  
    fileHoldRemark : {type:String , default: ""},
    fileStatus :  {type: String, enum:["active", "inactive"], default: "active"},
    fileHoldEmployeeId : { type: ObjectId, default: null},
    holdDate :{type : String , default: ""},
    deleteFile: { type: Boolean, default: false },
    fileStageForms: {
      dealSummaryApplicant:     { type: Boolean, default: false },
      dealSignApplicantKyc: { type: Boolean, default: false },
      cibilApplicant:           { type: Boolean, default: false },
      coApplicant:      [{
                         coApplicantId: { type: ObjectId, default:null},
                         dealSummaryStatus: { type: Boolean, default: false },
                         dealSignCoApplicantKyc: { type: Boolean, default: false },
                         cibilStatus: { type: Boolean, default: false },
                         bankStatus: { type: Boolean, default: false },
                         bankDocStatus: { type: Boolean, default: false }
                        }],
      dealSummaryGuarantor:     { type: Boolean, default: false },
      dealSignGuarantorKyc:     { type: Boolean, default: false },
      cibilGuarantor:           { type: Boolean, default: false },
      creditPd:                 { type: Boolean, default: false },
      familyDetail:             { type: Boolean, default: false },
      familyDetailDoc:          { type: Boolean, default: false },
      udyamDetail:              { type: Boolean, default: false },
      udyamDetailDoc:           { type: Boolean, default: false },
      bankDetailApplicant:      { type: Boolean, default: false },
      bankDetailApplicantDoc:   { type: Boolean, default: false },
      bankDetailGtr:            { type: Boolean, default: false },
      bankDetailGtrDoc:         { type: Boolean, default: false },
      propertyPaper:            { type: Boolean, default: false },
      propertyPaperDoc:         { type: Boolean, default: false },
      internalLegal:            { type: Boolean, default: false },
      camDetail:                { type: Boolean, default: false },
      insuranceDetail:          { type: Boolean, default: false },
      partnerSelection:         { type: Boolean, default: false },
      camReport:                { type: Boolean, default: false },
      incomeSanctionGeneration: { type: Boolean, default: false },
      sanctionDetailFromPartner:{ type: Boolean, default: false },
      disbursementCharge:       { type: Boolean, default: false },
      enachLink:                { type: Boolean, default: false },
      disbursementDetail:       { type: Boolean, default: false },
      inventoryDetail:          { type: Boolean, default: false },
      physicalFileSendToLendor: { type: Boolean, default: false },
      // pdc:                      { type: Boolean, default: false },
      esign:                    { type: Boolean, default: false },
      mortgageDetail:           { type: Boolean, default: false },
      legalGenerateDetails:     { type: Boolean, default: false },
      finalSanctionDetails:     { type: Boolean, default: false },
    },
    fileStage:{
      dealSummaryBranch:    { type: Boolean, default: false },
      cibilBranch:          { type: Boolean, default: false },
      creditPdBranch:       { type: Boolean, default: false },
      sanctionDetailBranch: { type: Boolean, default: false },
      preDisbursementBranch:{ type: Boolean, default: false },
      partnerSelectionHo:   { type: Boolean, default: false },
      sanctionHo:           { type: Boolean, default: false },
      nachAndEsignHo:       { type: Boolean, default: false },
      postDisbursementHo:   { type: Boolean, default: false },
    },
},
  {
    timestamps: true,
  }

);

const processModel = mongoose.model("process", processSchema);

module.exports = processModel;





