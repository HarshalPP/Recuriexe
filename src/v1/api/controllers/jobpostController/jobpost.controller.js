import { badRequest, serverValidation, success, unknownError } from "../../formatters/globalResponse.js"
import jobPostModel from "../../models/jobPostModel/jobPost.model.js"
import jobApply from "../../models/jobformModel/jobform.model.js"
import vacancyRequestModel from "../../models/vacencyModel/vacancyRequest.model.js"
import jobDescriptionModel from "../../models/jobdescriptionModel/jobdescription.model.js"
import employmentTypeModel from "../../models/employeementTypemodel/employeementtype.model.js"
import departmentModel from "../../models/deparmentModel/deparment.model.js"
import branchModel from "../../models/branchModel/branch.model.js"
import employeModel from "../../models/employeemodel/employee.model.js"
import designationModel from "../../models/designationModel/designation.model.js"
import DepartmentBudget from "../../models/budgedModel/budged.model.js"
import BudgetModel from "../../models/budgedModel/budged.model.js"
import roleModel from "../../models/RoleModel/role.model.js"
import jobPostingsetting from "../../models/settingModel/jobPostsetting.model.js"
import organizationPlanModel from "../../models/PlanModel/organizationPlan.model.js";
import mongoose from "mongoose"
const ObjectId = mongoose.Types.ObjectId;
import PlanModel from "../../models/PlanModel/Plan.model.js"
import { generateJobPostExcelAndUpload } from "../../Utils/excelUploader.js"
import { createFolder, saveFileFromUrl } from "../../services/fileShareService/finalFileShare.services.js"
import portalSetUp from "../../models/PortalSetUp/portalsetup.js"
import folderSchema from "../../models/fileShare.model.js/folder.model.js"
import axios from 'axios';
import organizationModel from "../../models/organizationModel/organization.model.js";
import pincodeLocationModel from "../../models/pincodeLocation/pincodeLocation.model.js";
import moment from "moment-timezone";
import {createReport} from "../../controllers/verificationsuitController/manageReportCategory.controller.js"



// Helper function to convert package string to budget amount
const convertPackageToBudget = (packageString) => {
  if (!packageString) return 0;
  const cleanPackage = packageString.toString().replace(/[^\d.]/g, '');

  let amount = parseFloat(cleanPackage) || 0;
  amount = amount * 100000;
  return amount;
};


// Add Job post //

export const jobPostAdd = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    req.body.organizationId = organizationId
    req.body.createdByHrId = req.employee.id;
    const vacancyId = req.body.vacencyRequestId;
    if (!vacancyId) {
      return badRequest(res, "Vacancy Request Id Is Required");
    }

    const vacancy = await vacancyRequestModel.findById(vacancyId);




    const finddesingnation = await designationModel.findById(vacancy.designationId)

    if (!finddesingnation) {
      return badRequest(res, "desingation not found")
    }

    const findsubDepartment = await departmentModel.findOne({
      'subDepartments._id': vacancy.subDepartmentId
    });
    // if (!findsubDepartment) {
    //   return badRequest(res, "sub Department not found")
    // }

    req.body.position = finddesingnation.name || "null";


    if (!vacancy) {
      return badRequest(res, "Vacancy Request Not Found");
    }

    if (vacancy.vacancyType == "recommended") {
      return badRequest(res, "Vacancy Type Recommended cannot have job post");
    }

    if (vacancy.jobPostId) {
      return badRequest(res, "Job Post already created for this Vacancy Request");
    }

    const findBudget = await BudgetModel.findOne({
      departmentId: finddesingnation.subDepartmentId,
      organizationId: organizationId,
      desingationId: finddesingnation._id
    });

    if (!findBudget || findBudget.allocatedBudget === 0 || findBudget.numberOfEmployees === 0) {
      return badRequest(res, "Please set budget first");
    }

    // Budget validation logic //
    // const packageAmount = req.body.package || req.body.budget || req.body.salary;

    // if (!packageAmount) {
    //   return badRequest(res, "Package/Budget amount is required");
    // }

    //   const requiredBudget = convertPackageToBudget(packageAmount);
    //   console.log("Required Budget:", requiredBudget);


    //   const numberOfPositions = req.body.noOfPosition || 1;
    //   const totalRequiredBudget = requiredBudget * numberOfPositions;


    // // Find budget allocation for this designation and department
    // const budgetAllocation = await BudgetModel.findOne({
    //   organizationId: new mongoose.Types.ObjectId(req.employee.organizationId),
    //   departmentId: vacancy.departmentId,
    //   desingationId: vacancy.designationId,
    //   status: "active"
    // });

    // if (!budgetAllocation) {
    //   return badRequest(res, "No budget allocation found for this department and designation combination");
    // }

    //   // Calculate available budget
    // const allocatedBudget = budgetAllocation.allocatedBudget || 0;
    // const holdingBudget = budgetAllocation.HoldingBudget || 0;
    // const availableBudget = allocatedBudget - holdingBudget;


    // if( totalRequiredBudget > availableBudget) {
    //   return badRequest(res, `Insufficient budget. Required: ${totalRequiredBudget}, Available: ${availableBudget}`);
    // }

    // req.body.Holdingbuged = availableBudget;


    req.body.budgetId = findBudget._id || null;
    const jobPost = new jobPostModel(req.body);
    await jobPost.save();


    // Budget validation logic end //
    //  const UpdateBudged = await BudgetModel.findByIdAndUpdate(
    //   budgetAllocation._id,
    //   {
    //     HoldingBudget: availableBudget
    //   },
    //   { new: true }
    // )

    // ENd of the budget validation logic //


    await vacancyRequestModel.findByIdAndUpdate(
      vacancyId,
      { jobPostId: jobPost.id, jobPostCreated: "yes" },
      { new: true }
    );


    //   console.log(ccEmails);
    return success(res, "Job Post Added Successfully", jobPost);
  } catch (error) {
    console.error("Error adding job post:", error);
    return unknownError(res, error);
  }
};




// Add Job post Directly //

export const jobPostAddDirect = async (req, res) => {
  try {
    req.body.organizationId = req.employee.organizationId;
    req.body.createdByHrId = req.employee.id;

  const ReportName = req.body.reportName;
  const categories = req.body.categories
  const newOrg = req.employee.organizationId;

    const { noOfPosition } = req.body
    const employeeDetails = await employeModel
      .findById(req.employee.id)
      .populate({
        path: 'roleId',
        model: 'role',
      });

    const roleDetails = await roleModel.findById(employeeDetails.roleId[0]._id).select('roleName jobPostApprove');

    let jobPostStatus = "pending";
    // Define the allowed roles (in lowercase)
    const autoApproveRoles = ['admin', 'productowner', 'superadmin'];
    if (roleDetails) {
      const roleName = roleDetails.roleName?.toLowerCase();
      if (autoApproveRoles.includes(roleName)) {
        // jobPostStatus = "active";
      } else if (roleDetails?.RecruitmentHiring?.jobPostDashboard?.jobPostApprove) {
        jobPostStatus = "active";
      }
    }
    // Optional: validate required fields
    const requiredFields = ['designationId', 'departmentId', 'subDepartmentId'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return badRequest(res, `${field} is required`);
      }
    }

    const NewOrg = req.employee.organizationId;
    // ✅ Check active plan for organization
    const activePlan = await organizationPlanModel.findOne({ organizationId: NewOrg, isActive: true });
    if (!activePlan) {
      return badRequest(res, "No active plan found for this organization. Please contact support.");
    }
    const createdAt = new Date(activePlan?.PlanDate);
    const expiryDate = new Date(createdAt);
    expiryDate.setDate(expiryDate.getDate() + (activePlan.planDurationInDays || 0));

    if (new Date() > expiryDate) {
      return badRequest(res, "Plan has expired. Please renew or upgrade your plan.");
    }

    // ✅ Calculate plan validity window
    const planStart = new Date(activePlan.PlanDate);
    const planEnd = new Date(planStart);
    planEnd.setDate(planEnd.getDate() + (activePlan.planDurationInDays || 0));

    // ✅ Count only job posts created within the current plan window
    const currentJobPostCount = await jobPostModel.countDocuments({
      organizationId: NewOrg,
      createdAt: { $gte: planStart, $lt: planEnd },
    });

    if (currentJobPostCount >= activePlan.NumberOfJobPosts) {
      return badRequest(
        res,
        `Job post limit reached , Please upgrade your plan.`
      );
    }


    // Fetch designation name if not passed explicitly as position
    const findDesignation = await designationModel.findById(req.body.designationId);
    if (!findDesignation) {
      return badRequest(res, "Designation not found");
    }
    req.body.position = findDesignation.name;

    const findBudget = await BudgetModel.findOne({
      // departmentId: findDesignation.subDepartmentId,
      desingationId: new ObjectId(findDesignation._id),
      organizationId: new ObjectId(req.employee.organizationId),
    });

    if (!findBudget || findBudget.allocatedBudget === 0 || findBudget.numberOfEmployees === 0) {
      return badRequest(res, "Please set budget first");
    }

    const userBudget = Number(req.body.budget);

    if (isNaN(userBudget) || userBudget <= 0) {
      return badRequest(res, "Invalid budget amount");
    }


    // Update usedBudget
    findBudget.usedBudget = (findBudget.usedBudget || 0) + userBudget;
    findBudget.jobPostForNumberOfEmployees = (findBudget?.jobPostForNumberOfEmployees || 0) + noOfPosition;
    // Optional: check if usedBudget exceeds allocatedBudget
    // console.log('findBudget.usedBudget',findBudget.usedBudget,"findBudget.allocatedBudget",findBudget.allocatedBudget)
    if (findBudget.usedBudget > findBudget.allocatedBudget) {
      return badRequest(res, "Used budget exceeds allocated budget");
    }

    // console.log('noOfPosition + findBudget.jobPostForNumberOfEmployees', findBudget.jobPostForNumberOfEmployees)
    // if ((findBudget.jobPostForNumberOfEmployees) > findBudget.numberOfEmployees) {
    //   return badRequest(res, `Total job posts cannot exceed allocated employees`)
    //   // return badRequest(res , "No of Position cannot be greater than allocated Employees budget")
    // }
    // save budget data 
    await findBudget.save();
    req.body.budgetId = findBudget._id || null;
    const jobPost = new jobPostModel(req.body);
    await jobPost.save();

    // ✅ Decrease NumberOfJobPosts from active plan
    if (activePlan.NumberOfJobPosts > 0) {
      const Updateservice = await organizationPlanModel.findOneAndUpdate(
        { organizationId: NewOrg },
        { $inc: { NumberOfJobPosts: -1 } }, // Decrement the count
        { new: true }
      );
    }

    //  Auto-create folder using designation name
    const formatFolderName = (name) => {
      return name
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('_');
    };
    const rootFolderKey = 'job-posts';
    let parentId;

    // Step 1: Check if root folder exists
    let folderSchemaDetail = await folderSchema.findOne({
      organizationId: new ObjectId(req.body.organizationId),
      key: rootFolderKey
    });

    // Step 2: If not exists, create root folder manually
    if (!folderSchemaDetail) {
      console.log('create ')
      const newRootFolder = new folderSchema({
        organizationId: req.body.organizationId,
        candidateId: null,
        parentId: null,
        name: 'job-posts',
        type: 'folder',
        key: rootFolderKey,
        mimetype: 'application/x-directory',
        status: 'active',
      });

      const createRootFolder = await newRootFolder.save();
      parentId = createRootFolder._id;
    } else {
      console.log('created ')
      parentId = folderSchemaDetail._id;
    }

    // ✅ Step 3: Create subfolder (designation + jobPostId)
    const folderPath = `${rootFolderKey}/${formatFolderName(findDesignation.name)}_${jobPost.jobPostId}/`;

    // Inject parentId into req.body
    req.body.parentId = parentId;
    req.body.candidateId = null; // if you're also linking to a candidate

    const createFolderResult = await createFolder(folderPath, req);

    // if(ReportName && categories && newOrg){
    // const Report = await createReport({ReportName , categories , newOrg})
    // }


    return success(res, "Job Post Added Successfully", jobPost);
  } catch (error) {
    console.error("Error adding direct job post:", error);
    return unknownError(res, error);
  }
};


// export const jobPostapproveAndReject = async (req, res) => {
//   try {
//     const { jobPostId, status, remark } = req.body;
//     const employeeId = req.employee.id;

//     if (!jobPostId) {
//       return badRequest(res, "Job Post ID is required.");
//     }

//     // Step 1: Get employee with role
//     const employeeDetails = await employeModel
//       .findById(employeeId)
//       .select('employeName roleId')
//       .populate({ path: 'roleId', model: 'role' });

//     if (!employeeDetails || !employeeDetails.roleId || !employeeDetails.roleId.length) {
//       return badRequest(res, "Employee or role not found.");
//     }

//     const roleDetails = employeeDetails.roleId[0];
//     const allowedRoles = ['admin', 'productowner', 'superadmin'];
//     const roleName = roleDetails.roleName?.toLowerCase();

//     const isAllowed =
//       allowedRoles.includes(roleName) || roleDetails.jobPostApprove === true;

//     if (!isAllowed) {
//       return badRequest(res, "You are not authorized to approve or reject job posts.");
//     }

//     // Step 2: Validate inputs
//     if (!["approve", "reject"].includes(status)) {
//       return badRequest(res, "Invalid status. Must be 'approve' or 'reject'.");
//     }

//     if (status === "reject" && (!remark || remark.trim() === "")) {
//       return badRequest(res, "Remark is required when rejecting.");
//     }

//     // Step 3: Fetch current job post
//     const jobPost = await jobPostModel.findById(jobPostId);
//     if (!jobPost) {
//       return badRequest(res, "Job post not found.");
//     }

//     if (jobPost.status === "active" && status === "approve") {
//       return badRequest(res, "Job post is already approved.");
//     }

//     if (jobPost.status === "reject" && status === "reject") {
//       return badRequest(res, "Job post is already rejected.");
//     }

//     // Step 4: Update job post
//     const updateData = {
//       status: status === "approve" ? "active" : "reject",
//       jobPostApproveEmployeeId: employeeId,
//       jobPostApproveDate: new Date(),
//       jobPostApproveRemark: remark,
//     };

//     const updatedJobPost = await jobPostModel.findByIdAndUpdate(
//       jobPostId,
//       { $set: updateData },
//       { new: true }
//     );

//     updateData.employeeName = employeeDetails.employeName;
//     delete updateData.jobPostApproveEmployeeId;

//     return success(res, `Job post ${status}d successfully.`, {
//       data: updateData,
//     });
//   } catch (error) {
//     console.error("Job post update error:", error);
//     return unknownError(res, "Server error", error);
//   }
// };


