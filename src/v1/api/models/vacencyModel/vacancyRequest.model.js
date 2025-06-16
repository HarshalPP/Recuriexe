import mongoose from "mongoose";

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const vacancyRequestSchema = new Schema(
  {
    departmentId: {
      type: ObjectId,
      ref: "newdepartment",
      required: [true, "Department Is Required"],
    },

    subDepartmentId: {
      type: ObjectId,
      ref: "newdepartment",
      default: null,
    },

    designationId: { 
      type: ObjectId, 
      ref: 'newdesignation', // Referencing the Designation model
      default:null
    },

  // workmode //
    employmentTypeId: {
      type: ObjectId,
      ref: "employmentType",
      required: [true, "Employment type Is Required"],
    },


    // OrganizationId //

    organizationId: {
      type: ObjectId,
      ref: "Organization",
      default: null,
    },


    // employeeType //

    employeeTypeId:{
      type:ObjectId,
      ref:'employeeType',
      default:null
    },


    jobPostId: {
      type: ObjectId,
      ref: "jobPost",
      default: null,
    },

    
    branchId: [
      {
        type: ObjectId,
        ref: "newbranch",
      },
    ],
    qualificationId: {
      type: ObjectId,
      ref: "subDropDown",
      // required: [true, "Eligibility Is Required"],
    },
    experience: {
      type: String,
      required: [true, "Experience Is Required"],
    },
    priority: {
      type: String,
      required: [true, "Priority Is Required"],
    },
    package: {
      type: String,
      required: [true, "Package Is Required"],
    },
    packageType: {
      type: String,
      enum: ["Monthly", "LPA"],
    },
    createdByManagerId: {
      type: ObjectId,
      ref: "employee",
    },
    noOfPosition: {
      type: Number,
      required: [true, "No of positions Is Required"],
    },

    Budget:{
    type:Number,
    },

    InterviewType:{
      type: String,
    },

    Worklocation: {
      type: ObjectId,
      ref: "newworklocation",
      default: null,
    },
    
    jobDescriptionId: {
      type: ObjectId,
      ref: "jobDescription",
      default: null,
    },
    jobPostCreated: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    vacancyApproval: {
      type: String,
      enum: ["approved", "notApproved", "active"],
      default: "active",
    },
    vacancyApprovalById: {
      type: ObjectId,
      ref: "employee",
      default: null,
    },
    vacancyType: {
      type: String,
      enum: ["request", "recommended"],
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
    organizationId: {
      type: ObjectId,
      ref: "Organization",
      default: null,
    },

    AI_Screening:{
      type:String,
      default:"false"
     },


     
    MaxAI_Score:{
      type:Number,
      default:0
    },

    MinAI_Score:{
      type:Number,
      default:0
    },
 
     AI_Percentage:{
       type:Number,
       default:0
     },
  },
  {
    timestamps: true,
  }
);

const vacancyRequestModel = model("vacancyRequest", vacancyRequestSchema);
export default vacancyRequestModel;
