const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const disbursementSchema = new mongoose.Schema({
  formFillBy: { type: ObjectId, default: null },
  customerId: { type: ObjectId, default: null, ref: "customerdetail" },
  physicalFileCourier: {
    applicantPDC: { type: Boolean, default: false },
    guarantorPDC: { type: Boolean, default: false },
    applicantBSV: { type: Boolean, default: false },
    guarantorBSV: { type: Boolean, default: false },
    propertyPaper: { type: Boolean, default: false },
    courierDetail: {
      fileCourierDate: { type: String ,deafult :"" },
      sentBy: { type: ObjectId, default: null },
      podNo: { type: String ,deafult :"" },
      uploadReceipt: { type: String ,deafult :"" }, // URL of uploaded receipt
      tentativeHOReceivingDate: { type: String ,deafult :"" },
    },
    receiveCourier: { type: Boolean, default: false }, 
  },
  eNachLinkSentToBranch:{ type: String ,deafult :""},
  eSignatureSentToBranch:{ type: String ,deafult :""},
  eNachLinkSignUpload:{ type: [String] ,deafult :[]},
  eSignatureDocuments:{ type: [String] ,deafult :[]},
  kycAndAffidavit: {
    kycDetail: [
      { 
        type: { type: String , enum: ['applicant', 'coApplicant1','coApplicant2','gtr'],},
        nameAsPerAadhaar: { type: String ,deafult :""},
        nameAsPerPanCard: { type: String ,deafult :""},
        nameAsPerVoter: { type: String ,deafult :""},
        dobAsPerAadhaar: { type: String ,deafult :""},
        dobAsPerPanCard: { type: String ,deafult :""},
        dobAsPerVoter: { type: String ,deafult :""},
        kycUpload: { type: String ,deafult :""}, // URL of uploaded KYC
        dualNameUpload: { type: String ,deafult :""}, // URL of uploaded dual name proof
        dualDOBUpload: { type: String ,deafult :""}, // URL of uploaded dual DOB proof
      },
    ],
  },
  pdcAndBsv: {
    applicantChequeAndBSV: {
      chequeDetail: [{ type: String ,deafult :""}],
      // upload: { type: String ,deafult :""}, // URL of uploaded document
    },
    guarantorChequeAndBSV: {
      chequeDetail: [{ type: String ,deafult :""}],
      // upload: { type: String ,deafult :""}, // URL of uploaded document
    },
  },
  estampRequirement: [{
    denominator:   { type: Number ,enum:[100 ,500]}, // e.g., "100/500"
    totalStampNo:  { type: Number ,deafult :0},
    partnerName:   { type: ObjectId ,deafult :null, ref:"lender"},
    vendorName:    { type: ObjectId ,deafult :null, ref:"vendor"},
    requiredFor:   { type: String ,deafult :""},
    eStampUpload:   [{ type: String ,deafult :""}],
    eStampUploadBy: { type: ObjectId ,deafult :null},
  }],
  esignDocument: {
    pdfGenerate: { type: Boolean, default: false },
    esignGenerate: { type: Boolean, default: false },
    signedDocuments: { type: String ,deafult :""}, // URL of signed documents
  },
  finalDisbursementDocuments: {
    coOwnershipDeed: { type: String ,deafult :""}, // URL of the document
    emRmDeed: { type: String ,deafult :""}, // URL of the document
  },
  finalLegalAndVetting: {
    disbursementMemoSheet: { type: String ,deafult :""}, 
    legalReport: { type: String ,deafult :""}, 
    vettingReport: { type: String ,deafult :""}, 
    insuranceFormWithCalculator: { type: String ,deafult :""},
  },
  postDisbursement: {
    loanNumber: { type: String ,deafult :"" },
    actualPreEmi: { type: Number ,deafult:0},
    dateOfDisbursement: { type: String ,deafult :"" },
    dateOfFirstEmi: { type: String ,deafult :"" },
    utrNumber1: { type: String ,deafult :"" },
    utrNumber2: { type: String ,deafult :"" },
    disbursementDoneBy: { type: String ,deafult :"" },
    firstTranchDisbursementDate:{ type: String ,deafult :"" },
    secondTranchDisbursementDate:{ type: String ,deafult :"" },
  },
  kfsDetails: {
          processingFees: { type: String, default: "" },
          documentsCharges: { type: String, default: "" },
          insuranceCharges: { type: String, default: "" },
          cersaiCharges: { type: String, default: "" },
          preEmiInterest: { type: Number, default: "" },
          benchmarkinterestRate: { type: Number, default: "" },
          SpreadInterestRate: { type: Number, default: "" },
          annualPercentageRateAprPercentage: { type: Number, default: "" },
          epi:{ type: Number, default: "" },
          noOfEpi:{ type: Number, default: "" }
        },
}, { timestamps: true });

