const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const lenderSchema = new Schema(
  {
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    userName: { type: String, default: "" },
    password: { type: String, default: "" },
    logo: { type: String, default: "" },
    corporateAddress: { type: String, default: "" },
    registerAddress: { type: String, default: "" },
    sanctionEmailTo: { type: [String], default: [] },
    sanctionEmailCc: { type: [String], default: [] },
    disbursementEmailTo: { type: [String], default: [] },
    disbursementEmailCc: { type: [String], default: [] },
    cinNo: { type: String, default: "" },
    gstNo: { type: String, default: "" },
    branchId: { type: [ObjectId], default: [], ref: "newbranch" },
    productId: { type: [ObjectId], default: [], ref: "product" },
    employeeId:{ type: [ObjectId], default: [], ref: "employee" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    commercial: {
      IRR: { type: String, default: "2% + 18% GST" },
      processingFees: { type: String, default: "2% + 18% GST" },
      monthlyBussinessLimit: { type: String, default: "" }
    },
    sanctionLatter: {
      type: String,
      default: "",
    },
    aggrement: {
      type: String,
      default: "",
    },
    charges: {
      processingFeesInclusiveOfGst: { type: String, default: "2% + 18% GST" },
      documentationChargesInclusiveOfGst: {
        type: String,
        default: "2% + 18% GST",
      },
      insurancePremiumInRs: { type: String, default: "0" },
      cersaiChargesInRs: { type: String, default: "0" },
      // preEmiInterestInRs: { type: String, default: "0" },
      benchmarkIntrestRate: { type: String, default: "0" },
      // spreadIntrestRate: { type: String, default: "0" },
      // annualPercentageRate: { type: String, default: "0" },
    },
    addSanction: {
      // for query check
      type: [String],
      default: [],
    },
    addDisbursement: {
      // for query check
      type: [String],
      default: [],
    },
    venders: [
      {
        branch: { type: ObjectId, default: null, ref: "newbranch" },
        reportType: { type: String, default: null },
        vender: { type: ObjectId, default: null, ref: "vendor" },
        status: {
          type: String,
          enum: ["active", "inactive"],
          default: "active",
        },
      },
    ],
    //update checklist document
    sanctionChecklist: { type: [String], default: [] },
    preDisbursementChecklist: { type: [String], default: [] },
    postDisbursementChecklist: { type: [String], default: [] },
    //policy
    policy: [{
      productId: { type: ObjectId, default: null, ref: "lenderProduct" },
      loanAmount: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"],default: "inactive"},
      },
      tenure: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"],default: "inactive"},
      },
      ageOfApplicant: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"],default: "inactive"},
      },
      ageOfPropertyOwner: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"],default: "inactive"},
      },
      cibilScore: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"],default: "inactive"},
      },
      ageOfCoBorrower: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"],default: "inactive"},
      },
      cibilScoreCoBorrower: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"],default: "inactive"},
      },
      ageOfGuarantor: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"],default: "inactive"},
      },
      cIBILScoreGuarantor: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"],default: "inactive"},
      },
      minimumMonthlyFamilyIncome: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"],default: "inactive"},
      },
      foir: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"],default: "inactive"},
      },
      propertyArea: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"],default: "inactive"},
      },
      ltv: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"],default: "inactive"},
      },
      minimumAgricultureLand: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"],default: "inactive"},
      },
    }],
    partnerUniqueId: {
      type: String,
      default: "",
    },
    shortName:{
      type: String,
      default: "",
    },
    loanDocument:{
      type: String,
      enum: ["physical","esign"],
      default: "esign"
    },
    nachMode: {
      type: String,
      enum: ["api", "manual"],
      default: "api",
    },
    physicalFileSendTo: {
      type: String,
      default: "",
    },
    physicalFileAddress: {
      type: String,
      default: "",
    },
    sopDetails:[
      {
        name: { type: ObjectId, default: "", ref: "employee" },
        department: { type: String, default: "" },
        designation: { type: String, default: "" },
        contactNo: { type: String, default: "" },
        email: { type: String, default: "" },
        address: { type: String, default: "" },
      }
    ],
    reportingDetails:[
      {
        reportingId: { type: String, default: "" },
        scheduleTimeMorning: { type: String, default: "" },
        scheduleTimeEvening: { type: String, default: "" }
      }
    ],
    legalDetails: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

const lenderModel = mongoose.model("lender", lenderSchema);

module.exports = lenderModel;

// loginChecklist: {
//   utilityBillAndResiProof: { type: Boolean, default: false },
//   familyCard: { type: Boolean, default: false },
//   udyamCertificate: { type: Boolean, default: false },
//   bankStatement: { type: Boolean, default: false },
//   incomeDocument: { type: Boolean, default: false },
//   propertyDocument: { type: Boolean, default: false },
// },
// sanctionChecklist: {
//   pdReport: { type: Boolean, default: false },
//   technicalReport: { type: Boolean, default: false },
//   legalReport: { type: Boolean, default: false },
//   rcuReport: { type: Boolean, default: false },

//   applicantCibilReport: { type: Boolean, default: false },

//   coApplicantCibilReport: { type: Boolean, default: false },

//   secondCoApplicantCibilReport: { type: Boolean, default: false },

//   guarantorCibilReport: { type: Boolean, default: false },

//   applicantKycNoSignNoOsv: { type: Boolean, default: false },

//   coApplicantKycNoSignNoOsv: { type: Boolean, default: false },

//   secondCoApplicantKycNoSignNoOsv: { type: Boolean, default: false },

//   guarantorKycNoSignNoOsv: { type: Boolean, default: false },

//   housePhotos: { type: Boolean, default: false },

//   workPhotos: { type: Boolean, default: false },

//   camReport: { type: Boolean, default: false },
// },
// preDisbursementChecklist: {
//   applicantKycSelfAttested: { type: Boolean, default: false },

//   coApplicantKycSelfAttested: { type: Boolean, default: false },

//   secondCoApplicantKycSelfAttested: { type: Boolean, default: false },

//   guarantorKycSelfAttested: { type: Boolean, default: false },

//   formSixteenSelfAttested: { type: Boolean, default: false },

//   insuranceFormWithCalculator: { type: Boolean, default: false },

//   dualNameDeclaration: { type: Boolean, default: false },

//   dualSignDeclaration: { type: Boolean, default: false },

//   dualDobDeclaration: { type: Boolean, default: false },

//   applicantPdc: { type: Boolean, default: false },

//   guarantorPdc: { type: Boolean, default: false },

//   applicantBsv: { type: Boolean, default: false },

//   eNachScreenshort: { type: Boolean, default: false },

//   stampPaper: { type: Boolean, default: false },

//   applicantionForm: { type: Boolean, default: false },

//   sanctionLatter: { type: Boolean, default: false },

//   loanDocument: { type: Boolean, default: false },

//   pdDeed: { type: Boolean, default: false },

//   eSignatureDocuments: { type: Boolean, default: false },

//   taggingReport: { type: Boolean, default: false },
// },
// postDisbursementChecklist: {
//   coOwnershipDeed: { type: Boolean, default: false },

//   emRmDeed: { type: Boolean, default: false },

//   legalReportFinal: { type: Boolean, default: false },

//   vettingReport: { type: Boolean, default: false },
// },