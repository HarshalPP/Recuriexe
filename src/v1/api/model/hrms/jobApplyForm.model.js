const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const jobApplyModelSchema = new Schema(
  {
    candidateUniqueId: { type: String, default: null },
    name: { type: String },
    mobileNumber: { type: Number },
    emailId: { type: String },
    password:{type:String , default:null},
    highestQualification: { type: String },
    university: { type: String },
    graduationYear: { type: Number },
    cgpa: { type: String },
    address: { type: String },
    state: { type: String },
    city: { type: String },
    pincode: { type: String },
    skills: { type: String },
    resume: { type: String },
    salarySlip: { type: String },
    bankAccountProof: { type: String },
    preferedInterviewMode: { type: String },
    position: { type: String, default: "" },
    departmentId: { type: ObjectId, ref: "newdepartment", default: null },
    knewaboutJobPostFrom: { type: String },
    currentDesignation: { type: String, default: "" },
    lastOrganization: { type: String, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    reasonLeaving: { type: String, default: "" },
    totalExperience: { type: Number, default: null },
    currentCTC: { type: Number, default: null },
    currentLocation: { type: String, default: "" },
    preferredLocation: { type: String, default: "" },
    gapIfAny: { type: String, default: "" },
    employeUniqueId: { type: String, ref: "employee", default: null },
    //
    managerID: { type: ObjectId, ref: "employee", default: null },
    workLocationId: { type: ObjectId, ref: "newworklocation", default: null },
    jobPostId: { type: ObjectId, ref: "jobPosts", default: null },
    vacancyRequestId: { type: ObjectId, ref: "vacancyRequest", default: null },
    hrInterviewDetailsId: {
      type: ObjectId,
      ref: "interviewDetails",
      default: null,
    },
    recommendedByID: { type: ObjectId, ref: "employee", default: null },
    jobFormType: {
      type: String,
      enum: ["recommended", "request"],
    },
    branchId: { type: ObjectId, ref: "newbranch" },
    positionWebsite: { type: String, default: "" },
    departmentWebsite: { type: String, default: "" },
    salary: { type: Number, default: null },
    joiningDate: { type: Date, default: null },
    managerRevertReason: { type: String, default: "" },
    rejectedById: { type: String, ref: "employee", default: null },
    resumeShortlisted: {
      type: String,
      enum: ["shortlisted", "notshortlisted", "hold", "active"],
      default: "active",
    },
    hrInterviewSchedule: {
      type: String,
      enum: [
        "scheduled",
        "notscheduled",
        "hold",
        "confirmation",
        "active",
        "done",
        "cancelled",
      ],
      default: "active",
    },
    finCooperOfferLetter: {
      type: String,
      enum: ["generated", "notgenerated"],
      default: "notgenerated",
    },
    pathofferLetterFinCooper: { type: String, default: null },//final offer letter
    prevofferLetterFinCooper: { type: String, default: null },
    approvalPayrollfinOfferLetter: {
      type: String,
      enum: ["approved", "notapproved", ""],
      default: "",
    },
    remarkFinCooperOfferLetter: [
      {
        remark: { type: String, default: "" },
        addedBy: { type: ObjectId, ref: "employee", default: null },
        _id: false,
      },
    ],
    // feedbackByHR: [
    //   {
    //     hrId: { type: ObjectId, ref: "employee" },
    //     furtherProcessProfile: {
    //       type: String,
    //       enum: ["yes", "no"]
    //     },
    //     remark: { type: String, default: "" },
    //     _id: false, // Disable automatic _id creation
    //   },
    // ],
    interviewSchedule: {
      type: String,
      enum: [
        "scheduled",
        "notscheduled",
        "hold",
        "confirmation",
        "active",
        "done",
        "cancelled",
      ],
      default: "active",
    },
    feedbackByInterviewer: {
      type: String,
      enum: ["added", "notAdded", "active"],
      default: "active",
    },
    feedbackByHr: {
      type: String,
      enum: ["added", "notAdded", "active"],
      default: "active",
    },
    preOffer: {
      type: String,
      enum: ["generated", "notgenerated", "inprogress", "hold", "active"],
      default: "active",
    },
    docVerification: {
      type: String,
      enum: ["verified", "notverified", "inprogress", "hold", "active"],
      default: "active",
    },
    postOffer: {
      type: String,
      enum: ["genereated", "notgenerated", "hold", "inprogress", "active"],
      default: "active",
    },
    sendOfferLetterToCandidate: {
      type: String,
      enum: ["yes", "no", "notSelected"],
      default: "notSelected",
    },
    sendZohoCredentials: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    candidateStatus: {
      type: String,
      enum: ["new", "reconsidered"],
      default: "new",
    },
    // AI screening //
    isEligible:{
      type: String,
      default: "",
    }, 
    matchPercentage: { type: Number, default: null },
    summary: { type: String, default: "" },
    
    avablityStatus: {
      type:ObjectId,
      ref: "availability",
      default: null,
    },

  setAvaialbilityStatus: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  },

    
    // END AI //

    status: {
      type: String,
      enum: [
        "active",
        "hold",
        "inProgress",
        "reject",
        "shortlisted",
        "managerReview",
        "shortlistedBYManager",
        "joined",
        "onBoarded",
        "notActive",
      ],
      default: "active",
    },
  },
  { timestamps: true }
);

const jobApplyForm = mongoose.model("jobApplyForm", jobApplyModelSchema);

module.exports = jobApplyForm;
