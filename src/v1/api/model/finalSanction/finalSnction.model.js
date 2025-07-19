const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const finalSnctionModelSchema = new Schema(
  {
    partnerId: { type: ObjectId, default: null, ref: "lender" },
    customerId: { type: ObjectId, default: null, unique: true },
    employeeId: { type: ObjectId, default: null, ref: "employee" }, // Ho self assign
    pdfSelection: { type: String, default: "" },
    esignLink: [
      {
        partnerName: { type: String },
        pdf: { type: String },
        esignLinkUrl: { type: String },
        createdAt: { type: String },
      },
    ],
    loanType: { type: String, default: "" },
    branchName: { type: String, default: "" },
    EndUseOfLoan: { type: ObjectId, default: null, ref: "endUseOfLoan" },
    totalIncome: { type: String, default: "" },
    totalObligations: { type: String, default: "" },
    fairMarketValue: { type: String, default: "" },
    foir: { type: String, default: "" },
    // ltv: { type: String, default: "" },
    customerProfile: { type: String, default: "" },
    customerSegment: { type: String, default: "" },
    applicantName: { type: String, default: "" },
    fatherName: { type: String, default: "" },
    contact: { type: String, default: "" },
    finalLoanAmount: { type: String, default: "" },
    loanAmountInWords: { type: String, default: "" },
    tenureInWords: { type: String, default: "" },
    tenureInMonth: { type: String, default: "" },
    roi: { type: String, default: "0" },
    emiAmount: { type: String, default: "" },
    emiCycle: { type: String, default: "" },
    emiCycleDate: { type: String, default: "" },
    charges: {
      processingFeesInclusiveOfGst: { type: String, default: "" },
      documentationChargesInclusiveOfGst: { type: String, default: "" },
      insurancePremiumInRs: { type: String, default: "" },
      cersaiChargesInRs: { type: String, default: "" },
      preEmiInterestInRs: { type: String, default: "" },
    },
    ratnaPdfUrls: {
      sectionLatter: { type: String },
      applicantionLatter: { type: String },
      LdAndPdDeed: { type: String },
    },
    fcplPdfUrls: {
      fincooperSanctionLetterPdf: { type: String },
      fincooperApplicantPdf: { type: String },
      fincooperLoanAgreement: { type: String },
      fincooperPgDeedPdf: { type: String },
    },
    growMoneyPdfUrls: {
      growSanctionLetterPdf: { type: String },
      growApplicantPdf: { type: String },
      rcplLoanAgreement: { type: String },
      growPgDeedPdf: { type: String },
    },
    naamDevPdflink: {
      naamDevSanctionLetter: { type: String },
      naamDevApplicantPdf: { type: String },
      naamDevLoanPdf:{ type: String },
    },
    incomesectionLatterUrl: { type: String, default:"" },
    GmRMdeeDpdf_Url: { type: String },
    GmEMdeeDpdf_Url: { type: String },
    completeDate: { type: String, default: "" },
    status: {
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },
    preSanctionStatus: {
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },

    branchPendencyQuery: {
      query: { type: [String], default: [] },
    },
    sanctionConditionQuery: {
      query: { type: [String], default: [] },
    },

    department_info: [
      {
        dependent_Name: { type: String, default: "" },
        age: { type: String, default: "" },
        Relationship: { type: String, default: "" },
        Annual_Income: { type: String, default: "" },
        Occupation: { type: String, default: "" },
        Institution_of_studen: { type: String, default: "" },
        Name_of_Organization: { type: String, default: "" },
        Designation: { type: String, default: "" },
        Date_of_joining: { type: Date, default: "" },
      },
    ],
    deviation: {
      query: { type: [String], default: [] },
    },
    mitigate: {
      query: { type: [String], default: [] },
    },

    finalSenctionFileSelfAssign: { type: Boolean, default: false }, // ho self assign

    branchSelfAssign: { type: Boolean, default: false }, // branch self assign
    branchSelfAssignDate: { type: String, default: "" }, // branch self assign
    branchSelfAssignEmpId: { type: ObjectId, default: null }, // branch self assign
    //related to gm
    agricultureIncome: {
      details: [
        {
          state: { type: String, default: "" },
          district: { type: String, default: "" },
          season: { type: String, default: "" },
          AreaCultivationAcres: { type: String, default: "" },
          rate: { type: String, default: "" },
          crop: { type: String, default: "" },
          netIncome: { type: String, default: "" },
        },
      ],
      totalFormula: { type: String, default: "" },
    },
    milkIncomeCalculation: {
      details: [
        {
          months: { type: String, default: "" },
          saleOfMilk: { type: String, default: "" },
        },
      ],
      calculation: {
        averageSaleOfMilk: { type: String, default: "" },
        ConsiderableMilkIncomePercentage: { type: String, default: "" },
      },
    },
    otherIncomeCalculation: {
      grossIncome: { type: String, default: "" },
      netIncome: { type: String, default: "" },
    },
    totalIncomeMonthlyCalculation: {
      details: [
        {
          name: { type: String, default: "" },
          source: { type: String, default: "" },
          amount: { type: String, default: "" },
        },
      ],
      totalFormula: { type: String, default: "" },
    },

    //related to the ratnafin and FCPL, unity cam
    agricultureRatnaIncome: {
      details: [
      {
      district: { type: String, default: "" },
      season: { type: String, default: "" },
      AreaCultivationAcres: { type: String, default: "" },
      crop: { type: String, default: "" },
      netIncome: { type: String, default: "" },
      },
      ],
      grossYearlyIncome: { type: String, default: "" },
      grossMonthlyIncome: { type: String, default: "" },
      grossExpensesFromAgriculture: { type: String, default: "" },
      grossMonthlyExpensesFromAgriculture: { type: String, default: "" },
     
      totalNoAgricultureLand: { type: String, default: "" },
      AgriOwnerName: { type: String, default: "" },
      AgriOwnerage: { type: String, default: "" },
      AgriOwnerNo: { type: String, default: "" },
      yearOfDoingAgriculture: { type: String, default: "" },
      lastCropDetails: { type: String, default: "" },
      lastCropSalesDetails: { type: String, default: "" },
      surveyNoOfAgricultureLand: { type: String, default: "" },
      lastCropSalesInCaseAmount: { type: String, default: "" },
      lastCropSalesAmountReciveInBank: { type: String, default: "" },
      agricultureIncomeDocument: { type: String, default: "" },
      },


      milkRatnaIncomeCalculation: {
      totalNoOfMilkGivingCatel: { type: String, default: "" },
      incomeConsideredPerMilkGivingCatel: { type: String, default: "" },
      grossYearlyIncome: { type: String, default: "" },
      grossMonthlyIncome: { type: String, default: "" },
      },
      otherBusinessIncomeCalculation: {
      grossBusinessMonthlyIncome: { type: String, default: "" },
      grossBusinessYearlyIncome: { type: String, default: "" },
      },
      expensesDetails: {
      grossExpensesFromAgriculture: { type: String, default: "" },
      grossExpensesFromMilk: { type: String, default: "" },
      grossExpensesFromExisting: { type: String, default: "" },
      },
      grossCalculation: {
      // yearly income
      agricultureIncome: { type: String, default: "" },
      incomeFromMilk: { type: String, default: "" },
      incomeFromOtherSource: { type: String, default: "" },
      totalAnnualIncome: { type: String, default: "" },
      },
      netCalculation: {
      totalNetAnnualIncome: { type: String, default: "" },
      totalNetAnnualExpenses: { type: String, default: "" },
      totalNetMonthlyIncome: { type: String, default: "" },
      },

    // new cam report generate
      agricultureIncomeNew: {
      ownerDetails:[
        {
          name: { type: String, default: "" },
          fatherName: { type: String, default: "" },
          age: { type: String, default: "" },
          relation: { type: String, default: "" },
        }
      ],
      details: [
      {
      district: { type: String, default: "" },
      season: { type: String, default: "" },
      AreaInHectare: { type: String, default: "" },
      AreaInAcres: { type: String, default: "" },
      crop: { type: String, default: "" },
      netIncome: { type: String, default: "" },
      },
      ],
      totalNetAnnualIncome: { type: String, default: "" },
      totalNetMonthlyIncome: { type: String, default: "" },
      noOfAgricultureOwner: { type: String, default: "" },
      lastCropDetail: { type: [String], default: "" },
      agriDocument: { type: [String], default: [] }
      },

      milkIncomeCalculationNew: {
        details: [
        {
          months: { type: String, default: "" },
          saleOfMilk: { type: String, default: "" },
        },
      ],
        milkIncomeInTheNameOf: { type: String, default: "" },
        averageSaleOfMilk: { type: String, default: "" },
        totalNetMonthlyIncomeAsPerSales: { type: String, default: "" },
        totalNetAnnualIncomeAsPerSales: { type: String, default: "" },
        totalNetMonthlyIncomeAsPerCattle: { type: String, default: "" },
        totalNetAnnualIncomeAsPerCattle: { type: String, default: "" },
        milkDocument: { type: [String], default: [] }
      },

      otherIncomeNew: {
        otherIncomeInTheNameOf: { type: String, default: "" },
        sourceOfIncome: { type: String, default: "" },
        totalNetMonthlyIncomeFromOther: { type: String, default: "" },
        totalNetAnnualIncomeFromOther: { type: String, default: "" },
        uploadOtherIncomeDocument: { type: [String], default: [] },
      },

      netCalculationNew:{
        overAllTotalNetMonthlyIncome: { type: String, default: "" },
        OverallTotalNetAnnualIncome: { type: String, default: "" },
        OverallTotalNetMonthlyExpence: { type: String, default: "" },
        OverallTotalNetAnnualExpence: { type: String, default: ""},
        foir: { type: String, default: ""}
      },
    
    partnerSanctionQuery: {
      type: Object,
      default: {},
    },
    partnerDisbursementQuery: {
      type: Object,
      default: {},
    },
    Allow_Permission: {
      type: String,
      enum: ["true", "false"],
      default: "false",
    },
    //for ratna fin
    signEsignLink: {
      applicantLink: { type: String, default: "" },
      coapplicantLink: { type: String, default: "" },
      coapplicantTwoLink: { type: String, default: "" },
      guarantorLink: { type: String, default: "" },
    },

    //fcpl gm esign
    esignLinks: { type: Object, default: {} },
    //sign esgin link
    signEsignLink: { type: Object, default: {} },
    // sign document leegality of all user
    signLeegalityLink: { type: String, default: "" },
    
    //ratna document Id
    ratnaDocument_ids:{ type: Object, default:  {} },

    //Ratna sign esgin link
    ratnaSignEsignLink: { type: Object, default: {} },

  selfAassignDate: { type: String, default: "" },
    // final approval status
    incomeSanctionStatus: {
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },

    incomeSanctionDate: { type: String, default: "" },

    sendToPartnerSanctionStatus: {
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },

    sendToPartnerSanctionDate: { type: String, default: "" },

    sendToPartnerPreDisbursedStatus: {
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },

    sendToPartnerPreDisbursedDate: { type: String, default: "" },

    
    finalSanctionStatus:{
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },

    finalSanctionStatusDate: { type: String, default: "" },

    
    sendToPartnerPostDisbursedStatus: {
      //disburstment
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },

    sendToPartnerPostDisbursedDate: { type: String, default: "" },

    // if generate sanction latter pdf
    generateSanctionLatterStatus: {
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },

    // file process status
    fileProcessSanctionStatus: {
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },

    fileProcessSanctionDate: { type: String, default: "" },

    fileProcessSendToSanctionStatus: {
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },

    fileProcessSendToSanctionDate: { type: String, default: "" },

    fileProcessDisbursementStatus: {
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },

    fileProcessDisbursementDate: { type: String, default: "" },

    fileProcessSendDisbursementStatus: {
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },

    fileProcessSendDisbursementDate: { type: String, default: "" },

    fileProcessFinalDisbursementStatus: {
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },

    fileProcessFinalDisbursementDate: { type: String, default: "" },

    fileProcessRejectStatus: {
      type: String,
      enum: ["incomplete", "complete", "reject", "approve", "pending"],
      default: "pending",
    },

    fileProcessRejectDate: { type: String, default: "" },

    fileProcessRejectRemark: {
      type: String,
      default: "",
    },

    finalSanctionStatus: { type: String, default: "" },

    finalSanctionStatusDate: { type: String, default: "" },

    finalDisbursementStatus: { type: String, default: "" },

    finalDisbursementStatusDate: { type: String, default: "" },

    sanctionZipUrl: { type: [String], default: [] },

    disbursementZipUrl: { type: [String], default: [] },

    //new upload document
    physicalEsignDocument:{
      sanctionLetter: { type: String, default: "" },
      applicationForm: { type: String, default: "" },
      loanAgreement: { type: String, default: "" },
      repaymentSchedule: { type: String, default: "" },
      kfs: { type: String, default: "" },
      otherDocument: { type: [String], default: "" },
    },

    reUploadPhysicalEsignDocument:{
      sanctionLetter: { type: String, default: "" },
      applicationForm: { type: String, default: "" },
      loanAgreement: { type: String, default: "" },
      repaymentSchedule: { type: String, default: "" },
      kfs: { type: String, default: "" },
      otherDocument: { type: [String], default: "" },
    },
    //legal details
    authorizedPerson: { type: String, default: "" },
    mortgageDetails :[
      {
        name: { type: String, default: "" },
        generatedDocument: { type: [String], default: [] },
        uploadedDocument: { type: [String], default: [] },
        number: { type: String, default: "" },
        date: { type: String, default: "" },
      }
    ],

    pasteEsignDocument:{
      ApplicantionForm: { type: Object, default: {} },
      sanctionLatter: { type: Object, default: {} },
      loanAgreement: { type: Object, default: {} },
    },

    lenderProdcutId: { type: ObjectId, default: null, ref: "lenderProduct" },
    fileStatus:     {type:String , default : "Pd Done"},
    responsibility: {type:String , default : "Branch"},
    hoRemark:       {type:String , default : ""}, 
    partnerPending: {type:String , default : "Yes"}, 
  },
  {
    timestamps: true,
  }
);

const finalSanctionDetail = mongoose.model(
  "finalSanctionDetaails",
  finalSnctionModelSchema
);
module.exports = finalSanctionDetail;


