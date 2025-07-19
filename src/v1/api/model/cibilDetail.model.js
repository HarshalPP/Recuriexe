const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cibilDetailModel = new Schema({
  pdId: { type: Schema.Types.ObjectId },

  cibilId:   [{ type: ObjectId , default :null , ref: "employee"}],

  customerId: { type: Schema.Types.ObjectId, ref: "customerdetail" , unique: true },
  applicantCibilScore: { type: Number },
  applicantCibilReport: { type: [String], default: [] },
  applicantCibilStatus: { type: String,  default: "" },
  applicantCibilRemark: { type: String, default: "" },
  applicantFetchDate  :{ type: [String], default: [] },
  applicantFetchHistory: [{
    cibilEmployeeId: { type: Schema.Types.ObjectId, ref: "employee" },
    fetchDate: { type: String },
    cibilReport: { type: String },
    cibilScore : { type: String , default :"" },
  }],
  applicantCibilDetail: [{ type: Object }],
  applicantTotalObligation: { type: Number, default: 0 }, // yearly
  applicantTotalObligationMonthly: { type: Number, default: 0 },// monthly
  applicantTotalOverDueAmount: { type: Number, default: 0 },
  applicantTotalAccount: { type: Number, default: 0 },// added
  applicantOverdueAccount: { type: Number, default: 0 },
  applicantZeroBalanceAccount: { type: Number, default: 0 },
  applicantHighCreditSanctionAmount: { type: Number, default: 0 },
  applicantcurrentOutstanding: { type: Number, default: 0 },
  applicantNumberOfEnquiry: { type: Number, default: 0 },

  coApplicantData: [{
    // coApplicantId: { type: ObjectId , default :null },
    // coApplicantFileStatus: { type: String, default: "active"},
    coApplicantCibilScore: { type: Number , default: null},
    coApplicantCibilReport: { type: [String], default: [] },
    coAapplicantFetchDate  :{ type: [String], default: [] },
    
    coApplicantFetchHistory: [{
      cibilEmployeeId: { type: Schema.Types.ObjectId, ref: "employee" },
      fetchDate: { type: String },
      cibilReport: { type: String },
      cibilScore : { type: String , default :"" },
    }],
    coApplicantCibilStatus: { type: String,  default: "" },
    coApplicantCibilRemark: { type: String, default: "" },
    coApplicantCibilDetail: [{ type: Object }],
    coApplicantTotalEmiAmount: { type: Number, default: 0 },
    coApplicantTotalOverDueAmount: { type: Number, default: 0 },
    coApplicantTotalAccount: { type: Number, default: 0 },// added
    coApplicantOverdueAccount: { type: Number, default: 0 },
    coApplicantZeroBalanceAccount: { type: Number, default: 0 },
    coApplicantHighCreditSanctionAmount: { type: Number, default: 0 },
    coApplicantcurrentOutstanding: { type: Number, default: 0 },
    coApplicantNumberOfEnquiry: { type: Number, default: 0 },
  }],
  coApplicantCibilReport: { type: String, default: "" },

  guarantorCibilScore: { type: Number ,default: null },
  guarantorCibilReport: { type: [String], default: [] },
  guarantorFetchDate  :{ type: [String], default: [] },
  guarantorFetchHistory: [{
    cibilEmployeeId: { type: Schema.Types.ObjectId, ref: "employee" },
    fetchDate: { type: String },
    cibilReport: { type: String },
    cibilScore : { type: String , default :"" },
  }],
  
  guarantorCibilStatus: { type: String, default: "" },
  guarantorCibilRemark: { type: String, default: "" },
  guarantorCibilDetail: [{ type: Object }],
  guarantorTotalEmiAmount: { type: Number, default: 0 },
  guarantorTotalOverDueAmount: { type: Number, default: 0 },
  cibilFetchDate: { type: String, default: "" },
  TotalLoansNumbers: { type: Number ,default: 0},
  CurrentLoanDetail: { type: String, default: "" },
  reasonOfDPD: { type: String, default: "" },
  cibilRemarkForPd : { type: String, default: "" },
  finalStatus: { type: String, enum: ["approved", "rejected", "pending"] , default: "pending" },
  finalRemark: { type: String, default: "" },
  pendingFormName: { type: [String], default: [] },
},
  {
    timestamps: true,
  }
);

const cibilDetailSchema = mongoose.model("cibilDetail", cibilDetailModel);

module.exports = cibilDetailSchema;
