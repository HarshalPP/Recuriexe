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
      } else if (roleDetails.jobPostDashboard.jobPostApprove) {
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
    const createdAt = new Date(activePlan?.createdAt);
    const expiryDate = new Date(createdAt);
    expiryDate.setDate(expiryDate.getDate() + (activePlan.planDurationInDays || 0));

    if (new Date() > expiryDate) {
      return badRequest(res, "Plan has expired. Please renew or upgrade your plan.");
    }

    // ✅ Check job post usage
    const currentJobPostCount = await jobPostModel.countDocuments({ organizationId: NewOrg });
    if (currentJobPostCount >= activePlan.NumberOfJobPosts) {
      return badRequest(
        res,
        `Job post limit reached. Allowed: ${activePlan.NumberOfJobPosts}, Current: ${currentJobPostCount}. Please upgrade your plan.`
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
    console.log('roleDetails', roleDetails)
    const allowedRoles = ['admin', 'productowner', 'superadmin'];
    const roleName = roleDetails.roleName?.toLowerCase();
    const isAllowed = roleDetails.jobPostDashboard.jobPostApprove === true;

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
    // if (!jobPostExpired || jobPostExpired === "false") {
    //   matchStage.jobPostExpired = false
    // } else if (jobPostExpired === "true") {
    //   matchStage.jobPostExpired = true
    // }
    // Job Title - partial match, tolerant of spacing
    if (jobTitle) {
      matchStage.position = { $regex: jobTitle, $options: "i" };
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
      totalPages: Math.ceil(totalCount / pageLimit)
    });
  } catch (error) {
    console.error("Error:", error);
    unknownError(res, error);
  }
};

export const updateJobPost = async (req, res) => {
  try {
    const { id } = req.params;

    const updateFields = req.body;

    const existingJobPost = await jobPostModel.findById(id);
    if (!existingJobPost) {
      return badRequest(res, "Job post not found");
    }
    const isStatusChanging = updateFields.status && updateFields.status !== existingJobPost.status;

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

if(jobPostId && jobPostId !== 'all'){
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

