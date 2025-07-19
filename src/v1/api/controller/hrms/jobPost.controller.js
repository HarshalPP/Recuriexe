const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const jobPostModel = require("../../model/hrms/jobPosting.model");
const departmentModel = require("../../model/adminMaster/department.model");
const branchModel = require("../../model/adminMaster/branch.model");
const locationModel = require("../../model/adminMaster/workLocation.model");
const companyModel = require("../../model/adminMaster/company.model");

// ------------------HRMS  Add JobPost ---------------------------------------

async function jobPostAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    if (req.body.position) {
      req.body.position = req.body.position.toLowerCase().trim();
    }
    if (req.body.department) {
      req.body.department = req.body.department.toUpperCase().trim();
    }
    if (req.body.branch) {
      req.body.branch = req.body.branch.toLowerCase().trim();
    }
    if (req.body.location) {
      req.body.location = req.body.location.toLowerCase().trim();
    }
    const jobPost = await jobPostModel.create(req.body);
    // console.log("ds", jobPost);
    success(res, "Job Post Added Successfully", jobPost);
  } catch (error) {
    // console.log(error);
    unknownError(res, error);
  }
}

// ------------------HRMS  View All JobPost ---------------------------------------
async function getAllJobPost(req, res) {
  try {
    let jobPostDetails = await jobPostModel.find({
      status: "active",
    });
    let departmentData = {};
    jobPostDetails.forEach((job) => {
      if (!departmentData[job.department]) {
        departmentData[job.department] = [];
      }
      departmentData[job.department].push(job);
    });

    // Convert grouped data into an array format
    let departments = Object.keys(departmentData);
    let jobPostsByDepartment = departments.map((department) => ({
      department: department,
      jobs: departmentData[department],
    }));
    // console.log("jobDetail", jobPostDetails);
    success(res, "All job post details", jobPostsByDepartment);
  } catch (error) {
    // console.log("error", error);
    unknownError(res, error);
  }
}

// ------------------HRMS  get department for  JobPost form ---------------------------------------
async function getDepartment(req, res) {
  try {
    let companyDetails = await companyModel.findOne({
      companyName: "fin coopers capital pvt ltd",
    });
    // console.log(companyDetails._id);
    let departmentDetails = await departmentModel.find({
      companyId: companyDetails._id,
    });
    success(res, "All department details", departmentDetails);
  } catch (error) {
    // console.log("error", error);
    unknownError(res, error);
  }
}

// // ------------------HRMS  get branch for  JobPost form ---------------------------------------

async function getBranch(req, res) {
  try {
    let branchDetails = await branchModel.find({
      companyId: "66baf67198a133b4d782bea6",
    });
    success(res, "All branch details", branchDetails);
  } catch (error) {
    // console.log("error", error);
    unknownError(res, error);
  }
}
// // ------------------get location for  JobPost forms ---------------------------------------

async function getWorkLocation(req, res) {
  try {
    let locationDetails = await locationModel.find({
      companyId: "66baf67198a133b4d782bea6",
    });
    success(res, "All location details", locationDetails);
  } catch (error) {
    // console.log("error", error);
    unknownError(res, error);
  }
}

module.exports = {
  jobPostAdd,
  getAllJobPost,
  getDepartment,
  getBranch,
  getWorkLocation,
};