export const jobPostapproveAndReject = async (req, res) => {
  try {
    const { jobPostIds, status, remark } = req.body;
    const employeeId = req.employee.id;

    if (!Array.isArray(jobPostIds) || jobPostIds.length === 0) {
      return badRequest(res, "jobPostIds must be a non-empty array.");
    }

    if (!["approve", "reject"].includes(status)) {
      return badRequest(res, "Invalid status. Must be 'approve' or 'reject'.");
    }

    if (status === "reject" && (!remark || remark.trim() === "")) {
      return badRequest(res, "Remark is required when rejecting.");
    }

    // Step 1: Get employee and role
    const employeeDetails = await employeModel
      .findById(employeeId)
      .select('employeName roleId')
      .populate({ path: 'roleId', model: 'role' });

    if (!employeeDetails || !employeeDetails.roleId || !employeeDetails.roleId.length) {
      return badRequest(res, "Employee or role not found.");
    }

    const roleDetails = employeeDetails.roleId[0];
    const allowedRoles = ['admin', 'productowner', 'superadmin'];
    const roleName = roleDetails.roleName?.toLowerCase();
    const isAllowed = roleDetails?.RecruitmentHiring?.jobPostDashboard.jobPostApprove == true;

    if (!isAllowed) {
      return badRequest(res, "You are not authorized to approve or reject job posts.");
    }

    // Step 2: Loop through each jobPostId
    const results = [];

    for (const jobPostId of jobPostIds) {
      const jobPost = await jobPostModel.findById(jobPostId);

      if (!jobPost) {
        return badRequest(res, "Job post not found.");

      }

      if (jobPost.status === "active" && status === "approve") {
        return badRequest(res, "Job post already approved.");
      }

      if (jobPost.status === "reject" && status === "reject") {
        return badRequest(res, "Job post already rejected.");
      }

      const updateData = {
        status: status === "approve" ? "active" : "reject",
        jobPostApproveEmployeeId: employeeId,
        jobPostApproveDate: new Date(),
        jobPostApproveRemark: remark,
      };

      try {
        await jobPostModel.findByIdAndUpdate(jobPostId, { $set: updateData });
        results.push({
          status: updateData.status,
          approvedBy: employeeDetails.employeName,
        });
      } catch (err) {
        console.error(`Failed to update job post ${jobPostId}:`, err);
        results.push({ _id: jobPostId, success: false, message: "Update failed." });
      }
    }

    return success(res, `job post ${status} Succesful`, results);
  } catch (error) {
    console.error("Job post bulk update error:", error);
    return unknownError(res, "Server error", error);
  }
};



// export const getAllJobPost = async (req, res) => {
//   try {

//     const {
//       jobTitle,
//       departmentId,
//       branchIds,
//       employmentTypeId,
//       experienceFrom,
//       experienceTo,
//       status,
//       jobPostExpired
//     } = req.query;

//     const matchStage = {};

//     if (!jobPostExpired || jobPostExpired === "false") {
//       matchStage.jobPostExpired = false
//     } else if (jobPostExpired === "true") {
//       matchStage.jobPostExpired = true
//     }
//     // Job Title - partial match, tolerant of spacing
//     if (jobTitle) {
//       matchStage.position = { $regex: jobTitle, $options: "i" };
//     }

//     if (departmentId) {
//       matchStage.departmentId = new mongoose.Types.ObjectId(departmentId);
//     }

//     let branchObjectIds = [];
//     if (branchIds) {
//       branchObjectIds = branchIds
//         .split(",")
//         .map(id => id.trim())
//         .filter(id => mongoose.Types.ObjectId.isValid(id))
//         .map(id => new mongoose.Types.ObjectId(id));
//     }


//     if (branchObjectIds.length > 0) {
//       matchStage.branchId = { $in: branchObjectIds };
//     }

//     // console.log("matchStage.branch.$elemMatch._id:", JSON.stringify(matchStage.branch.$elemMatch._id));



//     if (employmentTypeId) {
//       matchStage.employmentTypeId = new mongoose.Types.ObjectId(employmentTypeId);
//     }

//     // Experience filter (parse "5 Yrs" → 5)
//     // if (experienceFrom || experienceTo) {
//     //   matchStage.$expr = matchStage.$expr || {};
//     //   const extractYears = {
//     //     $toDouble: {
//     //       $arrayElemAt: [
//     //         { $split: [{ $ifNull: ["$experience", "0"] }, " "] },
//     //         0
//     //       ]
//     //     }
//     //   };

//     //   const rangeFilter = [];
//     //   if (experienceFrom) {
//     //     rangeFilter.push({ $gte: [extractYears, parseFloat(experienceFrom)] });
//     //   }
//     //   if (experienceTo) {
//     //     rangeFilter.push({ $lte: [extractYears, parseFloat(experienceTo)] });
//     //   }

//     //   if (rangeFilter.length === 1) {
//     //     matchStage.$expr = rangeFilter[0];
//     //   } else if (rangeFilter.length === 2) {
//     //     matchStage.$expr = { $and: rangeFilter };
//     //   }
//     // }


//     const jobPostList = await jobPostModel.aggregate([
//       { $match: matchStage },
//       {
//         $lookup: {
//           from: "newdepartments",
//           localField: "departmentId",
//           foreignField: "_id",
//           as: "department",
//         },
//       },
//       {
//         $unwind: { path: "$department", preserveNullAndEmptyArrays: true },
//       },

//       {
//         $lookup: {
//           from: "newdepartments",
//           let: { subDeptId: "$subDepartmentId" },
//           pipeline: [
//             { $unwind: "$subDepartments" },
//             {
//               $match: {
//                 $expr: {
//                   $eq: ["$subDepartments._id", "$$subDeptId"]
//                 }
//               }
//             },
//             {
//               $project: {
//                 _id: "$subDepartments._id",
//                 name: "$subDepartments.name"
//               }
//             }
//           ],
//           as: "subDepartment"
//         }
//       },
//       { $unwind: { path: "$subDepartment", preserveNullAndEmptyArrays: true } },


//       {
//         $lookup: {
//           from: "newdesignations",
//           localField: "designationId",
//           foreignField: "_id",
//           as: "desingnation",
//         },
//       },


//       {
//         $lookup: {
//           from: "newbranches",
//           localField: "branchId",
//           foreignField: "_id",
//           as: "branch",
//         },
//       },
//       {
//         $lookup: {
//           from: "employmenttypes",
//           localField: "employmentTypeId",
//           foreignField: "_id",
//           as: "employmentType",
//         },
//       },
//       {
//         $unwind: { path: "$employmentType", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: "newworklocations",
//           localField: "Worklocation",
//           foreignField: "_id",
//           as: "Worklocation",
//         }
//       },

//       {
//         $lookup: {
//           from: "employeetypes",
//           localField: "employeeTypeId",
//           foreignField: "_id",
//           as: "employeeType",
//         },
//       },
//       { $unwind: { path: "$employeeType", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "employees",
//           localField: "createdByHrId",
//           foreignField: "_id",
//           as: "createdByHr",
//         },
//       },
//       {
//         $unwind: { path: "$createdByHr", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: "vacancyrequests",
//           localField: "_id",
//           foreignField: "jobPostId",
//           as: "jobId",
//         },
//       },
//       {
//         $unwind: { path: "$jobId", preserveNullAndEmptyArrays: true },
//       },

//       // Lookup for vacancyRequest by vacancyRequestId
//       {
//         $lookup: {
//           from: "vacancyrequests",
//           localField: "vacancyRequestId",
//           foreignField: "_id",
//           as: "vacancyRequest",
//         },
//       },
//       {
//         $unwind: { path: "$vacancyRequest", preserveNullAndEmptyArrays: true },
//       },


//       {
//         $lookup: {
//           from: "qualifications",
//           localField: "qualificationId",
//           foreignField: "_id",
//           as: "qualification",
//         },
//       },
//       // Lookup jobDescription inside vacancyRequest
//       {
//         $lookup: {
//           from: "jobdescriptions",
//           localField: "vacancyRequest.jobDescriptionId",
//           foreignField: "_id",
//           as: "vacancyJobDescription",
//         },
//       },
//       {
//         $unwind: {
//           path: "$vacancyJobDescription",
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       {
//         $lookup: {
//           from: "jobdescriptions",
//           localField: "jobDescriptionId",
//           foreignField: "_id",
//           as: "jobDescription",
//         },
//       },
//       {
//         $unwind: {
//           path: "$jobDescription",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "organizations",
//           localField: "organizationId",
//           foreignField: "_id",
//           as: "organization",
//         },
//       },
//       {
//         $unwind: { path: "$organization", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $addFields: {
//           daysOld: {
//             $round: [{
//               $divide: [
//                 { $subtract: [new Date(), "$createdAt"] },
//                 1000 * 60 * 60 * 24
//               ]
//             }]
//           }
//         }
//       },
//       { $sort: { createdAt: -1 } },
//       {
//         $project: {
//           _id: 1,
//           position: 1,
//           // eligibility: 1,
//           daysOld: 1,
//           numberOfApplicant: 1,
//           totalApplicants: 1,
//           experience: 1,
//           noOfPosition: 1,
//           Worklocation: 1,
//           InterviewType: 1,
//           package: 1,
//           budget: 1,
//           budgetType: 1,
//           status: 1,
//           AgeLimit: 1,
//           gender: 1,
//           jobDescription: { _id: 1, jobDescription: 1 },
//           createdByHr: { _id: 1, employeName: 1 },
//           department: { _id: 1, name: 1 },
//           subDepartment: { _id: 1, name: 1 },
//           desingnation: { _id: 1, name: 1 },
//           organization: { _id: 1, name: 1 },
//           branch: { _id: 1, name: 1, address: 1 },
//           Worklocation: { _id: 1, name: 1 },
//           employmentType: { _id: 1, title: 1 },
//           qualification: 1,
//           employeeType: { _id: 1, title: 1 },
//           jobId: { _id: 1, company: 1 },
//           vacancyRequest: {
//             _id: 1,
//             vacancyType: 1,
//             vacancyApproval: 1,
//           },
//           vacancyJobDescription: {
//             _id: 1,
//             position: 1,
//             jobDescription: 1,
//           },
//           AI_Percentage: 1,
//           MaxAI_Score: 1,
//           MinAI_Score: 1,
//           AI_Screening: 1,
//           createdAt: 1,
//         },
//       },
//     ]);

//     success(res, "All job post List", jobPostList);
//   } catch (error) {
//     console.error("Error:", error);
//     unknownError(res, error);
//   }
// };


export const getAllJobPost = async (req, res) => {
  try {

    const {
      jobTitle,
      departmentId,
      branchIds,
      employmentTypeId,
      experienceFrom,
      experienceTo,
      status,
      // jobPostExpired,
      JobType,
      page = 1,
      limit = 50,
      organizationId
    } = req.query;

    const matchStage = {};

    // if (!jobPostExpired || jobPostExpired === "false") {
    //   matchStage.jobPostExpired = false
    // } else if (jobPostExpired === "true") {
    //   matchStage.jobPostExpired = true
    // }
    // Job Title - partial match, tolerant of spacing
    if (jobTitle) {
      matchStage.position = { $regex: jobTitle, $options: "i" };
    }

    if (status) {
      matchStage.status = status
    } else {
      matchStage.status = 'active';
    }

    if (JobType) {
      matchStage.JobType = { $regex: JobType, $options: "i" };
    }

    if (departmentId) {
      matchStage.departmentId = new mongoose.Types.ObjectId(departmentId);
    }

    matchStage.organizationId = new mongoose.Types.ObjectId(organizationId);

    let branchObjectIds = [];
    if (branchIds) {
      branchObjectIds = branchIds
        .split(",")
        .map(id => id.trim())
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));
    }


    if (branchObjectIds.length > 0) {
      matchStage.branchId = { $in: branchObjectIds };
    }

    // console.log("matchStage.branch.$elemMatch._id:", JSON.stringify(matchStage.branch.$elemMatch._id));



    if (employmentTypeId) {
      matchStage.employmentTypeId = new mongoose.Types.ObjectId(employmentTypeId);
    }


    const skip = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = parseInt(limit);



    const jobPostList = await jobPostModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: { path: "$department", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "newdepartments",
          let: { subDeptId: "$subDepartmentId" },
          pipeline: [
            { $unwind: "$subDepartments" },
            {
              $match: {
                $expr: {
                  $eq: ["$subDepartments._id", "$$subDeptId"]
                }
              }
            },
            {
              $project: {
                _id: "$subDepartments._id",
                name: "$subDepartments.name"
              }
            }
          ],
          as: "subDepartment"
        }
      },
      { $unwind: { path: "$subDepartment", preserveNullAndEmptyArrays: true } },


      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "desingnation",
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
          from: "employmenttypes",
          localField: "employmentTypeId",
          foreignField: "_id",
          as: "employmentType",
        },
      },
      {
        $unwind: { path: "$employmentType", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "newworklocations",
          localField: "Worklocation",
          foreignField: "_id",
          as: "Worklocation",
        }
      },

      {
        $lookup: {
          from: "employeetypes",
          localField: "employeeTypeId",
          foreignField: "_id",
          as: "employeeType",
        },
      },
      { $unwind: { path: "$employeeType", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "employees",
          localField: "createdByHrId",
          foreignField: "_id",
          as: "createdByHr",
        },
      },
      {
        $unwind: { path: "$createdByHr", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "_id",
          foreignField: "jobPostId",
          as: "jobId",
        },
      },
      {
        $unwind: { path: "$jobId", preserveNullAndEmptyArrays: true },
      },

      // Lookup for vacancyRequest by vacancyRequestId
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "vacancyRequestId",
          foreignField: "_id",
          as: "vacancyRequest",
        },
      },
      {
        $unwind: { path: "$vacancyRequest", preserveNullAndEmptyArrays: true },
      },


      {
        $lookup: {
          from: "qualifications",
          localField: "qualificationId",
          foreignField: "_id",
          as: "qualification",
        },
      },
      // Lookup jobDescription inside vacancyRequest
      {
        $lookup: {
          from: "jobdescriptions",
          localField: "vacancyRequest.jobDescriptionId",
          foreignField: "_id",
          as: "vacancyJobDescription",
        },
      },
      {
        $unwind: {
          path: "$vacancyJobDescription",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "jobdescriptions",
          localField: "jobDescriptionId",
          foreignField: "_id",
          as: "jobDescription",
        },
      },
      {
        $unwind: {
          path: "$jobDescription",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization",
        },
      },
      {
        $unwind: { path: "$organization", preserveNullAndEmptyArrays: true },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          jobPostId: 1,
          JobType: 1,
          position: 1,
          // eligibility: 1,
          experience: 1,
          numberOfApplicant: 1,
          expiredDate: 1,
          totalApplicants: 1,
          noOfPosition: 1,
          Worklocation: 1,
          InterviewType: 1,
          package: 1,
          budget: 1,
          budgetType: 1,
          status: 1,
          AgeLimit: 1,
          gender: 1,
          jobDescription: { _id: 1, jobDescription: 1 },
          createdByHr: { _id: 1, employeName: 1 },
          department: { _id: 1, name: 1 },
          subDepartment: { _id: 1, name: 1 },
          desingnation: { _id: 1, name: 1 },
          organization: { _id: 1, name: 1 },
          branch: { _id: 1, name: 1, address: 1 },
          Worklocation: { _id: 1, name: 1 },
          employmentType: { _id: 1, title: 1 },
          qualification: 1,
          employeeType: { _id: 1, title: 1 },
          jobId: { _id: 1, company: 1 },
          vacancyRequest: {
            _id: 1,
            vacancyType: 1,
            vacancyApproval: 1,
          },
          vacancyJobDescription: {
            _id: 1,
            position: 1,
            jobDescription: 1,
          },
          AI_Percentage: 1,
          MaxAI_Score: 1,
          MinAI_Score: 1,
          AI_Screening: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },

      {
        $facet: {
          data: [{ $skip: skip }, { $limit: pageLimit }],
          totalCount: [{ $count: "count" }]
        }
      }
    ]);

    const data = jobPostList[0]?.data || [];
    const totalCount = jobPostList[0]?.totalCount[0]?.count || 0;

    success(res, "All job Post List", {
      data,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / pageLimit)
    });
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
};




