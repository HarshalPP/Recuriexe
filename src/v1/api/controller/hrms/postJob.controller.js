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

const branchModel = require("../../model/adminMaster/newBranch.model");
const departmentModel = require("../../model/adminMaster/newDepartment.model");
const designationModel = require("../../model/adminMaster/newDesignation.model");
const locationModel = require("../../model/adminMaster/newWorkLocation.model");
const jobDescriptionModel=require("../../model/hrms/jobDescription.model");
const vacancyRequestModel = require("../../model/hrms/vacancyRequest.model");
// const departmentModel = require("../../model/adminMaster/department.model");
// const branchModel = require("../../model/adminMaster/branch.model");
// const locationModel = require("../../model/adminMaster/workLocation.model");
// const companyModel = require("../../model/adminMaster/company.model");

const vacancyModel = require("../../model/hrms/vacancyRequest.model");
const employmentTypeModel = require("../../model/adminMaster/employmentType.model");
const { sendEmail,hrmsSendEmail } = require("../functions.Controller");
const { jobPostGoogleSheet } = require("../hrms/hrmsGoogleSheet.controller");
const employeModel = require("../../model/adminMaster/employe.model");
const cron = require("node-cron");
const moment = require("moment");
// //-----------------------------------------------------------------------------

cron.schedule("00 09 * * *", async () => {
  try {
    const notTakenAction = await vacancyRequestModel
      .find({
        status: "active",
        jobPostCreated: "no",
        vacancyApproval: "approved",
        vacancyType: "request",
      })
      .populate({
        path: "jobDescriptionId",
        select: "_id position status",
      })
      .populate({
        path: "createdByManagerId",
        select: "_id employeName workEmail reportingManagerId status",
      })
      .populate({
        path: "departmentId",
        select: "_id name status",
      });
console.log("pppp");
    const now = moment();

    // Filter vacancies created more than 24 hours ago
    const overdueVacancies = notTakenAction.filter((vacancy) => {
      const createdAt = moment(vacancy.createdAt);
      const diffInHours = now.diff(createdAt, "hours");
      return diffInHours >= 24;
    });

    if (overdueVacancies.length > 0) {
      const toEmails = process.env.HR3_EMAIL;
      const ccEmails = "";

      const tableRows = overdueVacancies
        .map((vacancy) => {
          return `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">${vacancy.jobDescriptionId.position}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${vacancy.departmentId.name}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${vacancy.createdByManagerId.employeName}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date(vacancy.createdAt).toLocaleDateString('en-US', {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</td>
            </tr>`;
        })
        .join("");

      const msg = `
        <div style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
            
            <p style="font-size: 16px; color: #000;">Dear HR,</p>
            <p style="font-size: 16px; color: #000;">
              This is a reminder that the following <b>${overdueVacancies.length}</b> vacancy requests have not been converted into job posts:
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #ddd;">
              <tr style="background-color: #f4f4f4;">
                <th style="padding: 10px; border: 1px solid #ddd;">Position</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Department</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Requested By</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Requested Date</th>
              </tr>
              ${tableRows}
            </table>
            
            <p style="font-size: 16px; color: #000; margin-top: 20px;">
              Please <a href="https://finexe.fincooper.in/hrms/talantAquisition/jobPost/managerPostVacancy/" style="color: #000; text-decoration: underline;">review and approve</a> these requests at your earliest convenience.
            </p>
            
            <p style="font-size: 16px; color: #000;">Thank you.</p>
            
            <p style="font-size: 14px; color: #555; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px;">
              This is a system-generated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `;

      hrmsSendEmail(
        toEmails,
        ccEmails,
        "Pending Vacancy Requests for Job Post Creation",
        msg,
        ""
      );

      console.log(
        `Email sent to ${toEmails} for ${overdueVacancies.length} overdue vacancy requests.`
      );
    } else {
      console.log("No overdue vacancy requests found.");
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

// ------------------HRMS  Add JobPost ---------------------------------------

async function jobPostAdd(req, res) {
  try {
    const errors = validationResult(req);
    const vacancyId = req.body.vacancyId;
    console.log(vacancyId);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    if (!vacancyId) {
      return badRequest(res, "Vacancy Request Id Is Required");
    }

    const vacancy = await vacancyModel.findById(vacancyId);

    if (!vacancy) {
      return badRequest(res, "Vacancy Request Not Found");
    }
    if (vacancy.vacancyType==="recommended") {
      return badRequest(res, "Vacancy Type Recommended cannot have job post");
    }
    if (vacancy.jobPostId) {
      return badRequest(res, "Job Post already created for this Vacancy Request");
    }

    if (vacancy.vacancyApproval !== "approved") {
      return badRequest(res, "Vacancy Request Approval Pending");
    }

    req.body.createdByHrId = req.Id;
    const jobPost = new jobPostModel(req.body);
    await jobPost.save();

    //update the status of vacancy request to created to keep track that job post created from vacancy request
    const jobApplyFormStatus = await vacancyModel.findByIdAndUpdate(
      { _id: vacancyId },
      { jobPostId: jobPost.id, jobPostCreated:"yes"},
      { new: true }
    );

    //get interviewer details through token
    const toEmails = process.env.HR3_EMAIL;
    const ccEmails = process.env.MARKETING_EMAIL;

    console.log(toEmails);
    const baseURL = process.env.BASE_URL;
    const department = await departmentModel.findById(jobPost.departmentId);
    const employmentType = await employmentTypeModel.findById(
      jobPost.employmentTypeId
    );
    const branchIds = jobPost.branchId; // This is an array of ObjectIds
    const branches = await branchModel.find({
      _id: { $in: branchIds },
    });
    const branchNames = branches.map((branch) => branch.name); // Change 'branchName' to the actual field name in your branch model
    const jobDesc = await jobDescriptionModel.findById(jobPost.jobDescriptionId);
    // console.log(department);
    // console.log(employmentType);
    // console.log(branchNames);
    let msg = `<div class="container" style="font-family: Arial, sans-serif; margin: 20px; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
    <h1 style="color: #333;">New Job Post Created</h1>
    <p>Dear HR Team,</p>
    <p>We are excited to inform you that a new job post has been created in the system. Here are the details:</p>
    
    <h2 style="color: #555;">Job Details:</h2>
    <ul style="list-style-type: none; padding: 0;">
        <li><strong>Position:</strong> ${jobPost.position}</li>
        <li><strong>Department:</strong> ${department.name}</li>
        <li><strong>Location:</strong> ${branchNames.join(
          ", "
        )}</li> <!-- Convert array to comma-separated string -->
        <li><strong>Eligibility:</strong> ${jobPost.eligibility}</li>
        <li><strong>Experience Required:</strong> ${
          jobPost.experience
        } years</li>
        <li><strong>Budget:</strong> ${jobPost.budget}</li>
        <li><strong>Employment Type:</strong> ${employmentType.title}</li>
        <li><strong>Job Description:</strong> ${jobDesc.jobDescription}</li>
    </ul>
    
      <div class="footer" style="margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; color: #777;">
        <p>This is an automated message. Please do not reply.</p>
      </div>
    </div>`;

    const employementTypeById = await employmentTypeModel.findById(jobPost.employmentTypeId);
   const employementTypeName = employementTypeById?.title ? employementTypeById.title : "Not Available";

    const departmentById = await departmentModel.findById(jobPost.departmentId);
    const departmentName = departmentById?.name? departmentById.name: "Not Available";

    const jobDescriptionId = await jobDescriptionModel.findById(jobPost.jobDescriptionId);
    const jobDescriptionName = jobDescriptionId?.jobDescription? jobDescriptionId.jobDescription: "Not Available";
    await jobPostGoogleSheet(
      jobPost,
      branchNames.join(
        ", "
      ),
      employementTypeName,
      departmentName,
      jobDescriptionName,
    );
    hrmsSendEmail(toEmails, ccEmails, "New Job Post Created", msg, "");
    console.log(ccEmails);
    success(res, "Job Post Added Successfully", jobPost);
  } catch (error) {
    console.error("Error adding job post:", error);
    unknownError(res, error);
  }
}
// ------------------HRMS  Add JobPost ---------------------------------------

async function jobPostUpdate(req, res) {
  try {
    const errors = validationResult(req);
    const vacancyId = req.body.vacancyId;
    const jobPostId = req.body.jobPostId;
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    // Find the existing job post by ID
    const jobPostData = await jobPostModel.findById(jobPostId);
    if (!jobPostData) {
      return badRequest({ message: "Job post not found" });
    }

    const jobPost =
    await jobPostModel.findByIdAndUpdate(
      jobPostId,
      { $set: req.body },
      { new: true}
    );
    //update the status of vacancy request to created to keep track that job post created from vacancy request
    if (vacancyId) {
      const jobApplyFormStatus = await vacancyModel.findByIdAndUpdate(
        { _id: vacancyId },
        { jobPostId: jobPost.id },
        { new: true }
      );
    }

    //get interviewer details through token
    const toEmails = process.env.HR3_EMAIL;
    const ccEmails = process.env.MARKETING_EMAIL;

    console.log(toEmails);
    const baseURL = process.env.BASE_URL;
    const department = await departmentModel.findById(jobPost.departmentId);
    const employmentType = await employmentTypeModel.findById(
      jobPost.employmentTypeId
    );
    const branchIds = jobPost.branchId; // This is an array of ObjectIds
    const branches = await branchModel.find({
      _id: { $in: branchIds },
    });
    const branchNames = branches.map((branch) => branch.name); // Change 'branchName' to the actual field name in your branch model
    const jobDesc = await jobDescriptionModel.findById(jobPost.jobDescriptionId);

    // console.log(department);
    // console.log(employmentType);
    // console.log(branchNames);
    let msg = `<div class="container" style="font-family: Arial, sans-serif; margin: 20px; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
    <h1 style="color: #333;">Job Post Updated</h1>
    <p>Dear HR Team,</p>
    <p>A job post has been updated in the system. Here are the details:</p>
    
    <h2 style="color: #555;">Job Details:</h2>
    <ul style="list-style-type: none; padding: 0;">
        <li><strong>Position:</strong> ${jobPost.position}</li>
        <li><strong>Department:</strong> ${department.name}</li>
        <li><strong>Location:</strong> ${branchNames.join(
          ", "
        )}</li> <!-- Convert array to comma-separated string -->
        <li><strong>Eligibility:</strong> ${jobPost.eligibility}</li>
        <li><strong>Experience Required:</strong> ${
          jobPost.experience
        } years</li>
        <li><strong>Budget:</strong> ${jobPost.budget}</li>
        <li><strong>Employment Type:</strong> ${employmentType.title}</li>
        <li><strong>Job Description:</strong> ${jobDesc.jobDescription}</li>
    </ul>
    
      <div class="footer" style="margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; color: #777;">
        <p>This is an automated message. Please do not reply.</p>
      </div>
    </div>`;
    
    const employementTypeById = await employmentTypeModel.findById(jobPost.employmentTypeId);
    const employementTypeName = employementTypeById?.title ? employementTypeById.title : "Not Available";
 
     const departmentById = await departmentModel.findById(jobPost.departmentId);
     const departmentName = departmentById?.name? departmentById.name: "Not Available";

     const jobDescriptionId = await jobDescriptionModel.findById(jobPost.jobDescriptionId);
     const jobDescriptionName = jobDescriptionId?.jobDescription? jobDescriptionId.jobDescription: "Not Available";
     await jobPostGoogleSheet(
       jobPost,
       branchNames.join(
         ", "
       ),
       employementTypeName,
       departmentName,
       jobDescriptionName
     );
     hrmsSendEmail(toEmails, ccEmails, "New Job Post Updated", msg, "");
    console.log(ccEmails);
    success(res, "Job Post updated Successfully", );
  } catch (error) {
    console.error("Error adding job post:", error);
    unknownError(res, error);
  }
}

//------------------HRMS  get all job post details ---------------------------------------

async function getAllJobPost(req, res) {
  try {
    let jobPostList = await jobPostModel.aggregate([
      {
        $match: { status: "active" }, // Match only active status
      },
      {
        $lookup: {
          from: "newdepartments", // Collection name
          localField: "departmentId", // Field in jobPostModel
          foreignField: "_id", // Field in departments collection
          as: "department", // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: "$department",
          preserveNullAndEmptyArrays: true, // Allow null values in case no match is found
        }, // Unwind the department array to object
      },

      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch", // Keep branches as an array
        },
      },

      {
        $lookup: {
          from: "employmenttypes",
          localField: "employmentTypeId",
          foreignField: "_id",
          as: "employmentType",
        },
      },
      {
        $unwind: { path: "$employmentType", preserveNullAndEmptyArrays: true }, // Unwind employmentType array to object
      },
      {
        $lookup: {
          from: "employees", // Collection name
          localField: "createdByHrId", // Field in jobPostModel
          foreignField: "_id", // Field in departments collection
          as: "createdByHr", // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: "$createdByHr",
          preserveNullAndEmptyArrays: true, // Allow null values in case no match is found
        }, // Unwind the department array to object
      },
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "_id", // Assuming jobPostId is the _id of the current document
          foreignField: "jobPostId", // Corrected foreignField
          as: "jobId",
        },
      },
      { 
        $unwind: { path: "$jobId", preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: "jobdescriptions", // Collection name
          localField: "jobDescriptionId", // Field in jobPostModel
          foreignField: "_id", // Field in departments collection
          as: "jobDescription", // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: "$jobDescription",
          preserveNullAndEmptyArrays: true, // Allow null values in case no match is found
        }, // Unwind the department array to object
      },
      {
        $sort: {
          createdAt: -1, // Sorts by creation date in descending order (newest first)
        },
      },
      {
        $project: {
          _id: 1,
          position: 1,
          eligibility: 1,
          experience: 1,
          noOfPosition: 1,
          budget: 1,
          budgetType:1,
          status: 1,
          jobDescription: { _id: 1, jobDescription: 1 },
          createdByHr: { _id: 1, employeName: 1 },
          department: { _id: 1, name: 1 },
          branch: { _id: 1, name: 1 }, // Keep branch as an array of objects
          employmentType: { _id: 1, title: 1 },
          jobId:{_id: 1, company: 1 },
        },
      },
    ]);

    success(res, "All job post List", jobPostList);
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
}

//------------------Website  get all job post details ---------------------------------------

async function getJobPostWebsite(req, res) {
  try {
    let jobPostList = await jobPostModel.aggregate([
      {
        $match: { status: "active" }, // Match only active status
      },
      {
        $lookup: {
          from: "newbranches", // Collection name for branches
          localField: "branchId", // Field in jobPostModel (an array of ObjectIds)
          foreignField: "_id", // Match each branch ID with the _id in branches
          as: "branches", // Alias for the joined branches data
        },
      },
      {
        $addFields: {
          branches: { $ifNull: ["$branches", []] }, // Ensure branches is always an array, even if no matches are found
        },
      },
      {
        $lookup: {
          from: "newworklocations", // Collection name for branches
          localField: "workLocationId", // Field in jobPostModel (an array of ObjectIds)
          foreignField: "_id", // Match each branch ID with the _id in branches
          as: "worklocations", // Alias for the joined branches data
        },
      },
      {
        $addFields: {
          worklocations: { $ifNull: ["$worklocations", []] }, // Ensure branches is always an array, even if no matches are found
        },
      },
      {
        $lookup: {
          from: "employmenttypes",
          localField: "employmentTypeId",
          foreignField: "_id",
          as: "employmentType",
        },
      },
      {
        $unwind: {
          path: "$employmentType", // Unwind employmentType to get an object
          preserveNullAndEmptyArrays: true,
        }, // Allow null values in case no match is found
      },
      {
        $lookup: {
          from: "newdepartments", // Collection name
          localField: "departmentId", // Field in jobPostModel
          foreignField: "_id", // Field in departments collection
          as: "department", // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: "$department", // Unwind the department array to object
          preserveNullAndEmptyArrays: true,
        }, // Allow null values in case no match is found
      },
      {
        $lookup: {
          from: "jobdescriptions", // Collection name
          localField: "jobDescriptionId", // Field in jobPostModel
          foreignField: "_id", // Field in departments collection
          as: "jobDescription", // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: "$jobDescription",
          preserveNullAndEmptyArrays: true, // Allow null values in case no match is found
        }, // Unwind the department array to object
      },
      {
        $sort: {
          createdAt: -1, // Sorts by creation date in descending order (newest first)
        },
      },
      {
        $project: {
          _id: 1,
          position: 1,
          eligibility: 1,
          experience: 1,
          noOfPosition: 1,
          budget: 1,
          budgetType:1,
          // jobDescription: 1,
          status: 1,
          department: { _id: 1, name: 1 },
          jobDescription: { _id: 1, jobDescription: 1,position:1 },
          workLocation: { _id: 1, name: 1 },
          employmentType: { _id: 1, title: 1 },
          createdAt: 1,
          // Project branch fields
          branches: {
            $map: {
              input: "$branches", // The array of branches joined from the lookup
              as: "branch", // Variable for each element in the branches array
              in: {
                _id: "$$branch._id", // Branch ID
                branch: "$$branch.name", // Add any other fields you want
                state: "$$branch.state", // Add any other fields you want
                // Add more fields if needed
              },
            },
          },
          worklocations: {
            $map: {
              input: "$worklocations", // The array of branches joined from the lookup
              as: "worklocations", // Variable for each element in the branches array
              in: {
                _id: "$$worklocations._id", // Branch ID
                worklocation: "$$worklocations.name", // Add any other fields you want
                address: "$$worklocations.address", // Add any other fields you want
                // Add more fields if needed
              },
            },
          },
        },
      },
    ]);

    success(res, "All job posts grouped by department", jobPostList);
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
}

//------------------HRMS  get job post details ---------------------------------------

async function getJobPostDetail(req, res) {
  try {
    const { jobPostId } = req.query;
    const jobPostDetail = await jobPostModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(jobPostId) },
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      {
        $lookup: {
          from: "newworklocations",
          localField: "workLocationId",
          foreignField: "_id",
          as: "workLocation",
        },
      },
      {
        $lookup: {
          from: "employmenttypes",
          localField: "employmentTypeId",
          foreignField: "_id",
          as: "employmentType",
        },
      },
      {
        $sort: {
          createdAt: -1, // Sorts by creation date in descending order (newest first)
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          position: 1,
          eligibility: 1,
          experience: 1,
          noOfPosition: 1,
          budget: 1,
          jobDescription: 1,
          status: 1,
          department: {
            _id: 1,
            name: 1,
          },
          branch: {
            _id: 1,
            name: 1,
          },
          workLocation: {
            _id: 1,
            name: 1,
          },
          employmentType: {
            _id: 1,
            title: 1,
          },
        },
      },
    ]);

    success(res, "Job post Detail", jobPostDetail[0]);
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
}

