const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const vacancyRequestSchema = new Schema(
  {
    departmentId: {
      type: ObjectId,
      ref: "newdepartment",
      required: [true, "Department Is Required"],
    },
    employmentTypeId: {
      type: ObjectId,
      ref: "employmentType",
      required: [true, "Employment type Is Required"],
    },
    jobPostId: { type: ObjectId, default: null ,ref: "jobposts"},
    branchId: [{ type: ObjectId, ref: "newbranch" }],
    // position: { type: String, required: [true, "Position Is Required"] },
    eligibility: { type: String, required: [true, "Eligibility Is Required"] },
    experience: { type: String, required: [true, "Experience Is Required"] },
    priority: { type: String, required: [true, "Priority Is Required"] },
    package: { type: String, required: [true, "Package Is Required"] },
    packageType: {
      type: String,
      enum: ["Monthly","LPA"],
    },
    createdByManagerId: { type: ObjectId, ref: "employee"}, //employe id
    noOfPosition: {
      type: Number,
      required: [true, "No of positions Is Required"],
    },
    jobDescriptionId: { type: ObjectId, default: null ,ref: "jobDescription"},
    // jobDescription: {
    //   type: String,
    //   required: [true, "Job description Is Required"],
    // },
    jobPostCreated: {
      type: String,
      enum: ["yes","no"],
      default: "no",
    },
    vacancyApproval: {
      type: String,
      enum: ["approved","notApproved","active"],
      default: "active",
    },
    vacancyApprovalById: { type: ObjectId, ref: "employee", default: null }, //employe id
    vacancyType: {
      type: String,
      enum: ["request","recommended"],
    },
    recommendMail: {
      type: String,
      enum: ["send", "notsend"],
      default: "notsend",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    company:
    { type:"String",
     default: ""},
  },

  { timestamps: true }
);

const vacancyRequestModel = mongoose.model(
  "vacancyRequest",
  vacancyRequestSchema
);

module.exports = vacancyRequestModel;