export const getAllJobPostBypermission = async (req, res) => {
  try {

    const {
      jobTitle,
      departmentId,
      branchIds,
      employmentTypeId,
      experienceFrom,
      experienceTo,
      status,
      jobPostExpired,
      JobType,
      showAllDashbBoardData,
      page = 1,
      limit = 50,
      period = 'all', startDate: queryStartDate, endDate: queryEndDate,
    } = req.query;

    const matchStage = {};

    if (status && status !== "all") {
      matchStage.status = status
    }
    const createdByHrId = req.employee.id
    const organizationId = req.employee.organizationId
    const Role = req.employee.roleName[0];
    // if (!jobPostExpired || jobPostExpired === "false") {
    //   matchStage.jobPostExpired = false
    // } else if (jobPostExpired === "true") {
    //   matchStage.jobPostExpired = true
    // }
    // Job Title - partial match, tolerant of spacing
    if (jobTitle) {
      matchStage.position = { $regex: jobTitle, $options: "i" };
    }

    // // Sort By Created post data //

    // if (typeof Role == "string" && Role.toLowerCase() !== "admin") {
    //  matchStage.createdByHrId = new mongoose.Types.ObjectId(createdByHrId);
    //  }

    let startDate, endDate;
    const periodInDays = parseInt(period); // ✅ Only one declaration here

    if (period !== 'all') {
      if (isNaN(periodInDays) || periodInDays <= 0) {
        return badRequest(res, "Invalid period value.");
      }

      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      startDate = new Date();
      startDate.setDate(endDate.getDate() - periodInDays);
      startDate.setHours(0, 0, 0, 0);

      matchStage.createdAt = { $gte: startDate, $lte: endDate };

    } else if (queryStartDate && queryEndDate) {
      if (queryStartDate !== 'all' && queryEndDate !== 'all') {
        // ✅ Convert and validate custom dates
        startDate = new Date(`${queryStartDate}T00:00:00.000Z`);
        endDate = new Date(`${queryEndDate}T23:59:59.999Z`);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return badRequest(res, "Invalid date format.");
        }

        matchStage.createdAt = { $gte: startDate, $lte: endDate };
      }
    }

    // console.log('matchStage',matchStage)
    if (JobType) {
      matchStage.JobType = { $regex: JobType, $options: "i" };
    }

    if (departmentId) {
      matchStage.departmentId = new mongoose.Types.ObjectId(departmentId);
    }

    if (organizationId) {
      matchStage.organizationId = new mongoose.Types.ObjectId(organizationId);
    }


    if (departmentId) {
      matchStage.departmentId = new mongoose.Types.ObjectId(departmentId);
    }

    if (showAllDashbBoardData !== "all") {
      matchStage.createdByHrId = new ObjectId(createdByHrId);
    }

    // console.log('matchStage',matchStage)
    let branchObjectIds = [];
    if (branchIds) {
      branchObjectIds = branchIds
        .split(",")
        .map(id => id.trim())
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));
    }


    if (branchObjectIds.length > 0) {
      matchStage.branchId = { $in: branchObjectIds };
    }

    // console.log("matchStage.branch.$elemMatch._id:", JSON.stringify(matchStage.branch.$elemMatch._id));



    if (employmentTypeId) {
      matchStage.employmentTypeId = new mongoose.Types.ObjectId(employmentTypeId);
    }


    const skip = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = parseInt(limit);



    const jobPostList = await jobPostModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: { path: "$department", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "newdepartments",
          let: { subDeptId: "$subDepartmentId" },
          pipeline: [
            { $unwind: "$subDepartments" },
            {
              $match: {
                $expr: {
                  $eq: ["$subDepartments._id", "$$subDeptId"]
                }
              }
            },
            {
              $project: {
                _id: "$subDepartments._id",
                name: "$subDepartments.name"
              }
            }
          ],
          as: "subDepartment"
        }
      },
      { $unwind: { path: "$subDepartment", preserveNullAndEmptyArrays: true } },


      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "desingnation",
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
          from: "employmenttypes",
          localField: "employmentTypeId",
          foreignField: "_id",
          as: "employmentType",
        },
      },
      {
        $unwind: { path: "$employmentType", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "newworklocations",
          localField: "Worklocation",
          foreignField: "_id",
          as: "Worklocation",
        }
      },

      {
        $lookup: {
          from: "employeetypes",
          localField: "employeeTypeId",
          foreignField: "_id",
          as: "employeeType",
        },
      },
      { $unwind: { path: "$employeeType", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "employees",
          localField: "createdByHrId",
          foreignField: "_id",
          as: "createdByHr",
        },
      },
      {
        $unwind: { path: "$createdByHr", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "_id",
          foreignField: "jobPostId",
          as: "jobId",
        },
      },
      {
        $unwind: { path: "$jobId", preserveNullAndEmptyArrays: true },
      },

      // Lookup for vacancyRequest by vacancyRequestId
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "vacancyRequestId",
          foreignField: "_id",
          as: "vacancyRequest",
        },
      },
      {
        $unwind: { path: "$vacancyRequest", preserveNullAndEmptyArrays: true },
      },


      {
        $lookup: {
          from: "qualifications",
          localField: "qualificationId",
          foreignField: "_id",
          as: "qualification",
        },
      },
      // Lookup jobDescription inside vacancyRequest
      {
        $lookup: {
          from: "jobdescriptions",
          localField: "vacancyRequest.jobDescriptionId",
          foreignField: "_id",
          as: "vacancyJobDescription",
        },
      },
      {
        $unwind: {
          path: "$vacancyJobDescription",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "jobdescriptions",
          localField: "jobDescriptionId",
          foreignField: "_id",
          as: "jobDescription",
        },
      },
      {
        $unwind: {
          path: "$jobDescription",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization",
        },
      },
      {
        $unwind: { path: "$organization", preserveNullAndEmptyArrays: true },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          jobPostId: 1,
          JobType: 1,
          position: 1,
          // eligibility: 1,
          experience: 1,
          numberOfApplicant: 1,
          expiredDate: 1,
          totalApplicants: 1,
          noOfPosition: 1,
          Worklocation: 1,
          InterviewType: 1,
          package: 1,
          budget: 1,
          budgetType: 1,
          status: 1,
          AgeLimit: 1,
          gender: 1,
          jobDescription: { _id: 1, jobDescription: 1 },
          createdByHr: { _id: 1, employeName: 1 },
          department: { _id: 1, name: 1 },
          subDepartment: { _id: 1, name: 1 },
          desingnation: { _id: 1, name: 1 },
          organization: { _id: 1, name: 1 },
          branch: { _id: 1, name: 1, address: 1 },
          Worklocation: { _id: 1, name: 1 },
          employmentType: { _id: 1, title: 1 },
          qualification: 1,
          employeeType: { _id: 1, title: 1 },
          jobId: { _id: 1, company: 1 },
          vacancyRequest: {
            _id: 1,
            vacancyType: 1,
            vacancyApproval: 1,
          },
          vacancyJobDescription: {
            _id: 1,
            position: 1,
            jobDescription: 1,
          },
          AI_Percentage: 1,
          MaxAI_Score: 1,
          MinAI_Score: 1,
          AI_Screening: 1,
          screeningCriteria: 1,
          createdAt: 1,
        },
      },

      {
        $facet: {
          data: [{ $skip: skip }, { $limit: pageLimit }],
          totalCount: [{ $count: "count" }]
        }
      }
    ]);

    const data = jobPostList[0]?.data || [];
    const totalCount = jobPostList[0]?.totalCount[0]?.count || 0;

    success(res, "All job post List", {
      data,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / pageLimit),
      totalJobPost: await jobPostModel.countDocuments(matchStage),
      totalActiveJobs: await jobPostModel.countDocuments({ ...matchStage, status: "active" }),
      totalInactiveJobs: await jobPostModel.countDocuments({ ...matchStage, status: "inactive" }),
      totalPending: await jobPostModel.countDocuments({ ...matchStage, status: "pending" }),
      totalPositions: await jobPostModel.aggregate([
        { $match: matchStage },
        { $group: { _id: null, totalPositions: { $sum: "$noOfPosition" } } }
      ])
    });
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
};

export const updateJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.employee.id
    const updateFields = req.body;

    const existingJobPost = await jobPostModel.findById(id);
    if (!existingJobPost) {
      return badRequest(res, "Job post not found");
    }
    const isStatusChanging = updateFields.status && updateFields.status !== existingJobPost.status;
    updateFields.updatedBy = employeeId
    const updatedJobPost = await jobPostModel.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (isStatusChanging && (updateFields.status === "inactive" || updateFields.status === "active")) {
      const budget = await BudgetModel.findOne({
        organizationId: updatedJobPost.organizationId,
        desingationId: updatedJobPost.designationId,
      });

      if (budget) {
        const budgetImpact = Number(existingJobPost.budget);
        if (updateFields.status === "inactive") {
          // Decrease usedBudget and jobPostForNumberOfEmployees
          budget.usedBudget = Math.max(0, budget.usedBudget - budgetImpact);
          budget.jobPostForNumberOfEmployees = Math.max(0, budget.jobPostForNumberOfEmployees - existingJobPost.noOfPosition);
        } else if (updateFields.status === "active") {
          // Increase usedBudget and jobPostForNumberOfEmployees
          budget.usedBudget += budgetImpact;
          budget.jobPostForNumberOfEmployees += existingJobPost.noOfPosition;
        }
        await budget.save();
      }


      // ✅ Update NumberOfJobPosts in organization's active plan
      const orgPlan = await organizationPlanModel.findOne({
        organizationId: updatedJobPost.organizationId,
        isActive: true,
      });

      if (
        orgPlan &&
        existingJobPost.status == "active" &&
        updateFields.status == "inactive" &&
        updatedJobPost.AI_Post == "false"
      ) {
        updatedJobPost.AI_Post = "true";
        await updatedJobPost.save();
        orgPlan.NumberOfJobPosts += 1;
        await orgPlan.save();
      }


      else if (orgPlan && existingJobPost.status == "inactive" && updateFields.status == "active") {
        updatedJobPost.AI_Post_New = "true";
        await updatedJobPost.save();
        orgPlan.NumberOfJobPosts -= 1;
        await orgPlan.save();
      }


    }



    success(res, "Job post updated successfully", updatedJobPost);
  } catch (error) {
    console.error("Update Job Post Error:", error);
    unknownError(res, error);
  }
};


export const getAllJobPostwithoutToken = async (req, res) => {
  try {
    const jobPostList = await jobPostModel.aggregate([
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: { path: "$department", preserveNullAndEmptyArrays: true },
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
          from: "employmenttypes",
          localField: "employmentTypeId",
          foreignField: "_id",
          as: "employmentType",
        },
      },
      {
        $unwind: { path: "$employmentType", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "employees",
          localField: "createdByHrId",
          foreignField: "_id",
          as: "createdByHr",
        },
      },
      {
        $unwind: { path: "$createdByHr", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "_id",
          foreignField: "jobPostId",
          as: "jobId",
        },
      },
      {
        $unwind: { path: "$jobId", preserveNullAndEmptyArrays: true },
      },

      // Lookup for vacancyRequest by vacancyRequestId
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "vacancyRequestId",
          foreignField: "_id",
          as: "vacancyRequest",
        },
      },
      {
        $unwind: { path: "$vacancyRequest", preserveNullAndEmptyArrays: true },
      },

      // Lookup jobDescription inside vacancyRequest
      {
        $lookup: {
          from: "jobdescriptions",
          localField: "vacancyRequest.jobDescriptionId",
          foreignField: "_id",
          as: "vacancyJobDescription",
        },
      },
      {
        $unwind: {
          path: "$vacancyJobDescription",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "jobdescriptions",
          localField: "jobDescriptionId",
          foreignField: "_id",
          as: "jobDescription",
        },
      },
      {
        $unwind: {
          path: "$jobDescription",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization",
        },
      },
      {
        $unwind: { path: "$organization", preserveNullAndEmptyArrays: true },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          position: 1,
          eligibility: 1,
          experience: 1,
          noOfPosition: 1,
          budget: 1,
          budgetType: 1,
          status: 1,
          jobDescription: { _id: 1, jobDescription: 1 },
          createdByHr: { _id: 1, employeName: 1 },
          department: { _id: 1, name: 1 },
          organization: { _id: 1, name: 1 },
          branch: { _id: 1, name: 1 },
          employmentType: { _id: 1, title: 1 },
          jobId: { _id: 1, company: 1 },
          vacancyRequest: {
            _id: 1,
            vacancyType: 1,
            vacancyApproval: 1,
          },
          vacancyJobDescription: {
            _id: 1,
            position: 1,
            jobDescription: 1,
          },
        },
      },
    ]);

    success(res, "All job post List", jobPostList);
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
};