//------------------HRMS  get department by company ---------------------------------------

async function getDepartmentByCompany(req, res) {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid companyId format" });
    }

    const companyDetails = await companyModel.findById(companyId);

    if (!companyDetails) {
      return res.status(404).json({ message: "Company not found" });
    }

    const departmentDetails = await departmentModel.find({
      companyId: companyDetails._id,
    });
    success(res, "All department details", departmentDetails);
  } catch (error) {
    console.error("Error fetching department details:", error);
    unknownError(res, error);
  }
}

//------------------HRMS  active/inactive for  JobPost form ---------------------------------------

async function jobPostActiveOrInactive(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const id = req.body.id;
      const status = req.body.status;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      if (status == "active") {
        const jobPostUpdateStatus = await jobPostModel.findByIdAndUpdate(
          { _id: id },
          { status: "active" },
          { new: true }
        );
        success(res, "Job Post Active", jobPostUpdateStatus);
      } else if (status == "inactive") {
        const jobPostUpdateStatus = await jobPostModel.findByIdAndUpdate(
          { _id: id },
          { status: "inactive" },
          { new: true }
        );
        success(res, "Job Post inactive", jobPostUpdateStatus);
      } else {
        return badRequest(res, "Status must be 'active' or 'inactive'");
      }
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//------------------HRMS  get branch for  JobPost form ---------------------------------------

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

//------------------get location for  JobPost forms ---------------------------------------

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

//------------------HRMS  get JobPost work location website data ---------------------------------------

async function getJobPostBranchWebsite(req, res) {
  try {
    const branchId = req.body.branchId;
    let result = {};

    const getWorkLocations = async (branchIds) => {
      // console.log("companyId, branchIds,:", companyId, branchIds);
      if (typeof branchIds === "string") {
        branchIds = branchIds.split(","); // Split by comma
      }
      // Function to check if a string is a valid ObjectId
      const isValidObjectId = (id) =>
        mongoose.Types.ObjectId.isValid(id) &&
        new mongoose.Types.ObjectId(id).toString() === id;

      // Filter out invalid ObjectId strings
      const validBranchIds = branchIds.filter((id) =>
        isValidObjectId(id.trim())
      );

      if (!validBranchIds.length) {
        return res
          .status(400)
          .json({ message: "No valid branch IDs provided" });
      }
      const filter = {
        ...(branchIds && {
          branchId: {
            $in: Array.isArray(branchIds)
              ? branchIds.map((id) => new mongoose.Types.ObjectId(id)) // Use map only if it's an array
              : [new mongoose.Types.ObjectId(branchIds)], // If it's a single ID, convert it to an array
          },
        }),
        status: "active",
      };
      let locations = await locationModel.find(filter);
      const jobPost = await jobPostModel.findById(req.body.jobPostId);

      // Filter locations where _id matches jobPost's workLocationId
      locations = locations.filter((location) =>
        jobPost.workLocationId.includes(location._id.toString())
      );
      // console.log("locations:", locations);
      result.locationsCount = locations.length;
      // console.log("locationsCount:", result.locationsCount);

      result.locations = locations.map((location) => ({
        _id: location._id,
        locationName: location.title,
        branchId: location.branchId,
        address: location.address,
        status: location.status,
      }));
    };

    if (branchId) {
      await getWorkLocations(branchId);
    }

    success(res, "Data fetched successfully", result);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//------------------HRMS  get JobPost form data ---------------------------------------

async function getJobPostData(req, res) {
  try {
    const { companyId, branchIds, departmentId } = req.query;

    // if(!companyId){
    //   return badRequest(res, "company id required")
    // }

    let result = {};

    const getcompany = async () => {
      const company = await companyModel.find({ status: "active" });
      // console.log('company',company)
      result.companyCount = company.length;
      result.company = company.map((company) => ({
        _id: company._id,
        company: company.companyName,
      }));
    };

    const getBranches = async (companyId) => {
      const filter = companyId ? { companyId, status: "active" } : {};
      const branches = await branchModel.find(filter);
      result.branchCount = branches.length;
      result.branches = branches.map((branch) => ({
        _id: branch._id,
        branch: branch.branch,
        status: branch.status,
      }));
    };

    const getWorkLocations = async (companyId, branchIds) => {
      // console.log("companyId, branchIds,:", companyId, branchIds);
      if (typeof branchIds === "string") {
        branchIds = branchIds.split(","); // Split by comma
      }
      // Function to check if a string is a valid ObjectId
      const isValidObjectId = (id) =>
        mongoose.Types.ObjectId.isValid(id) &&
        new mongoose.Types.ObjectId(id).toString() === id;

      // Filter out invalid ObjectId strings
      const validBranchIds = branchIds.filter((id) =>
        isValidObjectId(id.trim())
      );

      if (!validBranchIds.length) {
        return res
          .status(400)
          .json({ message: "No valid branch IDs provided" });
      }
      const filter = {
        ...(branchIds && {
          branchId: {
            $in: Array.isArray(branchIds)
              ? branchIds.map((id) => new mongoose.Types.ObjectId(id)) // Use map only if it's an array
              : [new mongoose.Types.ObjectId(branchIds)], // If it's a single ID, convert it to an array
          },
        }),
        status: "active",
      };
      const locations = await locationModel.find(filter);

      // console.log("locations:", locations);
      result.locationsCount = locations.length;
      // console.log("locationsCount:", result.locationsCount);

      result.locations = locations.map((location) => ({
        _id: location._id,
        locationName: location.title,
        branchId: location.branchId,
        status: location.status,
      }));
    };

    // const getWorkLocations = async (branchId) => {
    //   const filter = {
    //     ...(branchId && { branchId: new mongoose.Types.ObjectId(branchId) }),
    //     status: "active",
    //   };
    //   const workLocations = await locationModel.find(filter);
    //   result.workLocationCount = workLocations.length;

    //   result.workLocations = workLocations.map((workLocation) => ({
    //     _id: workLocation._id,
    //     workLocation: workLocation.title,
    //     branchId: workLocation.branchId,
    //     status: workLocation.status,
    //   }));
    // };

    // const filter = {
    //   ...(companyId && { companyId: new mongoose.Types.ObjectId(companyId) }),
    //   ...(branchId && { branchId: new mongoose.Types.ObjectId(branchId) }),
    //   ...(workLocationId && {
    //     workLocationId: new mongoose.Types.ObjectId(workLocationId),
    //   }),
    // };

    const getDepartments = async (companyId, branchIds) => {
      // console.log("companyId, branchIds,:", companyId, branchIds);
      if (typeof branchIds === "string") {
        branchIds = branchIds.split(","); // Split by comma
      }

      // Function to check if a string is a valid ObjectId
      const isValidObjectId = (id) =>
        mongoose.Types.ObjectId.isValid(id) &&
        new mongoose.Types.ObjectId(id).toString() === id;

      // Filter out invalid ObjectId strings
      const validBranchIds = branchIds.filter((id) =>
        isValidObjectId(id.trim())
      );

      if (!validBranchIds.length) {
        return res
          .status(400)
          .json({ message: "No valid branch IDs provided" });
      }
      const filter = {
        ...(companyId && { companyId: new mongoose.Types.ObjectId(companyId) }),
        ...(branchIds && {
          branchId: {
            $in: Array.isArray(branchIds)
              ? branchIds.map((id) => new mongoose.Types.ObjectId(id)) // Use map only if it's an array
              : [new mongoose.Types.ObjectId(branchIds)], // If it's a single ID, convert it to an array
          },
        }),
        status: "active",
      };
      const departments = await departmentModel.find(filter);

      // console.log("departments:", departments);
      result.departmentCount = departments.length;
      result.departments = departments.map((department) => ({
        _id: department._id,
        departmentName: department.departmentName,
        branchId: department.branchId,
        status: department.status,
      }));
    };

    if (!companyId && !branchIds && !departmentId) {
      await getcompany();
    } else if (companyId && !branchIds && !departmentId) {
      await getBranches(companyId);
    } else if (companyId && branchIds && !departmentId) {
      await getBranches(companyId);
      await getDepartments(companyId, branchIds);
      await getWorkLocations(companyId, branchIds);
    } else if (companyId && branchIds && !departmentId) {
      await getBranches(companyId);
      await getDepartments(companyId, branchIds);
      await getWorkLocations(companyId, branchIds);
    } else if (companyId && branchIds && departmentId) {
      await getBranches(companyId);
      await getDepartments(companyId, branchIds);
      await getWorkLocations(companyId, branchIds);
    }

    success(res, "Data fetched successfully", result);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------HRMS jobPost ---------------------------------------

async function getJobPostById(req, res) {
  try {
    const jobPostId = req.query.jobPostId;
    // { path: "jobApplyFormId", select: "name position resume " }
    let jobPost = await jobPostModel.findById(jobPostId)
      .populate("employmentTypeId")
      .populate({path:"branchId",select:"_id name status"})
    .populate({path:"departmentId",select:"_id name status"});

    success(res, "Job post data", jobPost);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------HRMS  add JobDescription ---------------------------------------

async function addJobDescription(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const { position, jobDescription } = req.body;
    if (!position || position.trim() === "" || !jobDescription || jobDescription.trim() === "") {
      return badRequest(res, "Position and jobDescription are required fields and cannot be empty.");
    }

    req.body.createdById = req.Id;

    // Check if the position already exists
    const existingPosition = await jobDescriptionModel.findOne({
      position: position.trim(), // To avoid leading/trailing space issues
    });

    if (existingPosition) {
      return badRequest(res, "Position already exists.");
    }
    const jobDescriptionData = await jobDescriptionModel.create(req.body);
    // console.log("ds", jobPost);
    success(res, "Job Description Added Successfully",jobDescriptionData );
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------HRMS  get JobDescription ---------------------------------------

async function getJobDescription(req, res) {
  try {
    
    const jobDescription = await jobDescriptionModel.find({status:'active'})
    .sort({ position: 1 }); ;
    // console.log("ds", jobPost);
    success(res, "Job Description Data", jobDescription);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------HRMS  add JobDescription ---------------------------------------

async function updateJobDescription(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    jobDescriptionId = req.body.jobDescriptionId; 
    req.body.updatedById = req.Id; 
    const position = await jobDescriptionModel.findOne({
      position: req.body.position,
    });
    // console.log(position._id);
    if (position && !position._id.equals(req.body.jobDescriptionId)) {
      return badRequest(res, "Position Already Exists");
    }
     // Find and update the job description
     const updatedJobDescription = await jobDescriptionModel.findByIdAndUpdate(
      jobDescriptionId,
      req.body,
      { new: true } 
    );

    // console.log("ds", updatedJobDescription);
    success(res, "Job Description Updated Successfully", updatedJobDescription);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//---------------------------------------------------------------------------

async function sendMailToManager(req, res) {
  try {
    const errors = validationResult(req);
    const vacancyId = req.body.vacancyId;
    
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    // Find the existing job post by ID
    const vacancyData = await vacancyModel.findById(vacancyId).populate("jobDescriptionId");
    if(vacancyData.recommendMail==="send"){
      return badRequest(res, "Mail already send to manager");
    }
    const manager = await employeModel.findById(vacancyData.createdByManagerId); 
    //get interviewer details through token
    const toEmails = manager.workEmail;
    
    console.log(toEmails);
    const baseURL = process.env.BASE_URL;
    const department = await departmentModel.findById(vacancyData.departmentId);
    const employmentType = await employmentTypeModel.findById(
      vacancyData.employmentTypeId
    );
    const branchIds = vacancyData.branchId; // This is an array of ObjectIds
    const branches = await branchModel.find({
      _id: { $in: branchIds },
    });
    const branchNames = branches.map((branch) => branch.name); // Change 'branchName' to the actual field name in your branch model

    // console.log(department);
    // console.log(employmentType);
    // console.log(branchNames);
    let msg = `<div class="container" style="font-family: Arial, sans-serif; margin: 20px; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
    <h1 style="color: #333;">Vacancy Request Approved</h1>
    <p>Dear ${manager.employeName},</p>
    <p>Your vacancy request has been approved.Please recommend candidate for the vacancy request. Here are the details:</p>
    
    <h2 style="color: #555;">Vacancy Request Details:</h2>
    <ul style="list-style-type: none; padding: 0;">
        <li><strong>Position:</strong> ${vacancyData.jobDescriptionId.position}</li>
        <li><strong>Department:</strong> ${department.name}</li>
        <li><strong>Location:</strong> ${branchNames.join(
          ", "
        )}</li> <!-- Convert array to comma-separated string -->
        <li><strong>Eligibility:</strong> ${vacancyData.eligibility}</li>
        <li><strong>Experience Required:</strong> ${
          vacancyData.experience
        } years</li>
        <li><strong>Budget:</strong> ${vacancyData.package}</li>
        <li><strong>Employment Type:</strong> ${employmentType.title}</li>
        <li><strong>Job Description:</strong> ${vacancyData.jobDescriptionId.jobDescription}</li>
    </ul>
    
      <div class="footer" style="margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; color: #777;">
        <p>This is an automated message. Please do not reply.</p>
      </div>
    </div>`;
    
    await vacancyModel.findByIdAndUpdate(
      { _id: vacancyId },
      { recommendMail: "send" },
      { new: true }
    );
     
    hrmsSendEmail(toEmails, "", "Vacancy Request Approved", msg, "");
    
    success(res, "Mail send Successfully", );
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

module.exports = {
  jobPostAdd,
  jobPostUpdate,
  getAllJobPost,
  getJobPostWebsite,
  getJobPostDetail,
  getDepartmentByCompany,
  jobPostActiveOrInactive,
  getBranch,
  getWorkLocation,
  getJobPostData,
  getJobPostBranchWebsite,
  getJobPostById,
  addJobDescription,
  getJobDescription,
  updateJobDescription,
  sendMailToManager,
};