const disbursementModel = mongoose.model('disbursement', disbursementSchema);

module.exports = disbursementModel;



// const disbursementSchema = new Schema(
//   {
//     employeeId: { type: ObjectId, default: null },
//     customerId: { type: ObjectId, default: null, ref: "customerdetail" },
//     preDisbursementForm: {
//       applicantName: { type: String, default: "" },
//       dateOfSanction: { type: String, default: "" },
//       loanNumber: { type: String, default: "" },
//       partnerCustomerID:{ type: String, default: "" },
//       // sanctionLetterNumber: { type: String, default: "" },
//       dateOfTheAgreement: { type: String, default: "" },
//       placeOfExecution: { type: String, default: 0 },
//     },
//     kfsDetails: {
//       processingFees: { type: String, default: "" },
//       documentsCharges: { type: String, default: "" },
//       insuranceCharges: { type: String, default: "" },
//       cersaiCharges: { type: String, default: "" },
//       preEmiInterest: { type: Number, default: "" },
//       benchmarkinterestRate: { type: Number, default: "" },
//       SpreadInterestRate: { type: Number, default: "" },
//       annualPercentageRateAprPercentage: { type: Number, default: "" },
//       epi:{ type: Number, default: "" },
//       noOfEpi:{ type: Number, default: "" }
//     },
//     postDisbursementDetails: {
//       loanNumber: { type: String, default: "" },
//       actualPreEmi: { type: Number, default: "" },
//       dateOfDisbursement: { type: String, default: "" },
//       dateOfFirstEmi: { type: String, default: "" },
//       utrNumberOne: { type: String, default: "" },
//       utrNumberTwo: { type: String, default: "" },
//       disbursementDoneBy: { type: String, default: "" },
//       // applicantName: { type: String, default: "" },
//       // fatherName: { type: String, default: "" },
//     },
//     applicantForm: {
//       bankName: { type: String, default: "" },
//       AccountHolderName: { type: String, default: "" },
//       AccountNumber: { type: String, default: "" },
//       IFSCCode: { type: String, default: "" },
//       accountType: { type: String, default: "" },
//       branchName: { type: String, default: "" },
//       remark: { type: String, default: "" },
//       totalChequeCount: { type: String, default: "" },
//       chequeOne: { type: String, default: "" },
//       chequeTwo: { type: String, default: "" },
//       chequeThree: { type: String, default: "" },
//       chequeFour: { type: String, default: "" },
//       chequeFive: { type: String, default: "" },
//       chequeSix: { type: String, default: "" },
//       chequeSeven: { type: String, default: "" },
//       chequeEight: { type: String, default: "" },
//       chequeNine: { type: String, default: "" },
//       chequeTen: { type: String, default: "" },
//     },

//     guarantorForm: {
//       guarantorName: { type: String, default: "" },
//       bankName: { type: String, default: "" },
//       AccountHolderName: { type: String, default: "" },
//       AccountNumber: { type: String, default: "" },
//       IFSCCode: { type: String, default: "" },
//       accountType: { type: String, default: "" },
//       branchName: { type: String, default: "" },
//       remark: { type: String, default: "" },
//       totalChequeCount: { type: String, default: "" },
//       chequeOne: { type: String, default: "" },
//       chequeTwo: { type: String, default: "" },
//       chequeThree: { type: String, default: "" },
//       chequeFour: { type: String, default: "" },
//       chequeFive: { type: String, default: "" },
//       chequeSix: { type: String, default: "" },
//       chequeSeven: { type: String, default: "" },
//       chequeEight: { type: String, default: "" },
//       chequeNine: { type: String, default: "" },
//       chequeTen: { type: String, default: "" },
//     },
//     remarkMessage: { type: String, default: "" },
//     completeDate: { type: String, default: "" },
//     formStatus: {
//       type: String,
//       enum: ["incomplete", "complete", "reject", "approve", "pending"],
//       default: "pending",
//     },
//     status: { type: String, enum: ["inActive", "active"], default: "active" },
//   },

//   {
//     timestamps: true,
//   }
// );

// const disbursementModel = mongoose.model("disbursement", disbursementSchema);
// module.exports = disbursementModel;