export const getPostManDashBoard = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), period = 'all', showAllDashbBoardData, startDate: queryStartDate, endDate: queryEndDate } = req.query;

    const organizationId = req.employee.organizationId
    const createdByHrId = req.employee.id
    if (!organizationId) {
      return badRequest(res, "invalid token organizationId not found")
    }


    const commonMatchFilter = {
      organizationId: new ObjectId(organizationId),
    };


    if (showAllDashbBoardData !== "all") {
      commonMatchFilter.createdByHrId = new ObjectId(createdByHrId);
    }

    // console.log('commonMatchFilter',commonMatchFilter)
    // const dateMatchFilter = {};
    // let startDate;
    // let endDate = new Date()
    // const periodInDays = parseInt(period);

    // // Custom date range logic (if period === "all" and start/end dates provided)
    // if (period === 'all') {
    //   if (queryStartDate && queryEndDate && queryStartDate !== 'all' && queryEndDate !== 'all') {
    //     startDate = new Date(`${queryStartDate}T00:00:00.000Z`);
    //     endDate = new Date(`${queryEndDate}T23:59:59.999Z`);

    //     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    //       return badRequest(res, "Invalid date format.");
    //     }

    //     dateMatchFilter.createdAt = { $gte: startDate, $lte: endDate };
    //   }

    // } else {
    //   // Period-based date calculation
    //   if (isNaN(periodInDays) || periodInDays <= 0) {
    //     return badRequest(res, "Invalid period value.");
    //   }

    //   endDate = new Date();
    //   endDate.setHours(23, 59, 59, 999);

    //   startDate = new Date(endDate);
    //   startDate.setDate(endDate.getDate() - periodInDays);
    //   startDate.setHours(0, 0, 0, 0);

    //   dateMatchFilter.createdAt = { $gte: startDate, $lte: endDate };
    // }

    // // ✅ Calculate previous range only if both dates are defined
    // let previousStartDate = null;
    // let previousEndDate = null;

    // if (startDate && endDate && !isNaN(periodInDays)) {
    //   previousEndDate = new Date(startDate);
    //   previousEndDate.setDate(previousEndDate.getDate() - 1);

    //   previousStartDate = new Date(previousEndDate);
    //   previousStartDate.setDate(previousStartDate.getDate() - periodInDays);
    // }


    const dateMatchFilter = {};
    let startDate, endDate;
    let previousStartDate = null;
    let previousEndDate = null;

    if (period === 'all') {
      if (queryStartDate && queryEndDate && queryStartDate !== 'all' && queryEndDate !== 'all') {
        startDate = new Date(`${queryStartDate}T00:00:00.000Z`);
        endDate = new Date(`${queryEndDate}T23:59:59.999Z`);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return badRequest(res, "Invalid date format.");
        }

        dateMatchFilter.createdAt = { $gte: startDate, $lte: endDate };

        // 🟡 Calculate previous period for custom date range
        const diffInMs = endDate - startDate;
        previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        previousEndDate.setHours(23, 59, 59, 999);

        previousStartDate = new Date(previousEndDate - diffInMs);
        previousStartDate.setHours(0, 0, 0, 0);
      }

    } else {
      // Period-based date calculation
      const periodInDays = parseInt(period);
      if (isNaN(periodInDays) || periodInDays <= 0) {
        return badRequest(res, "Invalid period value.");
      }

      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - periodInDays);
      startDate.setHours(0, 0, 0, 0);

      dateMatchFilter.createdAt = { $gte: startDate, $lte: endDate };

      // Previous period
      previousEndDate = new Date(startDate);
      previousEndDate.setDate(previousEndDate.getDate() - 1);
      previousEndDate.setHours(23, 59, 59, 999);

      previousStartDate = new Date(previousEndDate);
      previousStartDate.setDate(previousStartDate.getDate() - periodInDays);
      previousStartDate.setHours(0, 0, 0, 0);
    }

    // console.log('dateMatchFilter', dateMatchFilter)
    const totalJobs = await jobPostModel.countDocuments({
      ...commonMatchFilter,
      ...dateMatchFilter,
      // createdAt: { $gte: startDate, $lte: endDate }
    });

    const totalJobsPending = await jobPostModel.countDocuments({
      ...commonMatchFilter,
      status: ['pending', 'reject'],
      ...dateMatchFilter,
      // jobPostExpired: false,
      // createdAt: { $gte: startDate, $lte: endDate }
    });

    const totalJobsReject = await jobPostModel.countDocuments({
      ...commonMatchFilter,
      status: 'reject',
      // jobPostExpired: false,
      // createdAt: { $gte: startDate, $lte: endDate }
      ...dateMatchFilter,
    });

    const totalInActiveJobs = await jobPostModel.countDocuments({
      ...commonMatchFilter,
      ...dateMatchFilter,
      status: 'inactive',
      // jobPostExpired: false
    });

    commonMatchFilter.status = 'active'
    const totalActiveJobs = await jobPostModel.countDocuments({
      ...commonMatchFilter,
      ...dateMatchFilter,
      // jobPostExpired: false
    });



    // 2. Total Open Positions (Vacancies - sum of all noOfPosition)
    const totalOpenPositionsResult = await jobPostModel.aggregate([
      {
        $match: {
          // createdAt: { $gte: startDate, $lte: endDate },
          ...dateMatchFilter,
          ...commonMatchFilter,
          // jobPostExpired: false
        }
      },
      {
        $group: {
          _id: null,
          totalVacancies: { $sum: "$noOfPosition" }
        }
      }
    ]);

    const totalOpenPositions = totalOpenPositionsResult[0]?.totalVacancies || 0;

    const newJobsCurrentPeriod = await jobPostModel.countDocuments({
      // jobPostExpired: false,
      ...commonMatchFilter,
      // createdAt: { $gte: startDate, $lte: endDate }
      ...dateMatchFilter,
    });

    const newJobsPreviousPeriod = await jobPostModel.countDocuments({
      ...commonMatchFilter,
      // jobPostExpired: false,
      createdAt: { $gte: previousStartDate, $lte: previousEndDate }
    });

    // 5. Expired Jobs in Current Period (Closed)
    const expiredJobsCurrentPeriod = await jobPostModel.countDocuments({
      // jobPostExpired: true,
      ...commonMatchFilter,
      expiredDate: { $gte: startDate, $lte: endDate }
    });

    // 6. Average Time Open (Days) - Calculate average days from creation to current date for active jobs
    const avgTimeOpenResult = await jobPostModel.aggregate([
      {
        $match: {
          ...commonMatchFilter,
          // jobPostExpired: true
        }
      },
      {
        $addFields: {
          daysOpen: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60 * 24 // Convert milliseconds to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDaysOpen: { $avg: "$daysOpen" }
        }
      }
    ]);
    const avgTimeOpen = Math.round(avgTimeOpenResult[0]?.avgDaysOpen || 0);

    // 7. Nearing Expiry (Jobs expiring in next 7 days)
    const nearingExpiryDate = new Date();
    nearingExpiryDate.setDate(nearingExpiryDate.getDate() + 7);

    const nearingExpiringJobs = await jobPostModel.countDocuments({
      ...commonMatchFilter,
      // jobPostExpired: false,
      expiredDate: {
        $gte: endDate,
        $lte: nearingExpiryDate
      }
    });

    // 8. Net Activity (Growth/Decline)
    const netActivity = newJobsCurrentPeriod - expiredJobsCurrentPeriod;

    // 9. Active Departments Count
    const activeDepartmentsResult = await jobPostModel.aggregate([
      {
        $match: {
          ...commonMatchFilter,
          // jobPostExpired: false
        }
      },
      {
        $group: {
          _id: "$departmentId"
        }
      },
      {
        $count: "activeDepartments"
      }
    ]);
    const activeDepartments = activeDepartmentsResult[0]?.activeDepartments || 0;

    // 10. Department Breakdown with Positions
    const departmentBreakdown = await jobPostModel.aggregate([
      {
        $match: {
          ...commonMatchFilter,
          // status: "active",
          // jobPostExpired: false
        }
      },
      {
        $group: {
          _id: "$departmentId",
          jobCount: { $sum: 1 },
          totalPositions: { $sum: "$noOfPosition" }
        }
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "_id",
          foreignField: "_id",
          as: "department"
        }
      },
      {
        $project: {
          departmentId: "$_id",
          departmentName: { $arrayElemAt: ["$department.name", 0] },
          jobCount: 1,
          totalPositions: 1
        }
      },
      {
        $sort: { totalPositions: -1 }
      }
    ]);
    // 11. Hot Vacancies (Top 5 with Highest Number of Applicants)
    const hotVacancies = await jobPostModel.aggregate([
      {
        $match: {
          ...commonMatchFilter,
          // status: "active",
          // jobPostExpired: false
        }
      },
      {
        $addFields: {
          daysOld: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department"
        }
      },
      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "designation"
        }
      },
      {
        $project: {
          position: 1,
          departmentName: { $arrayElemAt: ["$department.name", 0] },
          designationName: { $arrayElemAt: ["$designation.name", 0] },
          numberOfApplicant: 1,
          totalApplicants: 1,
          daysOld: { $round: "$daysOld" },
          noOfPosition: 1
        }
      },
      {
        $sort: { totalApplicants: -1 } // Sort by highest applicants first
      },
      {
        $limit: 5 // Top 5 only
      }
    ]);

    // 12. Cold Vacancies (Top 5 with Lowest Number of Applicants - Below 5)
    const coldVacancies = await jobPostModel.aggregate([
      {
        $match: {
          ...commonMatchFilter,
          ...dateMatchFilter,
          // status: "active",
          // jobPostExpired: false
        }
      },
      {
        $addFields: {
          daysOld: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department"
        }
      },
      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "designation"
        }
      },
      {
        $project: {
          position: 1,
          departmentName: { $arrayElemAt: ["$department.name", 0] },
          designationName: { $arrayElemAt: ["$designation.name", 0] },
          numberOfApplicant: 1,
          totalApplicants: 1,
          daysOld: { $round: "$daysOld" },
          noOfPosition: 1
        }
      },
      {
        $match: {
          totalApplicants: { $lt: 5 } // Only jobs with less than 5 applicants
        }
      },
      {
        $sort: { totalApplicants: 1, daysOld: -1 } // Sort by lowest applicants first, then by oldest
      },
      {
        $limit: 5 // Top 5 only
      }
    ]);

    // 13. Calculate percentage changes
    const newJobsPercentage = newJobsPreviousPeriod > 0
      ? Math.round(((newJobsCurrentPeriod - newJobsPreviousPeriod) / newJobsPreviousPeriod) * 100)
      : newJobsCurrentPeriod > 0 ? 100 : 0;

    // 14. Employment Type Distribution
    const employmentTypeDistribution = await jobPostModel.aggregate([
      {
        $match: {
          ...commonMatchFilter,
          status: "active",
          // status: "active",
          // jobPostExpired: false
        }
      },
      {
        $group: {
          _id: "$employmentTypeId",
          jobCount: { $sum: 1 },
          totalPositions: { $sum: "$noOfPosition" }
        }
      },
      {
        $lookup: {
          from: "employmenttypes",
          localField: "_id",
          foreignField: "_id",
          as: "employmentType"
        }
      },
      {
        $project: {
          employmentTypeName: { $arrayElemAt: ["$employmentType.name", 0] },
          jobCount: 1,
          totalPositions: 1
        }
      }
    ]);

    // Response Structure matching your dashboard
    const dashboardData = {
      totalJobs: {
        count: totalJobs,
        label: "total Job Post"
      },
      totalActiveJobs: {
        count: totalActiveJobs,
        label: "Active Job Post"
      },
      totalJobsReject: {
        count: totalJobsReject,
        label: "Job Post Reject"
      },
      totalJobsPending: {
        count: totalJobsPending,
        label: "Job Post Pending"
      },
      totalInActiveJobs: {
        count: totalInActiveJobs,
        label: "Job Posts Inactive"
      },
      totalOpenPositions: {
        count: totalOpenPositions,
        label: "Positions"
      },
      newJobs: {
        count: newJobsCurrentPeriod,
        label: `New (Days)`,
        percentage: newJobsPercentage,
        trend: newJobsPercentage >= 0 ? "up" : "down"
      },
      expiredJobs: {
        count: expiredJobsCurrentPeriod,
        label: `Expired (Days)`,
        status: "Closed"
      },
      avgTimeOpen: {
        count: avgTimeOpen,
        label: "Avg Time Open",
        unit: "Days"
      },
      nearingExpiry: {
        count: nearingExpiringJobs,
        label: "Nearing Expiry",
        status: "Urgent"
      },
      netActivity: {
        count: netActivity,
        label: "Net Activity",
        trend: netActivity >= 0 ? "Growth" : "Decline"
      },
      activeDepartments: {
        count: activeDepartments,
        label: "Departments",
        status: "Active",
      },

      // Department Breakdown
      departmentBreakdown: departmentBreakdown.map(dept => ({
        departmentName: dept.departmentName || '',
        positions: dept.totalPositions,
        jobCount: dept.jobCount
      })),

      // Hot & Cold Vacancies
      hotVacancies: hotVacancies.map(job => ({
        position: job.position,
        department: job.departmentName || '',
        designation: job.designationName || '',
        applicants: job.totalApplicants,
        daysOld: job.daysOld,
        openPositions: job.noOfPosition
      })),

      coldVacancies: coldVacancies.map(job => ({
        position: job.position,
        department: job.departmentName || '',
        designation: job.designationName || '',
        applicants: job.totalApplicants,
        daysOld: job.daysOld,
        openPositions: job.noOfPosition
      })),

      // Additional Analytics
      // employmentTypeDistribution/,

      // Period Information
      // periodInfo: {
      //   currentPeriod: {
      //     startDate: startDate.toISOString().split('T')[0],
      //     endDate: endDate.toISOString().split('T')[0],
      //     days: periodInDays
      //   },
      //   previousPeriod: {
      //     startDate: previousStartDate.toISOString().split('T')[0],
      //     endDate: previousEndDate.toISOString().split('T')[0],
      //     days: periodInDays
      //   }
      // }
    };

    return success(res, "Job Post Dashboard", {
      data: dashboardData,
      generatedAt: new Date().toISOString(),
      year: parseInt(year),
      // periodDays: periodInDays?periodInDays:''
    }
    );

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return unknownError(res, error)
  }
}

//----------------------------------------------------------////---------------------------------------------------------------------------


