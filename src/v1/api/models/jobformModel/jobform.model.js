import mongoose from "mongoose";
import settingcandidate from "../../models/settingModel/candidatesetting.model.js"
const { Schema, model } = mongoose;
const { ObjectId } = Schema;
import moment from "moment-timezone";

const jobApplyModelSchema = new Schema(
  {
    candidateUniqueId: { type: String, default: null },
    orgainizationId: {
      type: ObjectId,
      ref: "Organization",
      default: null,
    },
    candidateId: { type: ObjectId, ref: "User", default: null },
    name: { type: String, default: "" },
    mobileNumber: { type: String, default: "" },
    emailId: { type: String, default: "" },
    password: { type: String, default: null },
    highestQualification: { type: String },
    university: { type: String },
    graduationYear: { type: String },
    cgpa: { type: String },
    address: { type: String },
    state: { type: String },
    city: { type: String },
    pincode: { type: String },
    internalReferenceName: { type: String, default: "" },
    skills: { type: String },
    resume: { type: String },
    salarySlip: { type: String },
    bankAccountProof: { type: String },
    preferedInterviewMode: { type: String },
    position: { type: String, default: "" },
    departmentId: { type: ObjectId, ref: "newdepartment", default: null },
    knewaboutJobPostFrom: { type: String },
    currentDesignation: { type: String, default: "" },
     lastOrganization: {
  type: [String],
  default: []
},

    startDate: { type: Date },
    endDate: { type: Date },
    reasonLeaving: { type: String, default: "" },
    totalExperience: { type: Number, default: null },
    currentCTC: { type: String, default: null },
    expectedCTC : { type: String, default: null },
    currentLocation: { type: String, default: "" },
    preferredLocation: { type: String, default: "" },
    gapIfAny: { type: String, default: "" },
    employeUniqueId: { type: String, ref: "employee", default: null },
    managerID: { type: ObjectId, ref: "employee", default: null },
    workLocationId: { type: ObjectId, ref: "newworklocation", default: null },
    jobPostId: { type: ObjectId, ref: "jobPosts", default: null },
    vacancyRequestId: { type: ObjectId, ref: "vacancyRequest", default: null },
    hrInterviewDetailsId: {
      type: ObjectId,
      ref: "interviewDetails",
      default: null,
    },
    InterviewDetailsIds: [{
      type: ObjectId,
      ref: "interviewDetails",
      default: null,
    }],
    recommendedByID: { type: ObjectId, ref: "employee", default: null },
    jobFormType: {
      type: String,
      enum: ["recommended", "request"],
      default:'request'
    },
    branchId: { type: ObjectId, ref: "newbranch" },
    positionWebsite: { type: String, default: "" },
    departmentWebsite: { type: String, default: "" },
    salary: { type: Number, default: null },
    joiningDate: { type: Date, default: null },
    managerRevertReason: { type: String, default: "" },
    rejectedById: { type: ObjectId, ref: "employee", default: null },
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
    pathofferLetterFinCooper: { type: String, default: null },
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
    isEligible: { type: String, default: "" },
    matchPercentage: { type: Number, default: null },
    summary: { type: String, default: "" },
    avablityStatus: {
      type: ObjectId,
      ref: "availability",
      default: null,
    },
    setAvaialbilityStatus: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
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

    Joining_Status: {
      type: String,
      default: "active"

    },


    Remark:{
      type: String,
      default: ""
    },


     JobType:{
     type: String,
    },

    // AI Result //

    AI_Result: {
      type: String,
    },

    AI_Screeing_Result: {
      type: String,
      default:"Pending"
    },

    // not still analize ( open button for analize )
    AI_Screeing_Status: {
      type: String,
      default: "Pending"  // Completed
    },

    AI_Score:{
     type:Number
    },

    AI_Confidence:{
      type:Number
    },

    immediatejoiner: { type: Boolean, default: false },
     agreePrivacyPolicy : {type : Boolean , default : false },
  },
  { timestamps: true }
);



jobApplyModelSchema.pre("save", async function (next) {
  console.log("called")
  try {
    if (!this.isNew || this.candidateUniqueId) return next();

    const organizationId = this.organizationId;
    let setting = await settingcandidate.findOne({organizationId});
    if (!setting) {
      setting = new settingcandidate({organizationId});
      await setting.save();
    }

    setting.candidateIdCounter += 1;
    await setting.save();

    const parts = [];

    if (setting.candidateIdPrefix) {
      parts.push(setting.candidateIdPrefix);
    }

    if (setting.candidateIdUseDate && setting.candidateIdDateFormat) {
      parts.push(moment().format(setting.candidateIdDateFormat));
    }

    if (setting.candidateIdUseRandom && setting.candidateIdRandomLength > 0) {
      const random = Math.floor(Math.random() * Math.pow(10, setting.candidateIdRandomLength))
        .toString()
        .padStart(setting.candidateIdRandomLength, "0");
      parts.push(random);
    }

    parts.push(setting.candidateIdCounter.toString().padStart(setting.candidateIdPadLength, "0"));

    if (setting.candidateIdSuffix) {
      parts.push(setting.candidateIdSuffix);
    }

    this.candidateUniqueId = parts.join("");

    next();
  } catch (err) {
    next(err);
  }
});


const jobApply = model("jobApplyForm", jobApplyModelSchema);

export default jobApply;
