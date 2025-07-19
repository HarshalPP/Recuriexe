const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const jobPostingModelSchema = new Schema(
  {
    employmentTypeId: { type: ObjectId, ref: "employmentType" },
    // workLocationId: [{ type: ObjectId, ref: "newworklocation", default: null }],
    departmentId: { type: ObjectId, ref: "newdepartment" },
    branchId: [{ type: ObjectId, ref: "newbranch" }],
    createdByHrId: { type: ObjectId, ref: "employee", default: null }, //employe id
    position: { type: String, required: [true, "Position Is Required"] },
    eligibility: { type: String, required: [true, "Eligibility Is Required"] },
    experience: { type: String, required: [true, "Experience Is Required"] },
    noOfPosition: {
      type: Number,
      required: [true, "No of positions Is Required"],
    },
    budget: { type: String, required: [true, "Budget Is Required"] },
    budgetType: {
      type: String,
      enum: ["Monthly","LPA"],
    },
    jobDescriptionId: { type: ObjectId, default: null ,ref: "jobDescription"},
    // jobDescription: {
    //   type: String,
    //   required: [true, "Job description Is Required"],
    // },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const jobPostModel = mongoose.model("jobPost", jobPostingModelSchema);

module.exports = jobPostModel;