export const getDashboardAnalytics = async (req, res) => {
  try {
    const { status, year = new Date().getFullYear(), period = 'all', showAllDashbBoardData, startDate: queryStartDate, endDate: queryEndDate } = req.query;
    const createdByHrId = req.employee.id

    const organizationId = req.employee.organizationId
    if (!organizationId) {
      return badRequest(res, "invalid token organizationId not found")
    }

    const commonMatchFilter = {
      organizationId: new ObjectId(organizationId),
      // status: "active",
    };

    const jobApplyMatchFilter = {
      organizationId: new ObjectId(organizationId),
    }

    if (showAllDashbBoardData !== "all") {
      commonMatchFilter.createdByHrId = new ObjectId(createdByHrId);
    }

    let startDate, endDate;
    const periodInDays = parseInt(period); // ✅ Only one declaration here

    if (period !== 'all') {
      if (isNaN(periodInDays) || periodInDays <= 0) {
        return badRequest(res, "Invalid period value.");
      }

      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      startDate = new Date();
      startDate.setDate(endDate.getDate() - periodInDays);
      startDate.setHours(0, 0, 0, 0);

      commonMatchFilter.createdAt = { $gte: startDate, $lte: endDate };
      jobApplyMatchFilter.createdAt = { $gte: startDate, $lte: endDate };

    } else if (queryStartDate && queryEndDate) {
      if (queryStartDate !== 'all' && queryEndDate !== 'all') {
        // ✅ Convert and validate custom dates
        startDate = new Date(`${queryStartDate}T00:00:00.000Z`);
        endDate = new Date(`${queryEndDate}T23:59:59.999Z`);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return badRequest(res, "Invalid date format.");
        }

        commonMatchFilter.createdAt = { $gte: startDate, $lte: endDate };
        jobApplyMatchFilter.createdAt = { $gte: startDate, $lte: endDate };
      }
    }



    const totalJobs = await jobPostModel.countDocuments({
      ...commonMatchFilter,
    });
    const totalInActiveJobs = await jobPostModel.countDocuments({
      ...commonMatchFilter,
      status: 'inactive',
    });

    const totalActiveJobs = await jobPostModel.countDocuments({
      ...commonMatchFilter,
      status: 'active',
    });

    if (status && status !== "all") {
      commonMatchFilter.status = status
    } else {
      commonMatchFilter.status = "active"
    }
    // console.log('commonMatchFilter',commonMatchFilter)

    // Run all analytics queries in parallel for better performance
    const [
      totalApplicants,
      activeDepartmentsCount,
      applicationsByMonth,
      applicationsByDepartment,
      topPositions,
    ] = await Promise.all([

      // 1. Total Applicants (existing)
      jobPostModel.aggregate([
        {
          $match: {
            ...commonMatchFilter,
            // jobPostExpired: false
          }
        },
        {
          $group: {
            _id: null,
            numberOfApplicant: { $sum: "$numberOfApplicant" },
            totalApplicants: { $sum: "$totalApplicants" }
          }
        }
      ]),

      // 2. Active Departments Count (existing)
      jobPostModel.aggregate([
        {
          $match: {
            ...commonMatchFilter,
            // jobPostExpired: false
          }
        },
        {
          $group: {
            _id: "$departmentId"
          }
        },
        {
          $count: "activeDepartments"
        }
      ]),

      // 3. Applications by Month (for the line chart)
      jobPostModel.aggregate([
        {
          $match: {
            ...commonMatchFilter,
            // jobPostExpired: false,
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            totalApplicants: { $sum: "$totalApplicants" },
            numberOfApplicant: { $sum: "$numberOfApplicant" },
            totalJobs: { $sum: 1 }
          }
        },
        {
          $addFields: {
            monthName: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
                  { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
                  { case: { $eq: ["$_id.month", 3] }, then: "Mar" },
                  { case: { $eq: ["$_id.month", 4] }, then: "Apr" },
                  { case: { $eq: ["$_id.month", 5] }, then: "May" },
                  { case: { $eq: ["$_id.month", 6] }, then: "Jun" },
                  { case: { $eq: ["$_id.month", 7] }, then: "Jul" },
                  { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
                  { case: { $eq: ["$_id.month", 9] }, then: "Sep" },
                  { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
                  { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
                  { case: { $eq: ["$_id.month", 12] }, then: "Dec" }
                ],
                default: "Unknown"
              }
            }
          }
        },
        {
          $sort: { "_id.month": 1 }
        },
        {
          $project: {
            _id: 0,
            month: "$_id.month",
            monthName: 1,
            totalApplicants: 1,
            totalJobs: 1
          }
        }
      ]),

      // // 4. Applications by Department (for the bar chart)
      jobPostModel.aggregate([
        {
          $match: {
            ...commonMatchFilter,
            // jobPostExpired: false,
          }
        },
        {
          $lookup: {
            from: "newdepartments",
            localField: "departmentId",
            foreignField: "_id",
            as: "department"
          }
        },
        {
          $unwind: "$department"
        },
        {
          $group: {
            _id: "$departmentId",
            departmentName: { $first: "$department.name" },
            totalApplicants: { $sum: "$totalApplicants" },
            numberOfApplicant: { $sum: "$numberOfApplicant" },
            totalJobs: { $sum: 1 },
            totalPositions: { $sum: "$noOfPosition" }
          }
        },
        {
          $sort: { totalApplicants: -1 }
        },
        {
          $project: {
            _id: 0,
            departmentName: 1,
            totalApplicants: 1,
            numberOfApplicant: 1,
            totalJobs: 1,
            totalPositions: 1,
            avgApplicantsPerJob: {
              $round: [{ $divide: ["$totalApplicants", "$totalJobs"] }, 1]
            }
          }
        }
      ]),


      // 5. Top Positions (for the bar chart)
      jobPostModel.aggregate([
        {
          $match: {
            ...commonMatchFilter,
            // jobPostExpired: false,
          }
        },
        {
          $addFields: {
            daysOld: {
              $round: [{
                $divide: [
                  { $subtract: [new Date(), "$createdAt"] },
                  1000 * 60 * 60 * 24
                ]
              }]
            }
          }
        },
        {
          $lookup: {
            from: "newdepartments",
            localField: "departmentId",
            foreignField: "_id",
            as: "department"
          }
        },
        {
          $lookup: {
            from: "newdesignations",
            localField: "designationId",
            foreignField: "_id",
            as: "designation"
          }
        },
        {
          $project: {
            position: 1,
            departmentName: { $arrayElemAt: ["$department.name", 0] },
            designationName: { $arrayElemAt: ["$designation.name", 0] },
            numberOfApplicant: 1,
            totalApplicants: 1,
            noOfPosition: 1,
            daysOld: 1,
            applicantsPerPosition: {
              $round: [{
                $cond: [
                  { $gt: ["$noOfPosition", 0] },
                  { $divide: ["$numberOfApplicant", "$noOfPosition"] },
                  0
                ]
              }, 1]
            }
          }
        },
        {
          $sort: { numberOfApplicant: -1 }
        },
        {
          $limit: 6 // Top 6 positions for the chart
        }
      ]),
    ]);

    const [jobApplys, shortlistedApplyStats] = await Promise.all([
      jobApply.aggregate([
        {
          $match: {
            ...jobApplyMatchFilter,
          }
        },
        {
          $lookup: {
            from: "jobposts", // collection name (ensure it's correct)
            localField: "jobPostId",
            foreignField: "_id",
            as: "jobPost"
          }
        },
        { $unwind: "$jobPost" },
        {
          $match: showAllDashbBoardData === "all"
            ? {}
            : { "jobPost.createdByHrId": new ObjectId(createdByHrId) }
        },
        {
          $project: {
            _id: 1
          }
        }
      ]),

      // Only shortlisted applications created by specific employee
      jobApply.aggregate([
        {
          $match: {
            ...jobApplyMatchFilter,
            resumeShortlisted: "shortlisted"
          }
        },
        {
          $lookup: {
            from: "jobposts",
            localField: "jobPostId",
            foreignField: "_id",
            as: "jobPost"
          }
        },
        { $unwind: "$jobPost" },
        {
          $match: showAllDashbBoardData === "all"
            ? {}
            : { "jobPost.createdByHrId": new ObjectId(createdByHrId) }
        }
      ])
    ]);

    // console.log('jobApplyMatchFilter',jobApplyMatchFilter)
    // Process results
    const numberOfApplicant = totalApplicants[0]?.numberOfApplicant || 0;
    const totalApplicantsApply = totalApplicants[0]?.totalApplicants || 0;
    const activeDepartments = activeDepartmentsCount[0]?.activeDepartments || 0;

    // Fill missing months with 0 values for Applications by Month
    const allMonths = [];
    for (let month = 1; month <= 12; month++) {
      const monthData = applicationsByMonth.find(item => item.month === month);
      allMonths.push({
        month,
        monthName: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
        totalApplicants: monthData?.totalApplicants || 0,
        numberOfApplicant: monthData?.numberOfApplicant || 0,
        totalJobs: monthData?.totalJobs || 0
      });
    }

    // Response Structure matching your dashboard
    const dashboardData = {
      // Summary Stats (existing)
      totalApplicants: {
        count: totalApplicantsApply,
        total: totalApplicantsApply,
        label: "total Applicants"
      },
      activeDepartment: {
        count: activeDepartments,
        label: "active Departments"
      },

      // Chart Data for Applications by Month
      applicationsByMonth: {
        chartData: allMonths
      },

      // Chart Data for Applications by Department
      applicationsByDepartment: {
        chartData: applicationsByDepartment,
      },

      // Chart Data for Top Positions
      topPositions: {
        chartData: topPositions,
      },

      workflowStatistics: {
        chartData: [
          {
            stage: "Applications",
            count: jobApplys.length,
            color: "#2196F3"
          },
          {
            stage: "Shortlisted",
            count: shortlistedApplyStats.length,
            color: "#4CAF50"
          }
        ]
      },

    };

    return success(res, "Dashboard Analytics", {
      data: dashboardData,
      generatedAt: new Date().toISOString(),
      year: parseInt(year),
      periodDays: periodInDays
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return unknownError(res, error);
  }
};


// export expport jobpost //


export const exportJobPostsExcel = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;

    if (!organizationId) {
      return badRequest(res, "Organization ID not provided");
    }

    const jobPosts = await jobPostModel.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          status: "active",
        },
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, name: 1 } }],
          as: "department",
        },
      },
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "newdepartments",
          let: { subDeptId: "$subDepartmentId" }, // assuming subDepartmentId is the field in the main document
          pipeline: [
            { $unwind: "$subDepartments" },
            {
              $match: {
                $expr: {
                  $eq: ["$subDepartments._id", "$$subDeptId"]
                }
              }
            },
            {
              $project: {
                name: "$subDepartments.name"
              }
            }
          ],
          as: "subDepartmentDetail"
        }
      },
      {
        $unwind: {
          path: "$subDepartmentDetail",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, name: 1 } }],
          as: "designation",
        },
      },
      { $unwind: { path: "$designation", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, name: 1 } }],
          as: "branch",
        },
      },
      { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "employmenttypes",
          localField: "employmentTypeId",
          foreignField: "_id",
          as: "employmentType",
        },
      },
      {
        $unwind: { path: "$employmentType", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "employeetypes",
          localField: "employeeTypeId",
          foreignField: "_id",
          as: "employeeType",
        },
      },
      { $unwind: { path: "$employeeType", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          jobPostId: 1,
          position: 1,
          JobType: 1,
          noOfPosition: 1,
          status: 1,
          expiredDate: 1,
          createdAt: 1,
          department: "$department.name",
          subDepartment: "$subDepartmentDetail.name",
          designation: "$designation.name",
          employmentType: "$employmentType.title",
          employeeType: "$employeeType.title",
          branch: "$branch.name",
        },
      },
    ]);

    if (!jobPosts.length) {
      return success(res, "No job posts found", []);
    }

    const fileUrl = await generateJobPostExcelAndUpload(jobPosts, "Job_Posts_Report");

    return success(res, "Excel file generated and uploaded", { url: fileUrl });
  } catch (error) {
    console.error("Export Job Posts Excel Error:", error);
    return unknownError(res, error);
  }
};








export const assignJobPostIdsToOldPosts = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;

    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    let setting = await jobPostingsetting.findOne({ organizationId });

    if (!setting) {
      // If setting not found, create a default one
      setting = new jobPostingsetting({
        organizationId,
        PostIdCounter: 100,
        PostIdPrefix: "JOB",
        PostIdSuffix: "FINTECH",
        PostIdPadLength: 3,
      });
      await setting.save();
    }

    // Find all job posts without jobPostId
    const jobPosts = await jobPostModel.find({
      organizationId,
      $or: [{ jobPostId: { $exists: false } }, { jobPostId: null }, { jobPostId: "" }]
    });

    const updates = [];

    for (const post of jobPosts) {
      setting.PostIdCounter += 1;

      const prefix = setting.PostIdPrefix || "JOB";
      const suffix = setting.PostIdSuffix || "FINTECH";
      const counter = setting.PostIdCounter.toString().padStart(setting.PostIdPadLength || 3, "0");

      post.jobPostId = `${prefix}${counter}${suffix}`;
      updates.push(post.save());
    }

    await Promise.all(updates);
    await setting.save();

    return res.status(200).json({
      message: `${jobPosts.length} jobPostId(s) assigned successfully`,
      updatedCount: jobPosts.length,
    });

  } catch (error) {
    console.error("Error assigning jobPostId:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};


export const getJobPostDetail = async (req, res) => {
  try {
    const { jobPostId } = req.query;

    if (!jobPostId) {
      return badRequest(res, "job Post Id Required");
    }
    if (!mongoose.Types.ObjectId.isValid(jobPostId)) {
      return badRequest(res, "Invalid jobPostId");
    }

    const jobPostDetail = await jobPostModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(jobPostId) }
      },
      // 👇 Reuse the same aggregation pipeline here (remove $facet and pagination)
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "newdepartments",
          let: { subDeptId: "$subDepartmentId" },
          pipeline: [
            { $unwind: "$subDepartments" },
            {
              $match: {
                $expr: {
                  $eq: ["$subDepartments._id", "$$subDeptId"]
                }
              }
            },
            {
              $project: {
                _id: "$subDepartments._id",
                name: "$subDepartments.name"
              }
            }
          ],
          as: "subDepartment"
        }
      },
      { $unwind: { path: "$subDepartment", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "desingnation",
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
          from: "employmenttypes",
          localField: "employmentTypeId",
          foreignField: "_id",
          as: "employmentType",
        },
      },
      { $unwind: { path: "$employmentType", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "newworklocations",
          localField: "Worklocation",
          foreignField: "_id",
          as: "Worklocation",
        }
      },
      {
        $lookup: {
          from: "employeetypes",
          localField: "employeeTypeId",
          foreignField: "_id",
          as: "employeeType",
        },
      },
      { $unwind: { path: "$employeeType", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "employees",
          localField: "createdByHrId",
          foreignField: "_id",
          as: "createdByHr",
        },
      },
      { $unwind: { path: "$createdByHr", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "_id",
          foreignField: "jobPostId",
          as: "jobId",
        },
      },
      { $unwind: { path: "$jobId", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "vacancyrequests",
          localField: "vacancyRequestId",
          foreignField: "_id",
          as: "vacancyRequest",
        },
      },
      { $unwind: { path: "$vacancyRequest", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "qualifications",
          localField: "qualificationId",
          foreignField: "_id",
          as: "qualification",
        },
      },
      {
        $lookup: {
          from: "jobdescriptions",
          localField: "vacancyRequest.jobDescriptionId",
          foreignField: "_id",
          as: "vacancyJobDescription",
        },
      },
      { $unwind: { path: "$vacancyJobDescription", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "jobdescriptions",
          localField: "jobDescriptionId",
          foreignField: "_id",
          as: "jobDescription",
        },
      },
      { $unwind: { path: "$jobDescription", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: { path: "$organization", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          jobPostId: 1,
          JobType: 1,
          position: 1,
          experience: 1,
          numberOfApplicant: 1,
          expiredDate: 1,
          totalApplicants: 1,
          noOfPosition: 1,
          Worklocation: { _id: 1, name: 1 },
          InterviewType: 1,
          package: 1,
          budget: 1,
          budgetType: 1,
          status: 1,
          AgeLimit: 1,
          gender: 1,
          jobDescription: { _id: 1, jobDescription: 1 },
          createdByHr: { _id: 1, employeName: 1 },
          department: { _id: 1, name: 1 },
          subDepartment: { _id: 1, name: 1 },
          desingnation: { _id: 1, name: 1 },
          organization: { _id: 1, name: 1 },
          branch: { _id: 1, name: 1, address: 1 },
          employmentType: { _id: 1, title: 1 },
          qualification: 1,
          employeeType: { _id: 1, title: 1 },
          jobId: { _id: 1, company: 1 },
          vacancyRequest: {
            _id: 1,
            vacancyType: 1,
            vacancyApproval: 1,
          },
          vacancyJobDescription: {
            _id: 1,
            position: 1,
            jobDescription: 1,
          },
          AI_Percentage: 1,
          MaxAI_Score: 1,
          MinAI_Score: 1,
          AI_Screening: 1,
          screeningCriteria: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      }
    ]);

    if (!jobPostDetail.length) {
      return notFound(res, "Job Post not found");
    }

    return success(res, "Job Post Detail", jobPostDetail[0]);
  } catch (error) {
    console.error("Error in job post detail:", error.message);
    return unknownError(res, error.message);
  }
};


