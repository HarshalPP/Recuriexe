import mongoose from "mongoose";
import jobPostingsetting from "../../models/settingModel/jobPostsetting.model.js"

const { Schema, model } = mongoose;
const { ObjectId } = Schema;
import moment from "moment-timezone";

const jobPostingModelSchema = new Schema(
  {
    employmentTypeId: { type: ObjectId, ref: "employmentType" },
    
      // employeeType //
    employeeTypeId:{
      type:ObjectId,
      ref:'employeeType',
      default:null
    },

    jobPostId:{
      type:String,

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
        // ref: "subDropDown",
        ref: "Qualification",
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

    JobType:{
     type: String,
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
      enum: ["pending" , "active", "inactive", "reject"],
      default: "pending",
    },
    jobPostApproveEmployeeId: { type: ObjectId, ref: "employee", default: null },
    jobPostApproveDate: { type: Date, default: null },
    jobPostApproveRemark: { type: String, default: "" },
    jobPostExpired : { type :Boolean , default : false },
    expiredDate : {type :Date ,default :null },
    numberOfApplicant : { type :Number , default :0},
    totalApplicants : { type :Number , default :0},
  },
  { timestamps: true }
);


jobPostingModelSchema.pre("save", async function (next) {
  try {
    if (this.jobPostId) return next();

    const organizationId = this.organizationId;

    let setting = await jobPostingsetting.findOne({ organizationId:organizationId });

   if (!setting) {
      setting = await jobPostingsetting.create({ organizationId });
    }
    setting.PostIdCounter += 1;
    await setting.save();

    const parts = [];

    if (setting.PostIdPrefix) {
      parts.push(setting.PostIdPrefix);
    }

    if (setting.PostIdUseDate && setting.PostIdDateFormat) {
      parts.push(moment().format(setting.PostIdDateFormat));
    }

    if (setting.PostIdUseRandom && setting.PostIdRandomLength > 0) {
      const random = Math.floor(Math.random() * Math.pow(10, setting.PostIdRandomLength))
        .toString()
        .padStart(setting.PostIdRandomLength, "0");
      parts.push(random);
    }

    parts.push(setting.PostIdCounter.toString().padStart(setting.PostIdPadLength, "0"));

    if (setting.PostIdSuffix) {
      parts.push(setting.PostIdSuffix);
    }

    this.jobPostId = parts.join("");

    next();
  } catch (error) {
    next(error);
  }
});

// const jobPostModel = model("jobPost", jobPostingModelSchema);

// export default jobPostModel;


const jobPostModel = mongoose.models.jobPost || model("jobPost", jobPostingModelSchema);
export default jobPostModel;