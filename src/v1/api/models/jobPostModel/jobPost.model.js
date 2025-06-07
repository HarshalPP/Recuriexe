import mongoose from "mongoose";

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const jobPostingModelSchema = new Schema(
  {
    employmentTypeId: { type: ObjectId, ref: "employmentType" },
    
      // employeeType //
    employeeTypeId:{
      type:ObjectId,
      ref:'employeeType',
      default:null
    },

    organizationId: { type: ObjectId, ref: "Organization", default: null },
    departmentId: { type: ObjectId, ref: "newdepartment" },
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
    branchId: [{ type: ObjectId, ref: "newbranch" }],
    createdByHrId: { type: ObjectId, ref: "employee", default: null },
    position: { type: String, required: [true, "Position Is Required"] },
    // eligibility: { type: String, required: [true, "Eligibility Is Required"] },
    //    qualificationId: {
    //   type: ObjectId,
    //   ref: "qualification",
    //   // required: [true, "Eligibility Is Required"],
    // },

    qualificationId: [
      {
        type: ObjectId,
        ref: "qualification",
        // required: [true, "Eligibility Is Required"],
      },
    ],
    experience: { type: String, required: [true, "Experience Is Required"] },
    noOfPosition: {
      type: Number,
      required: [true, "No of positions Is Required"],
    },
    budget: { type: String, required: [true, "Budget Is Required"] },
    budgetType: {
      type: String,
      enum: ["Monthly", "LPA"],
    },

    budgetId : { type: ObjectId, ref: "DepartmentBudget", default: null },
    
    package: {
      type: String,
    },

    AI_Screening:{
     type:String,
     default:"false"
    },

    AI_Percentage:{
      type:Number,
      default:0
    },


    MaxAI_Score:{
      type:Number,
      default:0
    },

    MinAI_Score:{
      type:Number,
      default:0
    },


    
    Qualification:{
      type:String
    },

    Holdingbuged: {
      type: Number,
      default: 0,
      },

      // Add Age Limit //
    AgeLimit: {
      type: String,
      default: "No Limit",
    },
    // Add Job Description //

    gender: {
      type: String,
      default: "Both",
    },

    InterviewType:{
      type: String,
    },

    Worklocation: {
      type: ObjectId,
      ref: "newworklocation",
      default: null,
    },

   jobDescriptionId: { type: ObjectId, ref: "jobDescription", default: null },
    vacencyRequestId:{type: ObjectId, ref: "vacancyRequest", default: null},
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const jobPostModel = model("jobPost", jobPostingModelSchema);

export default jobPostModel;