import qualificationModel from "../../models/QualificationModel/qualification.model.js";
import subDropDownModel from "../../models/masterDropDownModel/masterDropDownValue.model.js";
import { returnFormatter } from "../../formatters/common.formatter.js"; // adjust to your utils path

export const qualificationDataUpdate = async (req, res) => {
  try {
    const jobPosts = await jobPostModel.find({}).lean();

    for (const jobPost of jobPosts) {
      const newQualificationIds = [];

      for (const qualificationId of jobPost.qualificationId || []) {
        const oldQual = await subDropDownModel.findById(qualificationId).lean();
        if (!oldQual || !oldQual.name) continue;

        const newQual = await qualificationModel.findOne({ name: oldQual.name }).lean();

        if (newQual?._id) {
          newQualificationIds.push(newQual._id);
        }
      }

      // update document
      await jobPostModel.findByIdAndUpdate(jobPost._id, {
        qualificationId: newQualificationIds.length ? newQualificationIds : [],
      });
    }

    return res.status(200).json(returnFormatter(true, "Qualification IDs migrated successfully."));
  } catch (error) {
    return res.status(500).json(returnFormatter(false, error.message));
  }
};





export const getLatLngByPincode = async (pincode) => {
  try {
    const response = await axios.get(`https://india-pincode-with-latitude-and-longitude.p.rapidapi.com/api/v1/pincode/${pincode}`, {
      headers: {
        'x-rapidapi-host': 'india-pincode-with-latitude-and-longitude.p.rapidapi.com',
        'x-rapidapi-key': '19f2bb1fe8msh6e05099924533f9p1f7e4ajsn1ab4ed5f6cfb', // Use your key securely
      },
    });
    // console.log("response",response)
    if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
      const { lat, lng, district, state, area } = response.data[0];
      return { latitude: lat, longitude: lng, district, state, area };
    } else {
      // console.log("No location found for pincode.");
      return null;
    }
  } catch (error) {
    console.error(`Failed for pincode ${pincode}:`, error.message);
    return null;
  }
};






export const getApplicantsLocationByJob = async (req, res) => {
  try {

    const { jobPostId, AI_Screeing_Status, resumeShortlisted, position, branchIds } = req.query;
    const matchStage = {
      orgainizationId: new ObjectId(req.employee.organizationId)
    };


    // if (jobPostId && jobPostId !== 'all') {
    //   if (!jobPostId) return badRequest(res, "jobPostId is required");
    //   const jobPostIdArray = Array.isArray(jobPostId) ? jobPostId : jobPostId.split(",");
    //   matchStage.jobPostId = { $in: jobPostIdArray.map(id => new ObjectId(id)) };
    // }

    if (jobPostId && jobPostId !== 'all') {
      let parsedJobPostId = jobPostId;

      if (typeof jobPostId === 'string') {
        try {
          parsedJobPostId = JSON.parse(jobPostId);
        } catch (err) {
          parsedJobPostId = jobPostId.split(',');
        }
      }

      const jobPostIdArray = Array.isArray(parsedJobPostId) ? parsedJobPostId : [parsedJobPostId];

      const validObjectIds = jobPostIdArray.filter(id => mongoose.Types.ObjectId.isValid(id));

      if (!validObjectIds.length) {
        return badRequest(res, "No valid jobPostId(s) provided.");
      }

      matchStage.jobPostId = { $in: validObjectIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    if (AI_Screeing_Status !== undefined) {
      const AIScreeing = AI_Screeing_Status.split(',').map(val => val.trim());
      matchStage.AI_Screeing_Status = { $in: AIScreeing };
    }

    if (resumeShortlisted !== undefined) {
      const resumeValues = resumeShortlisted.split(',').map(val => val.trim());
      matchStage.resumeShortlisted = { $in: resumeValues };
    }

    // console.log('matchStage',matchStage)
    if (position) {
      matchStage.position = position.trim();
    }

    if (branchIds) {
      let parsedBranchIds = branchIds;

      if (typeof branchIds === 'string') {
        try {
          parsedBranchIds = JSON.parse(branchIds); // handles '["..."]' format
        } catch (e) {
          parsedBranchIds = branchIds.split(',');  // fallback for comma-separated values
        }
      }

      const branchArray = Array.isArray(parsedBranchIds) ? parsedBranchIds : [parsedBranchIds];

      const validBranchIds = branchArray.filter(id => mongoose.Types.ObjectId.isValid(id));

      if (validBranchIds.length > 0) {
        matchStage.branchId = { $in: validBranchIds.map(id => new ObjectId(id)) };
      }
    }


    const jobApplies = await jobApply.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branchDetails"
        }
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "newdepartmentDetail"
        }
      },
      {
        $project: {
          name: 1,
          mobileNumber: 1,
          pincode: 1,
          AI_Screeing_Status: 1,
          resumeShortlisted: 1,
          createdAt: 1,
          position: 1, // 🟢 Add this if your model has it
          branchNames: "$branchDetails.name",
          branches: {
            $map: {
              input: "$branchDetails",
              as: "branch",
              in: {
                _id: "$$branch._id",
                name: "$$branch.name"
              }
            }
          },
          newdepartmentDetail: "$newdepartmentDetail.name",
        }
      }
    ]);

    const locationCountMap = {};
    const enrichedResults = [];

    for (const apply of jobApplies) {
      const pincode = apply.pincode?.toString().trim();
      if (!pincode) continue;

      // Check if lat/lng already saved in DB
      let pinLocation = await pincodeLocationModel.findOne({ pincode });

      if (!pinLocation) {
        const latlng = await getLatLngByPincode(pincode);
        if (!latlng) {
          // console.log('pin code found for', pincode)
        }
        if (!latlng) continue;

        pinLocation = await pincodeLocationModel.findOneAndUpdate(
          { pincode },
          {
            $setOnInsert: {
              latitude: latlng.latitude,
              longitude: latlng.longitude,
              district: latlng.district,
              state: latlng.state,
              area: latlng.area,
            }
          },
          {
            upsert: true,
            new: true
          }
        );
      }

      locationCountMap[pincode] = (locationCountMap[pincode] || 0) + 1;

      enrichedResults.push({
        name: apply.name,
        mobileNumber: apply.mobileNumber,
        pincode,
        newdepartmentDetail: apply.newdepartmentDetail,
        latitude: pinLocation.latitude,
        longitude: pinLocation.longitude,
        district: pinLocation.district,
        state: pinLocation.state,
        area: pinLocation.area,
        position: apply.position || "N/A",
        appliedAt: apply.createdAt,
        branchNames: apply.branchNames || [],
        resumeShortlisted: apply.resumeShortlisted,
        AI_Screeing_Status: apply.AI_Screeing_Status,
        branches: apply.branches,

      });
    }

    return success(res, "Application Location Detail", {
      totalApplications: jobApplies.length,
      locationCounts: locationCountMap,
      data: enrichedResults
    });

  } catch (err) {
    console.error("Error:", err);
    return unknownError(res, "Internal Server Error", err);
  }
};



export const getAllJobPostForLocation = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const organizationId = req.employee.organizationId;

    if (!organizationId) {
      return badRequest(res, "Invalid token. Organization ID not found.");
    }

    const matchStage = {
      organizationId: new ObjectId(organizationId)
    };

    if (status && status !== "all") {
      matchStage.status = status;
    }

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const getJobPosts = await jobPostModel.aggregate([
      { $match: matchStage },

      // Join with newdesignations
      {
        $lookup: {
          from: "newdesignations",
          localField: "designationId",
          foreignField: "_id",
          as: "designation"
        }
      },
      { $unwind: "$designation" },

      // Join with newbranches
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branchDetails"
        }
      },

      // Final projection
      {
        $project: {
          _id: 1,
          createdAt: 1,
          noOfPosition: 1,
          jobPostId: 1,
          expiredDate: 1,
          numberOfApplicant: 1,
          totalApplicants: 1,
          experience: 1,
          status: 1,
          "designation._id": 1,
          "designation.name": 1,
          branches: {
            $map: {
              input: "$branchDetails",
              as: "branch",
              in: {
                _id: "$$branch._id",
                name: "$$branch.name"
              }
            }
          },
        }
      }
    ]);

    return success(res, "Job Post List", getJobPosts);
  } catch (error) {
    console.error("Error in getAllJobPostForLocation:", error);
    return unknownError(res, error);
  }
};

export const filemanagerOldData = async (req, res) => {
  try {
    const organizations = await organizationModel.find({}, '_id');

    for (const org of organizations) {
      const organizationId = org._id;
      const rootFolderKey = 'job-posts';

      // Step 1: Check or create root folder for organization
      let rootFolder = await folderSchema.findOne({
        organizationId,
        key: rootFolderKey
      });

      if (!rootFolder) {
        const newRootFolder = new folderSchema({
          organizationId,
          candidateId: null,
          parentId: null,
          name: 'job-posts',
          type: 'folder',
          key: rootFolderKey,
          mimetype: 'application/x-directory',
          status: 'active',
        });
        rootFolder = await newRootFolder.save();
      }

      // Step 2: Fetch all job posts for the organization
      const jobPosts = await jobPostModel.find({ organizationId });

      for (const jobPost of jobPosts) {
        const findDesignation = await designationModel.findById(jobPost.designationId);
        if (!findDesignation) continue;

        const formatFolderName = (name) => {
          return name
            .trim()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('_');
        };

        const jobPostFolderKey = `${rootFolderKey}/${formatFolderName(findDesignation.name)}_${jobPost.jobPostId}/`;

        // Step 3: Check or create job post folder
        let jobPostFolder = await folderSchema.findOne({
          organizationId,
          key: jobPostFolderKey
        });

        if (!jobPostFolder) {
          const newJobPostFolder = new folderSchema({
            organizationId,
            candidateId: null,
            parentId: rootFolder._id,
            name: `${formatFolderName(findDesignation.name)}_${jobPost.jobPostId}`,
            type: 'folder',
            key: jobPostFolderKey,
            mimetype: 'application/x-directory',
            status: 'active',
          });
          jobPostFolder = await newJobPostFolder.save();
        }

        // Step 4: Find all applicants to this job post
        const applicants = await jobApply.find({ jobPostId: jobPost._id });

        for (const applicant of applicants) {
          const candidateFolderKey = `${jobPostFolderKey}${applicant.candidateUniqueId}/`;

          // Step 5: Check or create candidate folder
          let candidateFolder = await folderSchema.findOne({
            organizationId,
            key: candidateFolderKey
          });

          if (!candidateFolder) {
            const newCandidateFolder = new folderSchema({
              organizationId,
              candidateId: null,
              parentId: jobPostFolder._id,
              name: applicant.candidateUniqueId,
              type: 'folder',
              key: candidateFolderKey,
              mimetype: 'application/x-directory',
              status: 'active',
            });
            candidateFolder = await newCandidateFolder.save();
          }

          // Step 6: Save resume file inside candidate folder
          if (applicant.resume) {
            const saveResumeResult = await saveFileFromUrl({
              fileUrl: applicant.resume,
              parentId: candidateFolder._id,
              organizationId,
              candidateId: null
            });

            if (!saveResumeResult.status) {
              console.warn(`Resume save failed for ${applicant._id}:`, saveResumeResult.message);
            }
          }
        }
      }
    }

    return success(res, "File manager structure synced successfully");
  } catch (error) {
    console.error(" error:", error);
    return unknownError(res, error);
  }
};





///   TRACK RECURITER //


export const getRecruiterDashboard = async (req, res) => {
  try {
    const {
      createdByHrId,
      period = '30',
      startDate: queryStartDate,
      endDate: queryEndDate,
      timeZone = 'UTC',
      dashboardType = 'full' // 'full', 'overview', 'charts', 'comparison'
    } = req.query;

    // Validate required parameters
    if (!createdByHrId) {
      return badRequest(res, "createdByHrId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(createdByHrId)) {
      return badRequest(res, "Invalid createdByHrId format");
    }

    const organizationId = req.employee?.organizationId;
    if (!organizationId) {
      return badRequest(res, "Organization ID not found");
    }

    const baseMatchStage = {
      createdByHrId: new ObjectId(createdByHrId),
      organizationId: new ObjectId(organizationId)
    };

    // Date range calculation
    let startDate, endDate;
    const periodInDays = parseInt(period);

    if (period !== 'all') {
      if (queryStartDate && queryEndDate) {
        startDate = new Date(`${queryStartDate}T00:00:00.000Z`);
        endDate = new Date(`${queryEndDate}T23:59:59.999Z`);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return badRequest(res, "Invalid date format. Use YYYY-MM-DD");
        }

        if (startDate > endDate) {
          return badRequest(res, "Start date cannot be greater than end date");
        }
      } else if (!isNaN(periodInDays) && periodInDays > 0) {
        endDate = new Date();
        endDate.setUTCHours(23, 59, 59, 999);

        startDate = new Date(endDate); // Start from endDate
        startDate.setUTCDate(endDate.getUTCDate() - periodInDays + 1); // Inclusive
        startDate.setUTCHours(0, 0, 0, 0);
      } else {
        return badRequest(res, "Invalid period value. Use positive number or 'all'");
      }

      if (startDate && endDate) {
        baseMatchStage.createdAt = { $gte: startDate, $lte: endDate };
      }
    }

    let dashboardData = {};

    console.log("startDate", startDate)
    console.log("endDate", endDate)

    // Execute queries based on dashboard type
    switch (dashboardType) {
      case 'overview':
        dashboardData = await getOverviewOnly(baseMatchStage);
        break;

      case 'charts':
        dashboardData = await getChartsOnly(baseMatchStage, timeZone);
        break;

      case 'comparison':
        if (!queryStartDate || !queryEndDate) {
          return badRequest(res, "Start date and end date are required for comparison");
        }
        dashboardData = await getComparisonData(baseMatchStage, queryStartDate, queryEndDate);
        break;

      case 'full':
      default:
        // Full dashboard with all data
        const [
          overviewStats,
          statusDistribution,
          monthlyTrends,
          weeklyTrends,
          dailyTrends,
          departmentWiseStats,
          DesingationWiseStats,
          employmentTypeStats,
          performanceMetrics,
          recentActivity,
          topPerformingPosts
        ] = await Promise.all([
          getOverviewStats(baseMatchStage),
          getStatusDistribution(baseMatchStage),
          getMonthlyTrends(baseMatchStage, timeZone),
          getWeeklyTrends(baseMatchStage, timeZone),
          getDailyTrends(baseMatchStage, timeZone),
          getDepartmentWiseStats(baseMatchStage),
          getDesingationWiseStats(baseMatchStage),
          getEmploymentTypeStats(baseMatchStage),
          getPerformanceMetrics(baseMatchStage),
          getRecentActivity(baseMatchStage),
          getTopPerformingPosts(baseMatchStage)
        ]);

        dashboardData = {
          overview: overviewStats,
          charts: {
            statusDistribution,
            monthlyTrends,
            weeklyTrends,
            dailyTrends,
            departmentWiseStats,
            DesingationWiseStats,
            employmentTypeStats
          },
          performance: performanceMetrics,
          recentActivity,
          topPerformingPosts
        };
        break;
    }

    // Add metadata
    dashboardData.metadata = {
      recruiterId: createdByHrId,
      organizationId: organizationId,
      dateRange: {
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        period: period,
        timeZone: timeZone
      },
      dashboardType,
      generatedAt: new Date().toISOString()
    };

    success(res, "Recruiter dashboard data retrieved successfully", dashboardData);

  } catch (error) {
    console.error("Dashboard API Error:", error);
    unknownError(res, error);
  }
};

// Helper function for overview only
const getOverviewOnly = async (matchStage) => {
  const overview = await getOverviewStats(matchStage);
  return { overview };
};

// Helper function for charts only
const getChartsOnly = async (matchStage, timeZone) => {
  const [
    statusDistribution,
    monthlyTrends,
    weeklyTrends,
    dailyTrends,
    departmentWiseStats,
    desingationWiseStats,
    employmentTypeStats
  ] = await Promise.all([
    getStatusDistribution(matchStage),
    getMonthlyTrends(matchStage, timeZone),
    getWeeklyTrends(matchStage, timeZone),
    getDailyTrends(matchStage, timeZone),
    getDepartmentWiseStats(matchStage),
    getDesingationWiseStats(matchStage),
    getEmploymentTypeStats(matchStage)
  ]);

  return {
    charts: {
      statusDistribution,
      monthlyTrends,
      weeklyTrends,
      dailyTrends,
      departmentWiseStats,
      desingationWiseStats,
      employmentTypeStats
    }
  };
};

// Helper function for comparison data
const getComparisonData = async (baseMatch, startDateStr, endDateStr) => {
  const currentStartDate = new Date(`${startDateStr}T00:00:00.000Z`);
  const currentEndDate = new Date(`${endDateStr}T23:59:59.999Z`);

  // Calculate previous period of same duration
  const periodDays = Math.ceil((currentEndDate - currentStartDate) / (1000 * 60 * 60 * 24));
  const previousEndDate = new Date(currentStartDate);
  previousEndDate.setDate(previousEndDate.getDate() - 1);
  previousEndDate.setHours(23, 59, 59, 999);
  const previousStartDate = new Date(previousEndDate);
  previousStartDate.setDate(previousStartDate.getDate() - periodDays);
  previousStartDate.setHours(0, 0, 0, 0);

  const [currentStats, previousStats] = await Promise.all([
    getOverviewStats({
      ...baseMatch,
      createdAt: { $gte: currentStartDate, $lte: currentEndDate }
    }),
    getOverviewStats({
      ...baseMatch,
      createdAt: { $gte: previousStartDate, $lte: previousEndDate }
    })
  ]);

  return {
    comparison: {
      current: {
        ...currentStats,
        period: `${startDateStr} to ${endDateStr}`
      },
      previous: {
        ...previousStats,
        period: `${previousStartDate.toISOString().split('T')[0]} to ${previousEndDate.toISOString().split('T')[0]}`
      },
      changes: {
        totalPosts: calculatePercentageChange(previousStats.totalPosts, currentStats.totalPosts),
        activePosts: calculatePercentageChange(previousStats.activePosts, currentStats.activePosts),
        totalApplicants: calculatePercentageChange(previousStats.totalApplicants, currentStats.totalApplicants),
        avgApplicantsPerPost: calculatePercentageChange(previousStats.avgApplicantsPerPost, currentStats.avgApplicantsPerPost),
        successRate: calculatePercentageChange(
          previousStats.totalPosts > 0 ? (previousStats.activePosts / previousStats.totalPosts) * 100 : 0,
          currentStats.totalPosts > 0 ? (currentStats.activePosts / currentStats.totalPosts) * 100 : 0
        )
      }
    }
  };
};

// Helper function for overview statistics
const getOverviewStats = async (matchStage) => {
  const stats = await jobPostModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        activePosts: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
        },
        pendingPosts: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
        },
        inactivePosts: {
          $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] }
        },
        rejectedPosts: {
          $sum: { $cond: [{ $eq: ["$status", "reject"] }, 1, 0] }
        },
        expiredPosts: {
          $sum: { $cond: [{ $eq: ["$jobPostExpired", true] }, 1, 0] }
        },
        totalApplicants: { $sum: "$totalApplicants" },
        totalPositions: { $sum: "$noOfPosition" },
        avgApplicantsPerPost: { $avg: "$totalApplicants" },

        totalBudget: {
          $sum: {
            $cond: [
              { $ne: ["$budget", ""] },
              { $toDouble: "$budget" },
              0
            ]
          }
        }
      }
    }
  ]);

  const result = stats[0] || {};

  return {
    totalPosts: result.totalPosts || 0,
    activePosts: result.activePosts || 0,
    pendingPosts: result.pendingPosts || 0,
    inactivePosts: result.inactivePosts || 0,
    rejectedPosts: result.rejectedPosts || 0,
    expiredPosts: result.expiredPosts || 0,
    totalApplicants: result.totalApplicants || 0,
    totalPositions: result.totalPositions || 0,
    avgApplicantsPerPost: Math.round((result.avgApplicantsPerPost || 0) * 100) / 100,
    totalBudget: result.totalBudget || 0,
    successRate: result.totalPosts > 0 ? Math.round((result.activePosts / result.totalPosts) * 100 * 100) / 100 : 0,
  };
};

// Helper function for status distribution
const getStatusDistribution = async (matchStage) => {
  const distribution = await jobPostModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalApplicants: { $sum: "$totalApplicants" },
        totalPositions: { $sum: "$noOfPosition" }
      }
    },
    {
      $project: {
        status: "$_id",
        count: 1,
        totalApplicants: 1,
        totalPositions: 1,
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ]);

  return distribution;
};

// Helper function for monthly trends
const getMonthlyTrends = async (matchStage, timeZone) => {
  const trends = await jobPostModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 },
        totalApplicants: { $sum: "$totalApplicants" },
        activeCount: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
        },
        totalPositions: { $sum: "$noOfPosition" }
      }
    },
    {
      $project: {
        period: {
          $dateToString: {
            format: "%Y-%m",
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: 1
              }
            }
          }
        },
        count: 1,
        totalApplicants: 1,
        activeCount: 1,
        totalPositions: 1,
        _id: 0
      }
    },
    { $sort: { period: 1 } }
  ]);

  return trends;
};

// Helper function for weekly trends
const getWeeklyTrends = async (matchStage, timeZone) => {
  const trends = await jobPostModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $isoWeekYear: "$createdAt" },
          week: { $isoWeek: "$createdAt" }
        },
        count: { $sum: 1 },
        totalApplicants: { $sum: "$totalApplicants" },
        activeCount: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        period: {
          $concat: [
            { $toString: "$_id.year" },
            "-W",
            { $toString: "$_id.week" }
          ]
        },
        count: 1,
        totalApplicants: 1,
        activeCount: 1,
        _id: 0
      }
    },
    { $sort: { period: 1 } }
  ]);

  return trends;
};

// Helper function for daily trends
const getDailyTrends = async (matchStage, timeZone) => {
  const trends = await jobPostModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt"
          }
        },
        count: { $sum: 1 },
        totalApplicants: { $sum: "$totalApplicants" },
        activeCount: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        date: "$_id",
        count: 1,
        totalApplicants: 1,
        activeCount: 1,
        _id: 0
      }
    },
    { $sort: { date: 1 } }
  ]);

  return trends;
};

// Helper function for department-wise statistics
const getDepartmentWiseStats = async (matchStage) => {
  const stats = await jobPostModel.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "newdepartments",
        localField: "departmentId",
        foreignField: "_id",
        as: "department"
      }
    },
    { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$departmentId",
        departmentName: { $first: "$department.name" },
        count: { $sum: 1 },
        totalApplicants: { $sum: "$totalApplicants" },
        activeCount: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
        },
        totalPositions: { $sum: "$noOfPosition" },
        avgApplicantsPerPost: { $avg: "$totalApplicants" }
      }
    },
    {
      $project: {
        departmentId: "$_id",
        departmentName: { $ifNull: ["$departmentName", "Unknown"] },
        count: 1,
        totalApplicants: 1,
        activeCount: 1,
        totalPositions: 1,
        avgApplicantsPerPost: { $round: ["$avgApplicantsPerPost", 2] },
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ]);

  return stats;
};


// Helper function for department-wise statistics
// Helper function for designation-wise statistics
const getDesingationWiseStats = async (matchStage) => {
  const stats = await jobPostModel.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "newdesignations", // ✅ likely typo fixed from "newdesignation"
        localField: "designationId",
        foreignField: "_id",
        as: "designation"
      }
    },
    { $unwind: { path: "$designation", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$designation._id",
        designationName: { $first: "$designation.name" },
        count: { $sum: 1 },
        totalApplicants: { $sum: "$totalApplicants" },
        activeCount: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
        },
        totalPositions: { $sum: "$noOfPosition" },
        avgApplicantsPerPost: { $avg: "$totalApplicants" }
      }
    },
    {
      $project: {
        designationId: "$_id",
        designationName: { $ifNull: ["$designationName", "Unknown"] },
        count: 1,
        totalApplicants: 1,
        activeCount: 1,
        totalPositions: 1,
        avgApplicantsPerPost: { $round: ["$avgApplicantsPerPost", 2] },
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ]);

  return stats;
};



// Helper function for employment type statistics
const getEmploymentTypeStats = async (matchStage) => {
  const stats = await jobPostModel.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "employmenttypes",
        localField: "employmentTypeId",
        foreignField: "_id",
        as: "employmentType"
      }
    },
    { $unwind: { path: "$employmentType", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$employmentTypeId",
        employmentType: { $first: "$employmentType.title" },
        count: { $sum: 1 },
        totalApplicants: { $sum: "$totalApplicants" },
        activeCount: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        employmentTypeId: "$_id",
        employmentType: { $ifNull: ["$employmentType", "Unknown"] },
        count: 1,
        totalApplicants: 1,
        activeCount: 1,
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ]);

  return stats;
};

// Helper function for performance metrics
const getPerformanceMetrics = async (matchStage) => {
  const metrics = await jobPostModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        successfulPosts: {
          $sum: { $cond: [{ $gt: ["$totalApplicants", 0] }, 1, 0] }
        },
        averageTimeToActivate: {
          $avg: {
            $cond: [
              { $and: [{ $eq: ["$status", "active"] }, { $ne: ["$jobPostApproveDate", null] }] },
              {
                $subtract: ["$jobPostApproveDate", "$createdAt"]
              },
              null
            ]
          }
        },
        totalBudgetAllocated: {
          $sum: {
            $cond: [
              { $and: [{ $ne: ["$budget", ""] }, { $ne: ["$budget", null] }] },
              {
                $cond: [
                  { $eq: ["$budgetType", "Monthly"] },
                  { $multiply: [{ $toDouble: "$budget" }, 12] },
                  { $toDouble: "$budget" }
                ]
              },
              0
            ]
          }
        },
        aiEnabledPosts: {
          $sum: { $cond: [{ $eq: ["$AI_Screening", "true"] }, 1, 0] }
        }
      }
    }
  ]);

  const result = metrics[0] || {};

  return {
    totalPosts: result.totalPosts || 0,
    successfulPosts: result.successfulPosts || 0,
    successRate: result.totalPosts > 0 ? Math.round((result.successfulPosts / result.totalPosts) * 100 * 100) / 100 : 0,
    averageTimeToActivate: result.averageTimeToActivate ? Math.round(result.averageTimeToActivate / (1000 * 60 * 60 * 24)) : 0,
    totalBudgetAllocated: result.totalBudgetAllocated || 0,
    aiAdoptionRate: result.totalPosts > 0 ? Math.round((result.aiEnabledPosts / result.totalPosts) * 100 * 100) / 100 : 0
  };
};

// Helper function for recent activity
const getRecentActivity = async (matchStage) => {
  const activity = await jobPostModel.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "newdepartments",
        localField: "departmentId",
        foreignField: "_id",
        as: "department"
      }
    },
    { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "employmenttypes",
        localField: "employmentTypeId",
        foreignField: "_id",
        as: "employmentType"
      }
    },
    { $unwind: { path: "$employmentType", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        jobPostId: 1,
        position: 1,
        status: 1,
        totalApplicants: 1,
        noOfPosition: 1,
        budget: 1,
        budgetType: 1,
        departmentName: "$department.name",
        employmentType: "$employmentType.title",
        createdAt: 1,
        jobPostApproveDate: 1,
        AI_Screening: 1
      }
    },
    { $sort: { createdAt: -1 } },
    { $limit: 15 }
  ]);

  return activity;
};

// Helper function for top performing posts
const getTopPerformingPosts = async (matchStage) => {
  const topPosts = await jobPostModel.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "newdepartments",
        localField: "departmentId",
        foreignField: "_id",
        as: "department"
      }
    },
    { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "employmenttypes",
        localField: "employmentTypeId",
        foreignField: "_id",
        as: "employmentType"
      }
    },
    { $unwind: { path: "$employmentType", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        jobPostId: 1,
        position: 1,
        status: 1,
        totalApplicants: 1,
        noOfPosition: 1,
        budget: 1,
        budgetType: 1,
        departmentName: "$department.name",
        employmentType: "$employmentType.title",
        createdAt: 1,
        applicantsPerPosition: {
          $cond: [
            { $gt: ["$noOfPosition", 0] },
            { $divide: ["$totalApplicants", "$noOfPosition"] },
            0
          ]
        },
        AI_Screening: 1
      }
    },
    { $sort: { totalApplicants: -1 } },
    { $limit: 10 }
  ]);

  return topPosts;
};

// Helper function to calculate percentage change
const calculatePercentageChange = (previous, current) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous * 100) * 100) / 100;
};


export const setAIScoreForPending = async (req, res) => {
  try {
    const pendingJobs = await jobApply.find({ AI_Screeing_Status: "Pending" });

    const updatePromises = pendingJobs.map((job) =>
      jobApply.updateOne(
        { _id: job._id },
        {
          $set: {
            AI_Score: 0
          }
        }
      )
    );

    const results = await Promise.all(updatePromises);

    const modifiedCount = results.reduce((sum, r) => sum + (r.modifiedCount || 0), 0);

    return success(res, "AI_Score set to 0 for pending jobs", {
      totalMatched: pendingJobs.length,
      modifiedCount
    });
  } catch (error) {
    console.error("Error updating AI_Score:", error);
    return unknownError(res, error);
  }
};




// get api for recrutier //

export const getRecruiterData = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;

    const recruiterStats = await jobPostModel.aggregate([
      {
        $match: { organizationId: new mongoose.Types.ObjectId(organizationId) }
      },
      {
        $group: {
          _id: "$createdByHrId",
          jobPostCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "employees", // change to your recruiter collection if different
          localField: "_id",
          foreignField: "_id",
          as: "recruiterInfo"
        }
      },
      { $unwind: { path: "$recruiterInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          recruiterId: "$_id",
          employeName: "$recruiterInfo.employeName",
          jobPostCount: 1,
          _id: 0
        }
      },
      { $sort: { jobPostCount: -1 } } // Optional: sort by most active recruiters
    ]);

    return success(res, "Recruiter job post data fetched successfully", recruiterStats);
  } catch (error) {
    console.error("Error fetching recruiter data:", error);
    return unknownError(res, error);
  }
};



export const getALLRecruiterData = async (req, res) => {
  try {
    const organizationId = req.employee?.organizationId;

    // Validate organization ID
    if (!organizationId) {
      return badRequest(res, "Organization ID not found");
    }

    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return badRequest(res, "Invalid organization ID format");
    }

    const {
      page = 1,
      limit = 1000,
      sortBy = 'jobPostCount',
      sortOrder = 'desc',
      search = '',
      includeInactive = false,
      period = '30',
      timeZone = 'UTC'
    } = req.query;

    // Build base match stage for job posts
    const baseJobPostMatch = {
      organizationId: new mongoose.Types.ObjectId(organizationId)
    };

    // Date range filter (default to last 30 days)
    const { startDate, endDate } = req.query;
    let dateRange;

    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        baseJobPostMatch.createdAt = { $gte: start, $lte: end };
        dateRange = { startDate: start, endDate: end };
      }
    } else if (period !== 'all') {
      // Apply default date range based on period (if not 'all')
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - parseInt(period));

      baseJobPostMatch.createdAt = { $gte: startDate, $lte: endDate };
      dateRange = { startDate, endDate };
    } else {
      // No date filter for 'all'
      dateRange = null;
    }


    // Get all unique recruiters in the organization
    const recruiters = await jobPostModel.distinct("createdByHrId", baseJobPostMatch);

    // Get detailed data for each recruiter
    const recruiterDetailPromises = recruiters.map(async (recruiterId) => {
      const recruiterMatchStage = {
        ...baseJobPostMatch,
        createdByHrId: recruiterId
      };

      // Get all detailed statistics for this recruiter
      const [
        recruiterInfo,
        overviewStats,
        // statusDistribution,
        // monthlyTrends,
        // weeklyTrends,
        // dailyTrends,
        // departmentStats,
        // designationStats,
        // employmentTypeStats,
        // recentActivity,
        topPerformingPosts
      ] = await Promise.all([
        // Get recruiter basic info
        jobPostModel.aggregate([
          { $match: recruiterMatchStage },
          {
            $lookup: {
              from: "employees",
              localField: "createdByHrId",
              foreignField: "_id",
              as: "recruiterInfo"
            }
          },
          { $unwind: { path: "$recruiterInfo", preserveNullAndEmptyArrays: true } },
          // Lookup Role info from recruiterInfo.roleId
          {
            $lookup: {
              from: "roles", // 👈 Assuming collection name is 'roles'
              localField: "recruiterInfo.roleId",
              foreignField: "_id",
              as: "roleDetails"
            }
          },
          {
            $project: {
              recruiterId: "$createdByHrId",
              recruiterName: "$recruiterInfo.employeName",
              recruiterEmail: "$recruiterInfo.email",
              recruiterImage: "$recruiterInfo.employeePhoto",
              recruiterPhone: "$recruiterInfo.phone",
              department: "$recruiterInfo.department",
              designation: "$recruiterInfo.designation",
              isActive: "$recruiterInfo.isActive",
              roles: "$roleDetails.roleName", // 👈 Will return array of role names
              _id: 0
            }
          },
          { $limit: 1 }
        ]),

        // Get overview statistics
        getOverviewStats(recruiterMatchStage),

        // // Get status distribution
        // getStatusDistribution(recruiterMatchStage),

        // // Get monthly trends
        // getMonthlyTrends(recruiterMatchStage, timeZone),

        // // Get weekly trends
        // getWeeklyTrends(recruiterMatchStage, timeZone),

        // // Get daily trends
        // getDailyTrends(recruiterMatchStage, timeZone),

        // // Get department-wise stats
        // getDepartmentWiseStats(recruiterMatchStage),

        // // Get designation-wise stats
        // getDesingationWiseStats(recruiterMatchStage),

        // // Get employment type stats
        // getEmploymentTypeStats(recruiterMatchStage),

        // // Get recent activity
        // getRecentActivity(recruiterMatchStage, 15),

        // Get top performing posts
        getTopPerformingPosts(recruiterMatchStage, 10)
      ]);

      const recruiterData = recruiterInfo[0] || {
        recruiterId: recruiterId,
        recruiterName: "Unknown",
        recruiterEmail: null,
        recruiterPhone: null,
        department: null,
        designation: null,
        isActive: true
      };

      // // Calculate performance metrics
      // const successfulPosts = statusDistribution.filter(s => 
      //   s.status === 'active' || s.status === 'closed'
      // ).reduce((sum, s) => sum + s.count, 0);


      return {
        ...recruiterData,

        // Main structure matching the expected response
        items: {
          // Overview Statistics
          overview: overviewStats,

          // // Charts data
          // charts: {
          //   statusDistribution: statusDistribution,
          //   monthlyTrends: monthlyTrends,
          //   weeklyTrends: weeklyTrends,
          //   dailyTrends: dailyTrends,
          //   departmentWiseStats: departmentStats,
          //   DesingationWiseStats: designationStats, // Note: keeping the typo to match expected response
          //   employmentTypeStats: employmentTypeStats
          // },

          // Performance metrics
          // performance: performance,

          // // Recent activity
          // recentActivity: recentActivity,

          // // Top performing posts
          topPerformingPosts: topPerformingPosts,

          // Metadata
          metadata: {
            recruiterId: recruiterId,
            organizationId: organizationId,
            // dateRange: {
            //   startDate: dateRange.startDate || null,
            //   endDate: dateRange.endDate || null,
            //   period: period,
            //   timeZone: timeZone
            // },
            dashboardType: "full",
            generatedAt: new Date()
          }
        },

        // Summary for easy access
        summary: {
          totalPosts: overviewStats.totalPosts,
          activePosts: overviewStats.activePosts,
          totalApplicants: overviewStats.totalApplicants,
          totalPositions: overviewStats.totalPositions,
          // lastActivity: recentActivity.length > 0 ? recentActivity[0].createdAt : null
        }
      };
    });

    // Wait for all recruiter data to be fetched
    const allRecruiterData = await Promise.all(recruiterDetailPromises);

    // Filter by search term if provided
    let filteredStats = allRecruiterData;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filteredStats = allRecruiterData.filter(recruiter =>
        recruiter.recruiterName?.match(searchRegex) ||
        recruiter.recruiterEmail?.match(searchRegex) ||
        recruiter.department?.match(searchRegex) ||
        recruiter.designation?.match(searchRegex)
      );
    }

    // Filter inactive recruiters if requested
    if (!includeInactive) {
      filteredStats = filteredStats.filter(recruiter => recruiter.isActive !== false);
    }

    // Sort the results
    filteredStats.sort((a, b) => {
      let aValue, bValue;

      // Handle nested sorting paths
      if (sortBy.includes('.')) {
        const keys = sortBy.split('.');
        aValue = keys.reduce((obj, key) => obj?.[key], a) || 0;
        bValue = keys.reduce((obj, key) => obj?.[key], b) || 0;
      } else {
        aValue = a[sortBy] || a.summary?.[sortBy] || a.items?.overview?.[sortBy] || 0;
        bValue = b[sortBy] || b.summary?.[sortBy] || b.items?.overview?.[sortBy] || 0;
      }

      if (sortOrder === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    // Pagination
    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedStats = filteredStats.slice(startIndex, endIndex);

    // Calculate summary statistics
    const summary = {
      totalRecruiters: filteredStats.length,
      activeRecruiters: filteredStats.filter(r => r.isActive !== false).length,
      totalJobPosts: filteredStats.reduce((sum, r) => sum + r.summary.totalPosts, 0),
      totalApplicants: filteredStats.reduce((sum, r) => sum + r.summary.totalApplicants, 0),
      totalActivePosts: filteredStats.reduce((sum, r) => sum + r.summary.activePosts, 0),
      totalBudget: filteredStats.reduce((sum, r) => sum + r.items.overview.totalBudget, 0),
      avgJobPostsPerRecruiter: filteredStats.length > 0 ?
        Math.round((filteredStats.reduce((sum, r) => sum + r.summary.totalPosts, 0) / filteredStats.length) * 100) / 100 : 0,
      // avgSuccessRate: filteredStats.length > 0 ? 
      //   Math.round((filteredStats.reduce((sum, r) => sum + r.items.performance.successRate, 0) / filteredStats.length) * 100) / 100 : 0
    };

    // Structure response to match expected format
    const responseData = {
      status: true,
      subCode: 200,
      message: "Recruiter dashboard data retrieved successfully",
      error: "",
      items: {
        recruiters: paginatedStats,
        summary,
        pagination: {
          currentPage: pageNumber,
          pageSize,
          totalRecords: filteredStats.length,
          totalPages: Math.ceil(filteredStats.length / pageSize),
          hasNextPage: endIndex < filteredStats.length,
          hasPreviousPage: pageNumber > 1
        },
        filters: {
          organizationId,
          search,
          includeInactive,
          sortBy,
          sortOrder,
          dateRange: dateRange ? {
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString()
          } : null
        }
      }
    };

    return success(res, "data featch successfully", responseData)

  } catch (error) {
    console.error("Error fetching recruiter data:", error);
    return unknownError(res, error)
  }
};


// Additional API to get detailed recruiter performance
export const getRecruiterPerformanceDetail = async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const organizationId = req.employee?.organizationId;

    if (!recruiterId || !mongoose.Types.ObjectId.isValid(recruiterId)) {
      return badRequest(res, "Valid recruiter ID is required");
    }

    if (!organizationId) {
      return badRequest(res, "Organization ID not found");
    }

    const matchStage = {
      createdByHrId: new mongoose.Types.ObjectId(recruiterId),
      organizationId: new mongoose.Types.ObjectId(organizationId)
    };

    // Get detailed performance data
    const [
      recruiterInfo,
      overviewStats,
      statusDistribution,
      monthlyTrends,
      departmentStats,
      recentPosts
    ] = await Promise.all([
      // Recruiter basic info
      jobPostModel.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "employees",
            localField: "createdByHrId",
            foreignField: "_id",
            as: "recruiterInfo"
          }
        },
        { $unwind: "$recruiterInfo" },
        {
          $project: {
            recruiterName: "$recruiterInfo.employeName",
            recruiterEmail: "$recruiterInfo.email",
            department: "$recruiterInfo.department",
            designation: "$recruiterInfo.designation",
            _id: 0
          }
        },
        { $limit: 1 }
      ]),

      // Overview statistics
      getOverviewStats(matchStage),

      // Status distribution
      getStatusDistribution(matchStage),

      // Monthly trends
      getMonthlyTrends(matchStage, 'UTC'),

      // Department-wise stats
      getDepartmentWiseStats(matchStage),

      // Recent posts
      getRecentActivity(matchStage)
    ]);

    const responseData = {
      recruiterInfo: recruiterInfo[0] || null,
      performance: {
        overview: overviewStats,
        statusDistribution,
        monthlyTrends,
        departmentStats,
        recentPosts
      }
    };

    return success(res, "Recruiter performance detail fetched successfully", responseData);

  } catch (error) {
    console.error("Error fetching recruiter performance detail:", error);
    return unknownError(res, error);
  }
};