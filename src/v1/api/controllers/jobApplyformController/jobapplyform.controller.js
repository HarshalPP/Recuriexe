import {
  success,
  unknownError,
  serverValidation,
  badRequest
} from "../../formatters/globalResponse.js"
import { validationResult } from "express-validator";
import { sendThankuEmail } from "../../services/emailservices/email.services.js"
import { screenApplicant } from "../../services/screeningAI/screeningAi.services.js"
import jobApply from "../../models/jobformModel/jobform.model.js"
import vacancyRequestModel from "../../models/vacencyModel/vacancyRequest.model.js";
import jobPostModel from "../../models/jobPostModel/jobPost.model.js";
import User from "../../models/AuthModel/auth.model.js"
import employeemodel from "../../models/employeemodel/employee.model.js"
import { UnknownError } from "postmark/dist/client/errors/Errors.js";
import aiModel from "../../models/AiModel/ai.model.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import mailSwitchesModel from "../../models/mailModel/mailSwitch.model.js"
import designationModel from "../../models/designationModel/designation.model.js";
import cron from 'node-cron';
import ScreeningResultModel from "../../models/screeningResultModel/screeningResult.model.js";
import portalsetUpModel  from "../../models/PortalSetUp/portalsetup.js"
import organizationModel from "../../models/organizationModel/organization.model.js"
import dayjs from 'dayjs';
import {processAIScreeningForCandidate} from  "../../controllers/AIController/aiConfig.controller.js"
import AIRule from "../../models/AiScreeing/AIRule.model.js";
import JobDescriptionModel from "../../models/jobdescriptionModel/jobdescription.model.js";
import targetCompanyModel from "../../models/companyModel/targetCompany.model.js"
import {jobApplyToGoogleSheet} from "../../controllers/googleSheet/jobApplyGoogleSheet.js"
import organizationPlanModel from "../../models/PlanModel/organizationPlan.model.js";
import { generateExcelAndUpload } from "../../Utils/excelUploader.js"

// Run at 11:59 PM every day
cron.schedule("59 23 * * *", async () => {
  try {
    const now = new Date();
    // Find and update all job posts whose expiredDate has passed and are not yet marked expired
    const result = await jobPostModel.updateMany(
      {
        expiredDate: { $lt: now },
        jobPostExpired: false
      },
      { $set: { jobPostExpired: true } }
    );

    console.log(`Today Job Expire ${result.modifiedCount}`);
  } catch (error) {
    console.error("Error running job expiry cron:", error);
  }
});



//   import jobFormGoogleSheet from "../../../helpers/jobFormGoogleSheet.js"; // adjust path
//   import jobFormGoogleSheet from "../../../helpers/jobFormGoogleSheet.js"; // adjust path


// Apply Job form //


// export const jobApplyFormAdd = async (req, res) => {
//   try {
//     let token = req.user._id;
//     const userId = req.user._id;

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     // ⛔ Prevent duplicate application for same job
//     const alreadyApplied = await jobApply.findOne({
//       candidateId: userId,
//       jobPostId: req.body.jobPostId,
//     });

//     //  const organizationId = req.employee.organizationId
//     if (alreadyApplied) {
//       return badRequest(res, "You have already applied for this job.");
//     }

//     // Check if the user has applied for any position within the last 2 months
//     // const recentApplication = await jobApply.findOne({
//     //   mobileNumber: req.body.mobileNumber,
//     //   createdAt: { $gte: new Date(currentTime - twoMonthsInMilliseconds) },
//     // });

//     // if (recentApplication) {
//     //   return badRequest(
//     //     res,
//     //     "You can reapply for any job only after 2 months from your last application."
//     //   );
//     // }

//     if (!req.body.resume) {
//       return badRequest(res, "Please Upload Resume before apply...")
//     }

//     let fieldsToProcess = [
//       "name",
//       "emailId",
//       "currentDesignation",
//       "selectPosition",
//       "lastOrganization",
//       "currentLocation",
//       "preferredLocation",
//     ];
//     fieldsToProcess.forEach((field) => {
//       if (req.body[field]) {
//         req.body[field] = req.body[field].trim();
//       }
//     });

//     const candidateMobileNumber = req.body.mobileNumber;
//     req.body.candidateId = token;

//     // === AI SCREENING LOGIC STARTS HERE ===

//     const jobPost = await jobPostModel.findById(req.body.jobPostId).lean();
//     if (!jobPost) {
//       return badRequest(res, "Job post not found.");
//     }

//     const finddesingnation = await designationModel.findById(jobPost.designationId).lean();
//     if (!finddesingnation) {
//       return badRequest(res, "Designation not found for this job post.");
//     }



//     req.body.departmentId = jobPost.departmentId;
//     req.body.subDepartmentId = jobPost.subDepartmentId;
//     req.body.position = finddesingnation.name;
//     req.body.branchId = jobPost.branchId[0]; // Assuming branchId is an array, taking the first element

//     const vacancyRequest = await vacancyRequestModel.findOne({ jobPostId: req.body.jobPostId }).lean();


//     const aiScreeningEnabled =
//       jobPost?.AI_Screening == "true" || vacancyRequest?.AI_Screening == "true";

//     const requiredPercentage = Math.max(
//       jobPost?.AI_Percentage || 0,
//       vacancyRequest?.AI_Percentage || 0
//     );

//     const aiConfig = await aiModel.findOne({ title: 'AI Screening', enableAIResumeParsing: true });

//     if (aiScreeningEnabled) {
//       if (!aiConfig) {
//         console.warn("AI screening is enabled but the AI configuration is missing (title: 'AI Screening', enableAIResumeParsing: true). Skipping screening.");
//         req.body.AI_Result = "false";
//       } else {
//         const aiResult = await screenApplicant(req.body.jobPostId, req.body.resume);

//         if (!aiResult || aiResult.error || aiResult.status == 429) {
//           req.body.AI_Result = "false";
//         }
//         else if (aiResult.matchPercentage < requiredPercentage) {
//           return badRequest(
//             res,
//             `AI screening failed: Your resume match score is ${aiResult.matchPercentage}%. Required: ${requiredPercentage}%`
//           );
//         } else {
//           req.body.AI_Result = "true";
//           req.body.isEligible = aiResult.isEligible;
//           req.body.matchPercentage = aiResult.matchPercentage;
//           req.body.summary = aiResult.summary;
//         }
//       }
//     }

//     const jobFormInstance = new jobApply(req.body);
//     const jobApplyForm = await jobFormInstance.save(); // triggers pre("save")


//     if (jobApplyForm.jobFormType == "recommended") {
//       await jobApply.findByIdAndUpdate(
//         { _id: jobApplyForm._id },
//         {
//           status: "inProgress",
//           resumeShortlisted: "shortlisted",
//           recommendedByID: token.Id,
//         },
//         { new: true }
//       );
//     }

//     //   await jobFormGoogleSheet(jobApplyForm);
//     success(res, "Job Applied Successfully", jobApplyForm);

//     // const jobAapplyMail = await mailSwitchesModel.findOne({organizationId:new mongoose.Types.ObjectId(organizationId)});
//     const jobAapplyMail = await mailSwitchesModel.findOne({});
//     if (jobAapplyMail?.masterMailStatus && jobAapplyMail?.hrmsMail.hrmsMail && jobAapplyMail?.hrmsMail.jobApplyMail) {
//       await sendThankuEmail(req.body.emailId, req.body.name, req.body.position);
//       // console.log('Sending email to HR:')
//     }

//   } catch (error) {

//     console.log(error, "heroo");
//     unknownError(res, error);

//   }
// }


export const jobApplyFormAdd = async (req, res) => {  
  try {
      


    const { emailId, jobPostId, resume ,name, } = req.body;
// not hanlde organization 
    const organizationFind = await organizationModel.findOne().select('name')
// not hanlde organization 
const portalsetUpDetail = await portalsetUpModel.findOne().select('maxApplicationsPerEmployee minDaysBetweenApplications')


    if (!jobPostId) {
      return badRequest(res, "Job post Id required.");
    }

    const jobPost = await jobPostModel.findById(jobPostId).lean();
    if (!jobPost) {
      return badRequest(res, "Job post not found.");
    }

    if (jobPost.applicantsCount >= jobPost.numberOfApplicant) {
      return badRequest(res, "This job is no longer accepting applications.");
    }
    // const alreadyApplied = await jobApply.findOne({
    //   emailId,
    //   jobPostId: jobPostId,
    // });

    // if (alreadyApplied) {
    //   return badRequest(res, "You have already applied for this job.");
    // }

if (portalsetUpDetail) {
  const maxApplications = portalsetUpDetail.maxApplicationsPerEmployee;
  const minDaysGap = portalsetUpDetail.minDaysBetweenApplications;

  const now = new Date();
  const minDate = new Date(now);
  minDate.setDate(minDate.getDate() - minDaysGap);

  // 🔍 Get all applications by user to this jobPostId within the last `minDaysGap` days
  const recentApplications = await jobApply.find({
    emailId,
    // jobPostId: jobPostId,
    createdAt: { $gte: minDate }
  }).sort({ createdAt: -1 });

  // 🚫 Too many applications within restricted period
  if (recentApplications.length >= maxApplications) {
    const lastAppliedAt = new Date(recentApplications[0].createdAt);
    const nextAllowedDate = new Date(lastAppliedAt);
    nextAllowedDate.setDate(nextAllowedDate.getDate() + minDaysGap);
    
    const daysLeft = Math.ceil((nextAllowedDate - now) / (1000 * 60 * 60 * 24));

 return badRequest(
  res,
`Not eligible to apply. Try again after ${daysLeft} day(s) on ${nextAllowedDate.toDateString()}.`
);
  }
}
    if (!resume) {
      return badRequest(res, "Please upload your resume before applying.");
    }

    const fieldsToProcess = [
      "name",
      "emailId",
      "currentDesignation",
      "selectPosition",
      "lastOrganization",
      "currentLocation",
      "preferredLocation",
    ];
    fieldsToProcess.forEach((field) => {
      if (req.body[field]) {
        req.body[field] = req.body[field].trim();
      }
    });

    const finddesingnation = await designationModel.findById(jobPost.designationId).lean();
    if (!finddesingnation) {
      return badRequest(res, "Designation not found for this job post.");
    }

    req.body.departmentId = jobPost.departmentId;
    req.body.subDepartmentId = jobPost.subDepartmentId;
    req.body.position = finddesingnation.name;
    req.body.branchId = jobPost.branchId[0];
    req.body.JobType= jobPost.JobType || ""
    req.body.jobFormType = "request"
    req.body.orgainizationId= jobPost.organizationId || null;


    // Save the job application
    const jobFormInstance = new jobApply(req.body);
    const jobApplyForm = await jobFormInstance.save();

    // ✅ Check if number of applicants reaches the limit
    const totalApplications = await jobApply.countDocuments({
      jobPostId: jobPostId
    });

    const updatedJobPost = await jobPostModel.findByIdAndUpdate(
      jobPostId,
      { $inc: { totalApplicants: 1 } },
      { new: true }
    );

  if (jobPost.numberOfApplicant > 0 && totalApplications >= jobPost.numberOfApplicant) {
  await jobPostModel.findByIdAndUpdate(jobPostId, {
    jobPostExpired: true,
  });
}

    success(res, "Job Applied Successfully", jobApplyForm);

    const jobApplyMailSwitch = await mailSwitchesModel.findOne({});
    if (
      jobApplyMailSwitch?.masterMailStatus &&
      jobApplyMailSwitch?.hrmsMail?.hrmsMail &&
      jobApplyMailSwitch?.hrmsMail?.jobApplyMail
    ) {
      await sendThankuEmail(emailId, name.toUpperCase() , jobPost?.position , organizationFind?.name?.toUpperCase());
    }
// job apply google sheete data save 
  await jobApplyToGoogleSheet(jobApplyForm._id)

    const AIRuleData = await AIRule.findOne({ AutomaticScreening: true });
     if(AIRule){
      await processAIScreeningForCandidate({
        jobPostId: jobPostId,
        resume: resume,
        candidateId: jobApplyForm._id,
        organizationId: jobPost.organizationId,
      });

    }

  } catch (error) {
    console.error("Error in :", error);
    unknownError(res, error);
  }
};




// Get JobApplyed  details //
export const getAllJobApplied = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;


    const page = parseInt(req.query.page) || 1; // default page 1
    const limit = parseInt(req.query.limit) || 10; // default 10 items per page
    const skip = (page - 1) * limit;


      // Extract search and filter parameters
    const { startDate, endDate, search, position, emailId, mobileNumber, AI_Screeing_Result , resumeShortlisted , departmentId} = req.query;

        // Build match conditions
    let matchConditions = {
      status: { $in: ["active"] },
      jobFormType: "request",
    };


     // Add date range filter
    if (startDate || endDate) {
      matchConditions.createdAt = {};
      if (startDate) {
        matchConditions.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add 23:59:59 to include the entire end date
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        matchConditions.createdAt.$lte = endDateTime;
      }
    }

    if (organizationId) {
      matchConditions.orgainizationId = new ObjectId(organizationId);
    }


       // Add search conditions
    const searchConditions = [];
    
    if (search) {
      // General search across multiple fields
      searchConditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { emailId: { $regex: search, $options: "i" } },
          { mobileNumber: { $regex: search, $options: "i" } },
          { position: { $regex: search, $options: "i" } },
          { candidateUniqueId: { $regex: search, $options: "i" } }
        ]
      });
    }

    // Specific field searches
    if (position) {
      searchConditions.push({
        position: { $regex: position, $options: "i" }
      });
    }

    if (emailId) {
      searchConditions.push({
        emailId: { $regex: emailId, $options: "i" }
      });
    }

    if (mobileNumber) {
      searchConditions.push({
        mobileNumber: { $regex: mobileNumber, $options: "i" }
      });
    }

    // Combine all search conditions
    if (searchConditions.length > 0) {
      matchConditions.$and = searchConditions;
    }

    if (AI_Screeing_Result) {
      matchConditions.AI_Screeing_Result = AI_Screeing_Result;
    }

    if (resumeShortlisted) {
      matchConditions.resumeShortlisted = resumeShortlisted;
    }

    if (departmentId) {
      matchConditions.departmentId = new ObjectId(departmentId);
    }



    const jobAppliedDetails = await jobApply.aggregate([
      {
        $match: matchConditions,
      },
      {
        $sort: { createdAt: -1 },
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
      {
        $unwind: {
          path: "$department",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, name: 1 } }],
          as: "branches",
        },
      },
      {
        $unwind: {
          path: "$branches",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "managerID",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, employeName: 1 } }],
          as: "manager",
        },
      },
      {
        $unwind: {
          path: "$manager",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "feedbackinterviewers",
          localField: "_id",
          foreignField: "jobApplyFormId",
          as: "hrFeedbackinterviewers",
        },
      },
      {
        $unwind: {
          path: "$hrFeedbackinterviewers",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "hrFeedbackinterviewers.interviewerId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, employeName: 1 } }],
          as: "hrInterviewerDetails",
        },
      },
      {
        $unwind: {
          path: "$hrInterviewerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "interviewdetails",
          let: { interviewIds: "$InterviewDetailsIds" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$interviewIds"] },
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            {
              $lookup: {
                from: "employees", // your employee collection name
                localField: "interviewerId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      employeName: 1,
                      email: 1,
                    },
                  },
                ],
                as: "HrinterviewName",
              },
            },
            {
              $unwind: {
                path: "$HrinterviewName",
                preserveNullAndEmptyArrays: true
              },
            },
            {
              $lookup: {
                from: "employees", // your employee collection name
                localField: "managerId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      employeName: 1,
                      email: 1,
                    },
                  },
                ],
                as: "ManagerinterviewName",
              },
            },
            {
              $unwind: {
                path: "$ManagerinterviewName",
                preserveNullAndEmptyArrays: true
              },
            }
          ],
          as: "interviewDetails",
        },
      }, {

        $lookup: {
          from: "users",
          localField: "candidateId",
          foreignField: "_id",
          as: "candidateDetails",
        }

      }, {
        $unwind: {
          path: "$candidateDetails",
          preserveNullAndEmptyArrays: true, // If you want to keep jobs without user details
        }
      },

      {
        $lookup: {
          from: "jobposts",
          localField: "jobPostId",
          foreignField: "_id",
          as: "jobPostDetail",
        },
      },
      {
        $unwind: {
          path: "$jobPostDetail",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "newdesignations",
          localField: "jobPostDetail.designationId",
          foreignField: "_id",
          as: "designationDetail",
        },
      },
      {
        $unwind: {
          path: "$designationDetail",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "newdepartments",
          localField: "jobPostDetail.subDepartmentId",
          foreignField: "subDepartments._id",
          as: "subDepartmentDetail",
        },
      },
      {
        $unwind: {
          path: "$subDepartmentDetail",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          subDepartment: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$subDepartmentDetail.subDepartments",
                  as: "sub",
                  cond: {
                    $eq: ["$$sub._id", "$jobPostDetail.subDepartmentId"]
                  }
                }
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          candidateUniqueId: 1,
          name: 1,
          mobileNumber: 1,
          emailId: 1,
          resume: 1,
          AI_Screeing_Result: 1,
          AI_Screeing_Status: 1,
          AI_Score: 1,
          AI_Confidence: 1,
          jobPostId: 1,
          resumeShortlisted:1,
          Remark: 1,
          JobType:1,
          currentCTC:1,
          expectedCTC:1,
          isEligible: 1,
          summary: 1,
          matchPercentage: 1,
          lastOrganization: 1,
          position: 1,
          createdAt: 1,
          department: 1,
          designationDetail: {
            _id: 1,
            name: 1,
          },
          subDepartment: {
            _id: 1,
            name: 1
          },
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    const departmentData = {};

    jobAppliedDetails.forEach((job) => {
      if (!job.department || !job.department.name) return;

      const departmentName = job.department.name;

      if (job.interviewDetails) {
        job.hrIsInterviewer =
          job.interviewDetails.interviewerId?.toString() == req.Id?.toString()
            ? "yes"
            : "no";
      }

      if (!departmentData[departmentName]) {
        departmentData[departmentName] = [];
      }
      departmentData[departmentName].push(job);
    });



    const allJobs = Object.values(departmentData)
      .flat()  // Flatten the array of department job arrays into a single array
      .filter((job) => job.createdAt)  // Ensure the job has a `createdAt` field
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));  // Sort jobs by `createdAt` in descending order

    const totalCount = await jobApply.countDocuments({ status: "active", jobFormType: "request" });
    const totalShortlisted = await jobApply.countDocuments({ status: "active", jobFormType: "request", resumeShortlisted: "shortlisted" });
    const totalRejected = await jobApply.countDocuments({ status: "active", jobFormType: "request", resumeShortlisted: "notshortlisted" });


    return success(res, "All job Applied Form details", {
      data: allJobs,
      page,
      limit,
      totalCount,
      totalShortlisted,
      totalRejected
    });
  } catch (error) {
    console.error("Error in getAllJobApplied:", error.message);
    return UnknownError(res, error);
  }
};

// geT Application by ID //
export const getJobAppliedById = async (req, res) => {
  try {
    const id = req.params.id;
    const organizationId = req.employee.organizationId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, "Invalid Job Application ID");
    }

    const jobApplication = await jobApply.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          status: "active",
          jobFormType: "request",
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
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, name: 1 } }],
          as: "branches",
        },
      },
      { $unwind: { path: "$branches", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "employees",
          localField: "managerID",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, employeName: 1 } }],
          as: "manager",
        },
      },
      { $unwind: { path: "$manager", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "feedbackinterviewers",
          localField: "_id",
          foreignField: "jobApplyFormId",
          as: "hrFeedbackinterviewers",
        },
      },
      { $unwind: { path: "$hrFeedbackinterviewers", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "employees",
          localField: "hrFeedbackinterviewers.interviewerId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, employeName: 1 } }],
          as: "hrInterviewerDetails",
        },
      },
      { $unwind: { path: "$hrInterviewerDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "interviewdetails",
          let: { interviewIds: "$InterviewDetailsIds" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$interviewIds"] },
              },
            },
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: "employees",
                localField: "interviewerId",
                foreignField: "_id",
                pipeline: [{ $project: { _id: 1, employeName: 1, email: 1 } }],
                as: "HrinterviewName",
              },
            },
            { $unwind: { path: "$HrinterviewName", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "employees",
                localField: "managerId",
                foreignField: "_id",
                pipeline: [{ $project: { _id: 1, employeName: 1, email: 1 } }],
                as: "ManagerinterviewName",
              },
            },
            { $unwind: { path: "$ManagerinterviewName", preserveNullAndEmptyArrays: true } },
          ],
          as: "interviewDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "candidateId",
          foreignField: "_id",
          as: "candidateDetails",
        },
      },
      { $unwind: { path: "$candidateDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "jobposts",
          localField: "jobPostId",
          foreignField: "_id",
          as: "jobPostDetail",
        },
      },
      { $unwind: { path: "$jobPostDetail", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "jobdescriptions",
          localField: "jobPostDetail.jobDescriptionId",
          foreignField: "_id",
          as: "jobDescriptionDetail",
        },
      },
      { $unwind: { path: "$jobDescriptionDetail", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "newdesignations",
          localField: "jobPostDetail.designationId",
          foreignField: "_id",
          as: "designationDetail",
        },
      },
      { $unwind: { path: "$designationDetail", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "newdepartments",
          localField: "jobPostDetail.subDepartmentId",
          foreignField: "subDepartments._id",
          as: "subDepartmentDetail",
        },
      },
      { $unwind: { path: "$subDepartmentDetail", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          subDepartment: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$subDepartmentDetail.subDepartments",
                  as: "sub",
                  cond: {
                    $eq: ["$$sub._id", "$jobPostDetail.subDepartmentId"],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          candidateUniqueId: 1,
          name: 1,
          mobileNumber: 1,
          emailId: 1,
          resume: 1,
          AI_Screeing_Result: 1,
          AI_Screeing_Status: 1,
          AI_Score: 1,
          AI_Confidence: 1,
          jobPostId: 1,
          jobDescriptionDetail: 1,
          resumeShortlisted: 1,
          Remark: 1,
          JobType: 1,
          currentCTC: 1,
          expectedCTC: 1,
          isEligible: 1,
          summary: 1,
          matchPercentage: 1,
          lastOrganization: 1,
          position: 1,
          createdAt: 1,
          department: 1,
          designationDetail: {
            _id: 1,
            name: 1,
          },
          subDepartment: {
            _id: 1,
            name: 1,
          },
        },
      },
    ]);

    if (!jobApplication || jobApplication.length === 0) {
      return success(res, "Job application not found", null);
    }
  // Find all candidate IDs to find prev/next
const candidates = await jobApply
  .find({ organizationId: new ObjectId(organizationId) })
  .sort({ createdAt: -1 })
  .select('_id')
  .lean(); // optional but improves performance

// Ensure both sides are strings for reliable comparison
const index = candidates.findIndex((c) => c._id.toString() === id.toString());

let previousCandidateId = null;
let nextCandidateId = null;

if (index > 0) {
  previousCandidateId = candidates[index - 1]._id;
}
if (index < candidates.length - 1) {
  nextCandidateId = candidates[index + 1]._id;
}

// Ensure jobApplication[0] exists before assigning
if (jobApplication[0]) {
  jobApplication[0].previousCandidateId = previousCandidateId;
  jobApplication[0].nextCandidateId = nextCandidateId;
}


    return success(res, "Job application details fetched successfully", jobApplication[0]);
  } catch (error) {
    console.error("Error in getJobAppliedById:", error.message);
    return UnknownError(res, error);
  }
};



// create _id by get detail

export const getJobAppliedDetail = async (req, res) => {
  try {
    const { id } = req.query

    if (!id) {
      return badRequest(res, "id are required")
    }
    const jobAppliedDetail = await jobApply.findById(id).populate('candidateId')
    return success(res, "Applied Form details", jobAppliedDetail)
  } catch (error) {
    return UnknownError(res, error);
  }
}


// get Recurtment pipeline //

export const RecruitmentPipeline = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page 1
    const limit = parseInt(req.query.limit) || 10; // default 10 items per page
    const skip = (page - 1) * limit;


    const statuses = req.query.status
      ? Array.isArray(req.query.status)
        ? req.query.status
        : req.query.status.split(',')
      : ["shortlisted"]; // default to 'shortlisted' if none provided

    console.log("statuses", statuses)

    const jobAppliedDetails = await jobApply.aggregate([
      {
        $match: {
          status: { $in: statuses },
          jobFormType: "request",
        },
      },
      {
        $sort: { updatedAt: -1 }
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
      {
        $unwind: {
          path: "$department",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, name: 1 } }],
          as: "branches",
        },
      },
      {
        $unwind: {
          path: "$branches",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "managerID",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, employeName: 1 } }],
          as: "manager",
        },
      },
      {
        $unwind: {
          path: "$manager",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "feedbackinterviewers",
          localField: "_id",
          foreignField: "jobApplyFormId",
          as: "hrFeedbackinterviewers",
        },
      },
      {
        $unwind: {
          path: "$hrFeedbackinterviewers",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "hrFeedbackinterviewers.interviewerId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, employeName: 1 } }],
          as: "hrInterviewerDetails",
        },
      },
      {
        $unwind: {
          path: "$hrInterviewerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "interviewdetails",
          let: { interviewIds: "$InterviewDetailsIds" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $gt: [{ $size: { $ifNull: ["$$interviewIds", []] } }, 0] },
                    { $in: ["$_id", "$$interviewIds"] }
                  ]
                }
              }
            },

            {
              $sort: { createdAt: -1 },
            },
            {
              $lookup: {
                from: "employees", // your employee collection name
                localField: "interviewerId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      employeName: 1,
                      email: 1,
                    },
                  },
                ],
                as: "HrinterviewName",
              },
            },
            {
              $unwind: {
                path: "$HrinterviewName",
                preserveNullAndEmptyArrays: true
              },
            },
            {
              $lookup: {
                from: "employees", // your employee collection name
                localField: "managerId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      employeName: 1,
                      email: 1,
                    },
                  },
                ],
                as: "ManagerinterviewName",
              },
            },
            {
              $unwind: {
                path: "$ManagerinterviewName",
                preserveNullAndEmptyArrays: true
              },
            }
          ],
          as: "interviewDetails",
        },
      },

      {
        $project: {
          candidateUniqueId: 1,
          name: 1,
          mobileNumber: 1,
          emailId: 1,
          highestQualification: 1,
          university: 1,
          graduationYear: 1,
          cgpa: 1,
          address: 1,
          state: 1,
          city: 1,
          pincode: 1,
          skills: 1,
          resume: 1,
          joiningDate: 1,
          salarySlip: 1,
          finCooperOfferLetter: 1,
          pathofferLetterFinCooper: 1,
          preferedInterviewMode: 1,
          position: 1,
          knewaboutJobPostFrom: 1,
          currentDesignation: 1,
          lastOrganization: 1,
          startDate: 1,
          endDate: 1,
          reasonLeaving: 1,
          totalExperience: 1,
          currentCTC: 1,
          preferredLocation: 1,
          currentLocation: 1,
          gapIfAny: 1,
          hrInterviewSchedule: 1,
          preOffer: 1,
          postOffer: 1,
          sendOfferLetterToCandidate: 1,
          resumeShortlisted: 1,
          finCooperOfferLetter: 1,
          resume: 1,
          docVerification: 1,
          status: 1,
          feedbackByHr: 1,
          department: 1,
          branches: 1,
          manager: 1,
          interviewDetails: 1,
          hrFeedbackinterviewers: 1,
          hrInterviewerDetails: 1,
          candidateStatus: 1,
          isEligible: 1,
          matchPercentage: 1,
          summary: 1,
          createdAt: 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);


    const departmentData = {};

    jobAppliedDetails.forEach((job) => {
      if (!job.department || !job.department.name) return;

      const departmentName = job.department.name;

      if (job.interviewDetails) {
        job.hrIsInterviewer =
          job.interviewDetails.interviewerId?.toString() == req.Id?.toString()
            ? "yes"
            : "no";
      }

      if (!departmentData[departmentName]) {
        departmentData[departmentName] = [];
      }
      departmentData[departmentName].push(job);
    });

    // const jobAppliedByDepartment = Object.keys(departmentData).map((departmentName) => ({
    //   department: departmentName,
    //   jobs: departmentData[departmentName]
    //     .filter((job) => job.createdAt)
    //     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    // }));

    const allJobs = Object.values(departmentData)
      .flat()  // Flatten the array of department job arrays into a single array
      .filter((job) => job.createdAt)  // Ensure the job has a `createdAt` field
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));  // Sort jobs by `createdAt` in descending order



    const totalCount = await jobApply.countDocuments({ status: "active", jobFormType: "request" });


    return success(res, "All job Applied Form details", {
      data: allJobs,
      page,
      limit,
      totalCount
    });
  } catch (error) {
    console.error("Error in getAllJobApplied:", error.message);
    return UnknownError(res, error);
  }
};



// get Applied candidate indivisual data //

export const getMyAppliedJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const candidateId = req.user._id;

    if (!candidateId) {
      return badRequest(res, "candidate not found")
    }

    const skip = (page - 1) * limit;

    const jobAppliedDetails = await jobApply.aggregate([
      {
        $match: {
          status: "active",
          candidateId: candidateId,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, name: 1 } }],
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
          pipeline: [{ $project: { _id: 0, name: 1 } }],
          as: "branches",
        },
      },
      {
        $unwind: { path: "$branches", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "interviewdetails",
          let: { interviewIds: "$InterviewDetailsIds" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$interviewIds"] },
              },
            },
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: "employees",
                localField: "interviewerId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      employeName: 1,
                      email: 1,
                    },
                  },
                ],
                as: "HrinterviewName",
              },
            },
            {
              $unwind: {
                path: "$HrinterviewName",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "interviewDetails",
        },
      },
      {
        $lookup: {
          from: "feedbackinterviewers",
          localField: "_id",
          foreignField: "jobApplyFormId",
          as: "hrFeedbackinterviewers",
        },
      },
      {
        $unwind: {
          path: "$hrFeedbackinterviewers",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "hrFeedbackinterviewers.interviewerId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, employeName: 1 } }],
          as: "hrInterviewerDetails",
        },
      },
      {
        $unwind: {
          path: "$hrInterviewerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          candidateUniqueId: 1,
          name: 1,
          mobileNumber: 1,
          emailId: 1,
          highestQualification: 1,
          university: 1,
          graduationYear: 1,
          cgpa: 1,
          address: 1,
          state: 1,
          city: 1,
          pincode: 1,
          skills: 1,
          resume: 1,
          salarySlip: 1,
          finCooperOfferLetter: 1,
          pathofferLetterFinCooper: 1,
          preferedInterviewMode: 1,
          position: 1,
          knewaboutJobPostFrom: 1,
          currentDesignation: 1,
          lastOrganization: 1,
          startDate: 1,
          endDate: 1,
          reasonLeaving: 1,
          totalExperience: 1,
          currentCTC: 1,
          preferredLocation: 1,
          currentLocation: 1,
          gapIfAny: 1,
          interviewSchedule: 1,
          status: 1,
          resumeShortlisted: 1,
          feedbackByHr: 1,
          department: 1,
          branches: 1,
          employees: 1,
          manager: 1,
          interviewDetails: 1,
          hrFeedbackinterviewers: 1,
          hrInterviewerDetails: 1,
          hrInterviewSchedule: 1,
          candidateStatus: 1,
          isEligible: 1,
          matchPercentage: 1,
          summary: 1,
          createdAt: 1,
        },
      },
    ]);

    const totalCount = await jobApply.countDocuments({
      status: "active",
      candidateId,
    });

    return success(res, "My job applications fetched successfully", {
      jobs: jobAppliedDetails,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error in getMyAppliedJobs:", error.message);
    return UnknownError(res, error);
  }
};





export const jobApplySendToManager = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const managerExists = await employeemodel.findById(req.body.managerID);
    if (!managerExists) {
      return notFound(res, "Invalid managerID provided.");
    }

    const ids = req.body.ids;
    const managerID = req.body.managerID;
    const status = req.body.status;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return badRequest(res, "IDs should be a non-empty array");
    }

    const validStatuses = [
      "hold",
      "shortlisted",
      "reject",
      "inProgress",
      "managerReview",
      "shortlistedBYManager",
    ];

    if (!status || !validStatuses.includes(status)) {
      return badRequest(
        res,
        "Status must be either 'hold', 'shortlisted','inProgress','managerReview','shortlistedBYManager' or 'reject'"
      );
    }

    for (const id of ids) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, `Invalid ID: ${id}`);
      }
    }

    const updatedForms = await jobApply.updateMany(
      { _id: { $in: ids } },
      { status, managerID },
      { new: true }
    );

    if (updatedForms.modifiedCount > 0) {
      const updatedJobForms = await jobApply.find({
        _id: { $in: ids },
      });
      return success(res, `Job forms updated to '${status}'`, updatedJobForms);
    } else {
      return badRequest(res, "No job forms were updated");
    }
  } catch (error) {
    return unknownError(res, error);
  }
};



// Manager Review //
export const getJobFormSendManagerReview = async (req, res) => {
  try {
    const managerID = req.employee.id;
    const filterByInterviewTaken = req.query.sortByInterviewTaken; // "yes" or "no"
    const filterByManagerInterview = req.query.InterviewBy; // e.g., "manager"

    // Step 1: Fetch job applications with managerReview status
    const jobApplied = await jobApply.find({
      status: "managerReview",
    })
      .populate({
        path: 'InterviewDetailsIds',
        populate: [
          { path: 'managerId', select: 'employeName' },
          { path: 'interviewerId', select: 'employeName' },
        ],
      })
      .sort({ createdAt: -1 });




    // Step 2: Filter each application's interview details
    const filteredData = jobApplied.map(application => {
      const filteredInterviews = application.InterviewDetailsIds.filter(interview => {
        const matchesManager = interview.managerId?._id?.toString() === managerID.toString();
        const matchesInterviewTaken = !filterByInterviewTaken || interview.interviewTaken === filterByInterviewTaken;
        const matchesInterviewer = !filterByManagerInterview || interview.interviewBy === filterByManagerInterview;

        return matchesManager && matchesInterviewTaken && matchesInterviewer;
      });

      const sortedInterviews = filteredInterviews.sort((a, b) => b.interviewRound - a.interviewRound);

      return {
        ...application.toObject(),
        InterviewDetailsIds: sortedInterviews,
      };
    }).filter(application => application.InterviewDetailsIds.length > 0);

    success(res, "Filtered job applied forms by interviewTaken and interviewer", {
      count: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    unknownError(res, error);
  }
};


export const getDashboardSummary = async (req, res) => {
  try {

    const orgainizationId = req.employee.organizationId;

    const { year = new Date().getFullYear(), period = "year" } = req.query;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let startDate, endDate;
    const now = new Date();

    if (period == "7days") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
      endDate = now;
    }
    else if (period == "30days") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 30);
      endDate = now;
    }
    else {
      // default: full year
      startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      endDate = new Date(`${year}-12-31T23:59:59.999Z`);
    }

    // Get overall application count
    const totalApplications = await jobApply.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      orgainizationId: new ObjectId(orgainizationId)
    });



    const scheduledInterviews = await jobApply.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      orgainizationId: orgainizationId,
      hrInterviewSchedule: "scheduled" // Assuming 'scheduled' is the status for interviews
    })

    // Get count of applications in different stages
    const statusCounts = await jobApply.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orgainizationId: new ObjectId(orgainizationId) // Filter by organization
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get AI screening statistics
    const aiScreeningStats = await jobApply.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          AI_Result: { $exists: true },
          orgainizationId: new ObjectId(orgainizationId) // Filter by organization
        }
      },
      {
        $group: {
          _id: "$AI_Result",
          count: { $sum: 1 },
          avgMatch: {
            $avg: {
              $cond: [
                { $ne: ["$matchPercentage", null] },
                "$matchPercentage",
                null
              ]
            }
          }
        }
      }
    ]);


    // Calculate average time to hire
  const timeToHireData = await jobApply.aggregate([
  {
    $match: {
      createdAt: { $gte: startDate, $lte: endDate },
      resumeShortlisted: "shortlisted",
      orgainizationId: new ObjectId(orgainizationId) // Filter by organization
    }
  },
  {
    $group: {
      _id: null,
      totalShortlisted: { $sum: 1 }
    }
  }
]);


    // calcaulate the department //

    const departmentCounts = await jobApply.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          departmentId: { $ne: null },
          orgainizationId: new ObjectId(orgainizationId) // Filter by organization
          // orgainizationId: new ObjectId(orgainizationId) // Filter by organization
        }
      },
      {
        $group: {
          _id: "$departmentId"
        }
      },
      {
        $count: "totalDepartments"
      }
    ]);


    // avarage response time for job applications
    const avgResponse = await jobApply.aggregate([
      {
        $match: {
          orgainizationId: new ObjectId(orgainizationId) // Filter by organization
        }
      },
      {
        $lookup: {
          from: "jobposts", // your job post collection
          localField: "jobPostId",
          foreignField: "_id",
          as: "jobDetails"
        }
      },
      {
        $unwind: "$jobDetails"
      },
      {
        $addFields: {
          responseTimeInDays: {
            $divide: [
              { $subtract: ["$createdAt", "$jobDetails.createdAt"] },
              1000 * 60 * 60 * 24 // convert milliseconds to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageResponseTime: { $avg: "$responseTimeInDays" }
        }
      },
      {
        $project: {
          _id: 0,
          averageResponseTime: { $round: ["$averageResponseTime", 2] } // Round to 2 decimal places
        }
      }
    ]);
    const avgResponseTime = avgResponse[0]?.averageResponseTime || 0;

    // Format the response
    const departmentCount = departmentCounts[0]?.totalDepartments || 0;


    // convertion Rate //

    const totalApplication = await jobApply.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      orgainizationId: new ObjectId(orgainizationId) // Filter by organization
    });

    const totalHired = await jobApply.countDocuments({
      orgainizationId: new ObjectId(orgainizationId), // Filter by organization
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'onBoarded' // or 'selected'
    });

    const conversionRate = totalApplication == 0 ? 0 : ((totalHired / totalApplication) * 100).toFixed(2);

    // calclulate Rejected candidates //
    const rejectedCandidates = await jobApply.aggregate([{
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        orgainizationId: new ObjectId(orgainizationId), // Filter by organization
        resumeShortlisted: "notshortlisted" // rejected candidates
      }
    },
    {
      $group: {
        _id: null,
        totalRejected: { $sum: 1 }
      }
    }])

    // Hire candidate
    const HireData = await jobApply.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orgainizationId: new ObjectId(orgainizationId), // Filter by organization
          status: "onBoarded", // hired
          joiningDate: { $ne: null } // make sure they have an actual joining date
        }
      },
      {
        $project: {
          timeToHire: {
            $divide: [
              { $subtract: ["$joiningDate", "$createdAt"] },
              1000 * 60 * 60 * 24 // milliseconds to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTimeToHire: { $avg: "$timeToHire" },
          totalHired: { $sum: 1 }
        }
      }
    ]);


    // 1. Count applications in the last 7 days
    const appsLast7Days = await jobApply.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      orgainizationId: new ObjectId(orgainizationId) // Filter by organization
    });

    // 2. Count rejections in the last 7 days
    const rejectedLast7Days = await jobApply.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      orgainizationId: new ObjectId(orgainizationId), // Filter by organization
      status: 'rejected'
    });


    const topAppliedDepartments = await jobApply.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orgainizationId: new ObjectId(orgainizationId), // Filter by organization
          departmentId: { $ne: null }
        }
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          as: "departmentDetails"
        }
      },
      {
        $unwind: {
          path: "$departmentDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$departmentId",
          departmentName: { $first: "$departmentDetails.name" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 500
      },
      {
        $project: {
          _id: 0,
          departmentId: "$_id",
          departmentName: { $ifNull: ["$departmentName", "OTHERS"] },
          count: 1
        }
      }
    ]);

    // Get top positions
    const topAppliedPositions = await jobApply.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          position: { $exists: true, $ne: "" },
          orgainizationId: new ObjectId(orgainizationId) // Filter by organization
        }
      },
      {
        $group: {
          _id: "$position",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 500
      },
      {
        $project: {
          _id: 0,
          position: "$_id",
          count: 1
        }
      }
    ]);

    // Get application source breakdown
    const applicationSources = await jobApply.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          knewaboutJobPostFrom: { $exists: true, $ne: null },
          orgainizationId: new ObjectId(orgainizationId) // Filter by organization
        }
      },
      {
        $group: {
          _id: "$knewaboutJobPostFrom",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 500
      },
      {
        $project: {
          _id: 0,
          source: "$_id",
          count: 1
        }
      }
    ]);


    // Hot posstion //

    const hotPositions = await jobApply.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          position: { $exists: true, $ne: "" },
          departmentId: { $ne: null },
          jobPostId: { $exists: true },
          orgainizationId: new ObjectId(orgainizationId) // Filter by organization
        }
      },
      {
        $group: {
          _id: "$jobPostId",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "jobposts", // replace with actual job posts collection
          localField: "_id",
          foreignField: "_id",
          as: "jobPost"
        }
      },
      { $unwind: "$jobPost" },
      {
        $lookup: {
          from: "newdepartments",
          localField: "jobPost.departmentId",
          foreignField: "_id",
          as: "departmentDetails"
        }
      },
      { $unwind: { path: "$departmentDetails", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          daysSincePosted: {
            $dateDiff: {
              startDate: "$jobPost.createdAt",
              endDate: new Date(),
              unit: "day"
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      },
      { $limit: 5 },
      {
        $project: {
          position: "$jobPost.position",
          departmentName: "$departmentDetails.name",
          applications: "$count",
          daysSincePosted: 1
        }
      }
    ]);


    // Cold positions (less than 5 applications)
    const coldPositions = await jobApply.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          position: { $exists: true, $ne: "" },
          departmentId: { $ne: null },
          jobPostId: { $exists: true },
          orgainizationId: new ObjectId(orgainizationId) // Filter by organization
        }
      },
      {
        $group: {
          _id: "$jobPostId",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "jobposts",
          localField: "_id",
          foreignField: "_id",
          as: "jobPost"
        }
      },
      { $unwind: "$jobPost" },
      {
        $lookup: {
          from: "newdepartments",
          localField: "jobPost.departmentId",
          foreignField: "_id",
          as: "departmentDetails"
        }
      },
      { $unwind: { path: "$departmentDetails", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          daysSincePosted: {
            $dateDiff: {
              startDate: "$jobPost.createdAt",
              endDate: new Date(),
              unit: "day"
            }
          }
        }
      },
      {
        $match: { count: { $lte: 5 } } // cold threshold
      },
      {
        $sort: { count: 1 }
      },
       {
    $limit: 5
  },
      {
        $project: {
          position: "$jobPost.position",
          departmentName: "$departmentDetails.name",
          applications: "$count",
          daysSincePosted: 1
        }
      }
    ]);



    // Get applications by department
    const applicationsByDepartment = await getApplicationsByDepartment(startDate, endDate , orgainizationId);


    // Get current month vs previous month stats
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthStartDate = new Date(`${year}-${String(currentMonth).padStart(2, '0')}-01T00:00:00.000Z`);
    const currentMonthEndDate = new Date(year, currentMonth, 0, 23, 59, 59, 999);

    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousMonthYear = currentMonth === 1 ? year - 1 : year;
    const previousMonthStartDate = new Date(`${previousMonthYear}-${String(previousMonth).padStart(2, '0')}-01T00:00:00.000Z`);
    const previousMonthEndDate = new Date(previousMonthYear, previousMonth, 0, 23, 59, 59, 999);

    const currentMonthApplications = await jobApply.countDocuments({
      createdAt: { $gte: currentMonthStartDate, $lte: currentMonthEndDate },
      orgainizationId: new ObjectId(orgainizationId) // Filter by organization
    });

    const previousMonthApplications = await jobApply.countDocuments({
      createdAt: { $gte: previousMonthStartDate, $lte: previousMonthEndDate }
    });

    const currentMonthHired = await jobApply.countDocuments({
      createdAt: { $gte: currentMonthStartDate, $lte: currentMonthEndDate },
      status: { $in: ["shortlisted"] }
    });

    const previousMonthHired = await jobApply.countDocuments({
      createdAt: { $gte: previousMonthStartDate, $lte: previousMonthEndDate },
      status: { $in: ["shortlisted"] }
    });


    const currentMonthHireddatad = await jobApply.countDocuments({
      createdAt: { $gte: currentMonthStartDate, $lte: currentMonthEndDate },
      status: { $in: ["onBoarded"] }
    });

    const previousMonthHireddata = await jobApply.countDocuments({
      createdAt: { $gte: previousMonthStartDate, $lte: previousMonthEndDate },
      status: { $in: ["onBoarded"] }
    });

    // Format status counts into an object
    const statusStats = {};
    statusCounts.forEach(item => {
      statusStats[item._id] = item.count;
    });

    // Format AI screening stats
    const aiStats = {
      passed: 0,
      failed: 0,
      avgMatchPercentage: 0
    };

    aiScreeningStats.forEach(item => {
      if (item._id == "true") {
        aiStats.passed = item.count;
        aiStats.avgMatchPercentage = item.avgMatch ? Number(item.avgMatch.toFixed(2)) : 0;
      } else if (item._id == "false") {
        aiStats.failed = item.count;
      }
    });

    return success(res, "Dashboard summary retrieved successfully", {
      overview: {
        totalApplications,
        totalShortlisted :timeToHireData[0]?.totalShortlisted || 0,
        totalRejected: rejectedCandidates[0]?.totalRejected || 0,
        applicationsLast7Days: appsLast7Days || 0,
        rejectedLast7Days: rejectedLast7Days || 0,
        avgResponseTime: avgResponseTime || 0,
        scheduledInterviews: scheduledInterviews || 0,
        departmentCounts: departmentCount,
        conversionRate: conversionRate || 0,
        totalHiredCandidate: HireData[0]?.totalHired || 0,
        avgTimeToShortlisted: timeToHireData[0]?.avgTimeToHire ? Number(timeToHireData[0].avgTimeToHire.toFixed(1)) : 0,
        ShortlistedAVG: timeToHireData[0]?.totalHired ?
          Number(((timeToHireData[0].totalHired / totalApplications) * 100).toFixed(2)) : 0
      },

      hotPositions: hotPositions,
      coldPositions: coldPositions,
      departments: applicationsByDepartment,


      monthOverMonth: {
        applications: {
          current: currentMonthApplications,
          previous: previousMonthApplications,
          change_percentage: previousMonthApplications > 0 ?
            Number((((currentMonthApplications - previousMonthApplications) / previousMonthApplications) * 100).toFixed(2)) :
            currentMonthApplications > 0 ? 100 : 0
        },
        shortlisted: {
          current: currentMonthHired,
          previous: previousMonthHired,
          changePercentage: previousMonthHired > 0 ?
            Number((((currentMonthHired - previousMonthHired) / previousMonthHired) * 100).toFixed(2)) :
            currentMonthHired > 0 ? 100 : 0
        },

        HiredCandidate: {
          current: currentMonthHireddatad,
          previous: previousMonthHireddata,
          changePercentage: previousMonthHireddata > 0 ?
            Number((((currentMonthHireddatad - previousMonthHireddata) / previousMonthHireddata) * 100).toFixed(2)) :
            currentMonthHireddatad > 0 ? 100 : 0

        }
      },
      statusBreakdown: statusStats,
      aiScreening: aiStats,
      topAppliedDepartments,
      topAppliedPositions,
      applicationSources
    });
  } catch (error) {
    console.error("Error in getDashboardSummary:", error);
    return unknownError(res, error);
  }
};

/**
 * @route GET /api/dashboard/metrics
 * @desc Get detailed dashboard metrics for visualization
 * @access Private (Admin/HR)
 */
export const getDashboardMetrics = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const orgainizationId = req.employee.organizationId;

    // Create date range for the year
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    // Get applications by month
    const applicationsByMonth = await getApplicationsByMonth(startDate, endDate , orgainizationId);

    // Get hiring success rate by month
    const ShortlistedlistRate = await getHiringSuccessRate(startDate, endDate , orgainizationId);

    // Get applications by department
    const applicationsByDepartment = await getApplicationsByDepartment(startDate, endDate , orgainizationId);

    // Get applications by status
    const applicationsByStatus = await getApplicationsByStatus(startDate, endDate , orgainizationId);

    // Get AI screening metrics
    const aiScreeningMetrics = await getAIScreeningMetrics(startDate, endDate , orgainizationId);

    // Get positions with most applications
    const topPositions = await getTopPositions(startDate, endDate , orgainizationId);

    // Get average time to hire
    const timeToHire = await getTimeToHire(startDate, endDate , orgainizationId);

    // Get source breakdown
    const applicationSources = await getApplicationSources(startDate, endDate , orgainizationId);

    // Get application workflow status
    const workflowStats = await getWorkflowStats(startDate, endDate , orgainizationId);

    return success(res, "Dashboard metrics retrieved successfully", {
      applicationsByMonth,
      ShortlistedlistRate,
      applicationsByDepartment,
      applicationsByStatus,
      aiScreeningMetrics,
      topPositions,
      timeToHire,
      applicationSources,
      workflowStats
    });
  } catch (error) {
    console.error("Error in getDashboardMetrics:", error);
    return unknownError(res, error);
  }
};

/**
 * Helper function to get applications count by month
 */
const getApplicationsByMonth = async (startDate, endDate , orgainizationId) => {
  const monthlyApplications = await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        orgainizationId: new ObjectId(orgainizationId) // Filter by organization
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Fill in missing months with zero counts
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const result = months.map(month => {
    const found = monthlyApplications.find(item => item._id === month);
    return {
      month: getMonthName(month),
      count: found ? found.count : 0
    };
  });

  return result;
};

/**
 * Helper function to get hiring success rate by month
 */
const getHiringSuccessRate = async (startDate, endDate , orgainizationId) => {
  const monthlyStats = await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        orgainizationId: new ObjectId(orgainizationId) // Filter by organization
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalApplications: { $sum: 1 },
        shortlisted: {
          $sum: {
            $cond: [{ $in: ["$status", ["shortlisted"]] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        _id: 1,
        totalApplications: 1,
        shortlisted: 1,
        successRate: {
          $cond: [
            { $eq: ["$totalApplications", 0] },
            0,
            { $multiply: [{ $divide: ["$shortlisted", "$totalApplications"] }, 100] }
          ]
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Fill in missing months
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const result = months.map(month => {
    const found = monthlyStats.find(item => item._id === month);
    return {
      month: getMonthName(month),
      successRate: found ? Number(found.successRate.toFixed(2)) : 0,
      hired: found ? found.hired : 0,
      totalApplications: found ? found.totalApplications : 0
    };
  });

  return result;
};

/**
 * Helper function to get applications by department
 */
const getApplicationsByDepartment = async (startDate, endDate , orgainizationId ) => {
  return await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        orgainizationId: new ObjectId(orgainizationId),
        departmentId: { $ne: null }
      }
    },
    {
      $lookup: {
        from: "newdepartments",
        localField: "departmentId",
        foreignField: "_id",
        as: "departmentDetails"
      }
    },
    {
      $unwind: {
        path: "$departmentDetails",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: "$departmentId",
        departmentName: { $first: "$departmentDetails.name" },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        departmentId: "$_id",
        departmentName: { $ifNull: ["$departmentName", "OTHERS"] },
        count: 1
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);
};

/**
 * Helper function to get applications by status
 */
const getApplicationsByStatus = async (startDate, endDate , orgainizationId) => {
  const statusCounts = await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        orgainizationId: new ObjectId(orgainizationId) // Filter by organization
      }
    },
    {
      $group: {
        _id: "$resumeShortlisted",
        count: { $sum: 1 }
      }
    }
  ]);

  // Map to more user-friendly status names
  return statusCounts.map(item => ({
    status: mapStatusToFriendlyName(item._id),
    count: item.count
  }));
};

/**
 * Helper function to get AI screening metrics
 */
const getAIScreeningMetrics = async (startDate, endDate , orgainizationId) => {
  // Get monthly AI screening results
  const monthlyAIResults = await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        AI_Result: { $exists: true },
        orgainizationId: new ObjectId(orgainizationId) // Filter by organization
      }
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          aiResult: "$AI_Result"
        },
        count: { $sum: 1 },
        avgMatchPercentage: {
          $avg: {
            $cond: [
              { $ne: ["$matchPercentage", null] },
              "$matchPercentage",
              null
            ]
          }
        }
      }
    },
    {
      $sort: { "_id.month": 1 }
    }
  ]);

  // Process data to fill in all months
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Create a structured result with both passed and failed for each month
  const result = months.map(month => {
    const passedItem = monthlyAIResults.find(
      item => item._id.month === month && item._id.aiResult === "true"
    );

    const failedItem = monthlyAIResults.find(
      item => item._id.month === month && item._id.aiResult === "false"
    );

    return {
      month: getMonthName(month),
      passed: passedItem ? passedItem.count : 0,
      failed: failedItem ? failedItem.count : 0,
      avgMatchPercentage: passedItem && passedItem.avgMatchPercentage ?
        Number(passedItem.avgMatchPercentage.toFixed(2)) : 0
    };
  });

  return result;
};

/**
 * Helper function to get top positions by application count
 */
const getTopPositions = async (startDate, endDate , orgainizationId) => {
  return await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        orgainizationId: new ObjectId(orgainizationId),
      }
    },
    {
      $group: {
        _id: "$position",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 100
    },
    {
      $project: {
        _id: 0,
        position: { $ifNull: ["$_id", "Unspecified Position"] },
        count: 1
      }
    }
  ]);
};

/**
 * Helper function to get average time to hire by month
 */
const getTimeToHire = async (startDate, endDate , orgainizationId) => {
  const hiredCandidates = await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ["onBoarded"] },
        orgainizationId: new ObjectId(orgainizationId), // Filter by organization
        joiningDate: { $ne: null }
      }
    },
    {
      $project: {
        month: { $month: "$createdAt" },
        timeToHire: {
          $divide: [
            { $subtract: ["$joiningDate", "$createdAt"] },
            1000 * 60 * 60 * 24  // Convert milliseconds to days
          ]
        }
      }
    },
    {
      $group: {
        _id: "$month",
        avgTimeToHire: { $avg: "$timeToHire" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Fill in all months
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const result = months.map(month => {
    const found = hiredCandidates.find(item => item._id === month);
    return {
      month: getMonthName(month),
      avgDays: found ? Number(found.avgTimeToHire.toFixed(1)) : 0,
      hires: found ? found.count : 0
    };
  });

  return result;
};

/**
 * Helper function to get application sources
 */
const getApplicationSources = async (startDate, endDate , orgainizationId) => {
  const sources = await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        knewaboutJobPostFrom: { $exists: true, $ne: null },
        orgainizationId: new ObjectId(orgainizationId) // Filter by organization
      }
    },
    {
      $group: {
        _id: "$knewaboutJobPostFrom",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $project: {
        _id: 0,
        source: { $ifNull: ["$_id", "Not Specified"] },
        count: 1
      }
    }
  ]);

  return sources;
};

/**
 * Helper function to get workflow stats
 */
const getWorkflowStats = async (startDate, endDate , orgainizationId) => {
  // Get monthly workflow stats
  const workflowData = await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        orgainizationId: new ObjectId(orgainizationId) // Filter by organization
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalApplications: { $sum: 1 },
        resumeShortlisted: {
          $sum: {
            $cond: [{ $eq: ["$resumeShortlisted", "shortlisted"] }, 1, 0]
          }
        },
        hrInterviewScheduled: {
          $sum: {
            $cond: [{ $eq: ["$hrInterviewSchedule", "scheduled"] }, 1, 0]
          }
        },
        preOfferGenerated: {
          $sum: {
            $cond: [{ $eq: ["$preOffer", "generated"] }, 1, 0]
          }
        },
        offerGenerated: {
          $sum: {
            $cond: [{ $eq: ["$finCooperOfferLetter", "generated"] }, 1, 0]
          }
        },
        hired: {
          $sum: {
            $cond: [{ $in: ["$status", ["joined", "onBoarded"]] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Fill in all months
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const result = months.map(month => {
    const found = workflowData.find(item => item._id === month);
    return {
      month: getMonthName(month),
      applications: found ? found.totalApplications : 0,
      shortlisted: found ? found.resumeShortlisted : 0,
      interviewSchedule: found ? found.hrInterviewScheduled : 0,
      offered: found ? found.offerGenerated : 0,
      preOfferGenerated: found ? found.preOfferGenerated : 0,
      // hired: found ? found.hired : 0
    };
  });

  return result;
};

/**
 * Helper function to get month name from month number
 */
const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1];
};

/**
 * Helper function to map status codes to friendly names
 */
const mapStatusToFriendlyName = (status) => {
  const statusMap = {
    'active': 'Active',
    'hold': 'On Hold',
    'inProgress': 'In Progress',
    'reject': 'Rejected',
    'shortlisted': 'Shortlisted',
    'managerReview': 'Manager Review',
    'shortlistedBYManager': 'Shortlisted by Manager',
    'joined': 'Joined',
    'onBoarded': 'Onboarded',
    'notActive': 'Not Active'
  };

  return statusMap[status] || status;
};




// get candidate data //


// export const AnalizedCandidate = async (req, res) => {
//   try {

//     const {position , name , mobileNumber , emailId , departmentId , search} = req.query;
//    // Initialize filter object properly
//     let filter = {};
    
//     if (position) {
//       filter.position = { $regex: position, $options: 'i' };
//     }

//         if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { mobileNumber: { $regex: search, $options: 'i' } },
//         { emailId: { $regex: search, $options: 'i' } },
//         { position: { $regex: search, $options: 'i' } }
//       ];
//     } else {
//       if (name) {
//         filter.name = { $regex: name, $options: 'i' };
//       }
      
//       if (mobileNumber) {
//         filter.mobileNumber = { $regex: mobileNumber, $options: 'i' };
//       }
      
//       if (emailId) {
//         filter.emailId = { $regex: emailId, $options: 'i' };
//       }
//       if (position) {
//         filter.position = { $regex: position, $options: 'i' };
//       }
//     }
//     if (departmentId) {
//       filter.departmentId = new ObjectId(departmentId);
//     }

//     const candidates = await jobApply.aggregate([
//       {
//         $match: {
//           AI_Screeing_Status: "Completed",
//           AI_Screeing_Result: { $in: ["Rejected", "Approved"] },
//           ...filter // Apply the dynamic filter
//         }
//       },
//       {
//         $lookup: {
//           from: "jobposts", // Your job collection
//           localField: "jobPostId",
//           foreignField: "_id",
//           as: "job"
//         }
//       },
//       { $unwind: "$job" },
//       {
//         $group: {
//           _id: "$job._id",
//           position: { $first: "$job.position" },
//           applicationsCount: { $sum: 1 },
//           averageScore: { $avg: "$AI_Score" },
//           departmentId: { $first: "$departmentId" },
//           candidates: {
//             $push: {
//               _id: "$_id",
//               name: "$name",
//               email: "$emailId",
//               AI_Score: "$AI_Score",
//               AI_Confidence: "$AI_Confidence",
//               appliedDate: "$createdAt",
//               confidence: "$AI_Confidence",
//               resume:"$resume"
//             }
//           }
//         }
//       },
//       {
//         $addFields: {
//           averageScore: { $round: ["$averageScore", 2] }
//         }
//       },
//       { $sort: { position: 1 } }
//     ]);

//     // Flatten all candidates across positions
//     const allCandidates = candidates.flatMap(job => job.candidates || []);

//     const totalCandidates = allCandidates.length;
//     const highScorers = allCandidates.filter(c => c.AI_Score >= 90).length;
//     const avgAIScore =
//       totalCandidates > 0
//         ? Math.round(
//             allCandidates.reduce((sum, c) => sum + c.AI_Score, 0) / totalCandidates
//           )
//         : 0;

//     return success(res, {
//       candidates,
//       summary: {
//         totalCandidates,
//         highScorers,
//         avgAIScore
//       }
//     });
//   } catch (error) {
//     console.error("Error in AnalizedCandidate:", error);
//     return unknownError(res, error);
//   }
// };


export const AnalizedCandidate = async (req, res) => {
  try {
    const { position, name, mobileNumber, emailId, departmentId, search } = req.query;
    const organizationId = req.employee.organizationId;
    const targetCompany = await targetCompanyModel.findOne({ organizationId }).lean().select('deprioritizedCompanies prioritizedCompanies');
    console.log('targetCompany', targetCompany);

    // Function to check if organization matches with fuzzy logic
    const getTargetCompanyStatus = (lastOrganizations) => {
      if (!lastOrganizations || !Array.isArray(lastOrganizations)) {
        return "";
      }

      const prioritizedCompanies = targetCompany?.prioritizedCompanies || [];
      const deprioritizedCompanies = targetCompany?.deprioritizedCompanies || [];

      // Check for prioritized companies match
      for (const org of lastOrganizations) {
        if (!org) continue;
        
        const orgLower = org.toLowerCase().trim();
        
        // Check prioritized companies with fuzzy matching
        for (const prioritized of prioritizedCompanies) {
          if (!prioritized) continue;
          
          const prioritizedLower = prioritized.toLowerCase().trim();
          
          // Fuzzy matching - check if either contains the other or if they share significant common words
          if (orgLower.includes(prioritizedLower) || 
              prioritizedLower.includes(orgLower) ||
              fuzzyMatch(orgLower, prioritizedLower)) {
            return "prioritized";
          }
        }
      }

      // Check for deprioritized companies match
      for (const org of lastOrganizations) {
        if (!org) continue;
        
        const orgLower = org.toLowerCase().trim();
        
        // Check deprioritized companies with fuzzy matching
        for (const deprioritized of deprioritizedCompanies) {
          if (!deprioritized) continue;
          
          const deprioritizedLower = deprioritized.toLowerCase().trim();
          
          // Fuzzy matching - check if either contains the other or if they share significant common words
          if (orgLower.includes(deprioritizedLower) || 
              deprioritizedLower.includes(orgLower) ||
              fuzzyMatch(orgLower, deprioritizedLower)) {
            return "deprioritized";
          }
        }
      }

      return "";
    };

    // Helper function for fuzzy matching based on common words
    const fuzzyMatch = (str1, str2) => {
      const words1 = str1.split(/\s+/).filter(word => word.length > 2); // Only consider words longer than 2 chars
      const words2 = str2.split(/\s+/).filter(word => word.length > 2);
      
      let commonWords = 0;
      for (const word1 of words1) {
        for (const word2 of words2) {
          if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
            commonWords++;
            break;
          }
        }
      }
      
      // Consider it a match if at least 50% of words match
      const minWords = Math.min(words1.length, words2.length);
      return minWords > 0 && (commonWords / minWords) >= 0.5;
    };

    // Initialize filter object properly
    let filter = {};

    if (position) {
      filter.position = { $regex: position, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { emailId: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    } else {
      if (name) {
        filter.name = { $regex: name, $options: 'i' };
      }

      if (mobileNumber) {
        filter.mobileNumber = { $regex: mobileNumber, $options: 'i' };
      }

      if (emailId) {
        filter.emailId = { $regex: emailId, $options: 'i' };
      }
      if (position) {
        filter.position = { $regex: position, $options: 'i' };
      }
    }
    if (departmentId) {
      filter.departmentId = new ObjectId(departmentId);
    }

    const candidates = await jobApply.aggregate([
      {
        $match: {
          AI_Screeing_Status: "Completed",
          AI_Screeing_Result: { $in: ["Rejected", "Approved"] },
          ...filter // Apply the dynamic filter
        }
      },
      {
        $lookup: {
          from: "jobposts", // Your job collection
          localField: "jobPostId",
          foreignField: "_id",
          as: "job"
        }
      },
      { $unwind: "$job" },
      {
        $group: {
          _id: "$job._id",
          position: { $first: "$job.position" },
          applicationsCount: { $sum: 1 },
          averageScore: { $avg: "$AI_Score" },
          departmentId: { $first: "$departmentId" },
          candidates: {
            $push: {
              _id: "$_id",
              lastOrganization: "$lastOrganization",
              name: "$name",
              email: "$emailId",
              AI_Score: "$AI_Score",
              AI_Confidence: "$AI_Confidence",
              appliedDate: "$createdAt",
              confidence: "$AI_Confidence",
              resume: "$resume"
            }
          }
        }
      },
      {
        $addFields: {
          averageScore: { $round: ["$averageScore", 2] }
        }
      },
      { $sort: { position: 1 } }
    ]);

    // Add targetCompany status to each candidate after aggregation
    candidates.forEach(job => {
      if (job.candidates && Array.isArray(job.candidates)) {
        job.candidates.forEach(candidate => {
          candidate.targetCompany = getTargetCompanyStatus(candidate.lastOrganization);
        });
      }
    });

    // Flatten all candidates across positions
    const allCandidates = candidates.flatMap(job => job.candidates || []);

    const totalCandidates = allCandidates.length;
    const highScorers = allCandidates.filter(c => c.AI_Score >= 90).length;
    const avgAIScore =
      totalCandidates > 0
        ? Math.round(
            allCandidates.reduce((sum, c) => sum + c.AI_Score, 0) / totalCandidates
          )
        : 0;

    return success(res, {
      candidates,
      summary: {
        totalCandidates,
        highScorers,
        avgAIScore
      }
    });
  } catch (error) {
    console.error("Error in AnalizedCandidate:", error);
    return unknownError(res, error);
  }
};

// get Deep Analized data //

export const DeepAnalize = async (req, res) => {
  try {
    const Id = req.params.id;
    const orgainizationId=req.employee.organizationId;
    if (!Id) {
      return badRequest(res, "Candidate Id not provided");
    }

    let finddata = await ScreeningResultModel.findOne({ candidateId: Id }).lean();
    if (!finddata) {
      return success(res, "Screen Result not found");
    }

    const findResume = await jobApply.findById(Id).lean();
    const findJd = await jobPostModel.findById(finddata.jobPostId).lean();

    let jobdescription = null;
    if (findJd && findJd.jobDescriptionId) {
      jobdescription = await JobDescriptionModel.findById(findJd.jobDescriptionId).lean();

    }

    // Merge resume into main data
    if (findResume) {
      finddata.resume = findResume.resume;

      // Add userInfo object
      finddata.userInfo = {
        name: findResume.name,
        email: findResume.emailId,
        mobile: findResume.mobileNumber,
        position: findResume.position,
        experience: findResume.totalExperience,
        JobType: findResume.JobType,
        currentCTC: findResume.currentCTC,
        expectedCTC: findResume.expectedCTC,
      };
    }

    // Add jobdescription object
    if (jobdescription) {
      finddata.jobdescription = {
        JobSummary: jobdescription?.jobDescription?.JobSummary || "",
        responsibilities: jobdescription?.jobDescription?.RolesAndResponsibilities || [],
        keySkills: jobdescription?.jobDescription?.KeySkills || [],
      };
    }


const candidates = await ScreeningResultModel
  .find({organizationId:orgainizationId})
  .sort({ createdAt: -1 }) // latest created first
  .select("candidateId")
  .lean();

const index = candidates.findIndex(c => c.candidateId.toString() == Id);


let previousCandidateId = null;
let nextCandidateId = null;

if (index > 0) {
  previousCandidateId = candidates[index - 1].candidateId;
}
if (index < candidates.length - 1) {
  nextCandidateId = candidates[index + 1].candidateId;
}

// Assign to response object
finddata.previousCandidateId = previousCandidateId;
finddata.nextCandidateId = nextCandidateId;



    return success(res, "fetch Screen Results", finddata);
  } catch (error) {
    return unknownError(res, error);
  }
};




export const getAllDeepAnalyses = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    if (!organizationId) {
      return badRequest(res, "Organization ID not provided");
    }

    // Extract pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Count total documents for pagination
    const total = await ScreeningResultModel.countDocuments({ organizationId });

    // Fetch paginated results
    const results = await ScreeningResultModel.find({ organizationId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // latest first
      .lean();

    // Enrich each result
    const enrichedResults = await Promise.all(
      results.map(async (result) => {
        const candidateId = result.candidateId;
        const findResume = await jobApply.findById(candidateId).lean();
        const findJd = await jobPostModel.findById(result.jobPostId).lean();

        let jobdescription = null;
        if (findJd?.jobDescriptionId) {
          jobdescription = await JobDescriptionModel.findById(findJd.jobDescriptionId).lean();
        }

        // Resume details
        if (findResume) {
          result.resume = findResume.resume;

          result.userInfo = {
            name: findResume.name,
            email: findResume.emailId,
            mobile: findResume.mobileNumber,
            position: findResume.position,
            experience: findResume.totalExperience,
            JobType: findResume.JobType,
            currentCTC: findResume.currentCTC,
            expectedCTC: findResume.expectedCTC,
          };
        }

        // Job description details
        if (jobdescription) {
          result.jobdescription = {
            JobSummary: jobdescription?.jobDescription?.JobSummary || "",
            responsibilities: jobdescription?.jobDescription?.RolesAndResponsibilities || [],
            keySkills: jobdescription?.jobDescription?.KeySkills || [],
          };
        }

        return result;
      })
    );

    return success(res, "Fetched AI screening results", {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      results: enrichedResults,
    });
  } catch (error) {
    console.error("getAllDeepAnalyses Error:", error);
    return unknownError(res, error);
  }
};








export const getDashboardOverview = async (req, res) => {
  try {
    const { period, startDate, endDate, department } = req.query;
    const organizationId = req.employee.organizationId;

    const filter = {
      organizationId: new ObjectId(organizationId),
    };

    // Period-based filtering
    if (period == '7d' || period == '30d') {
      const days = parseInt(period.replace('d', ''));
      filter.createdAt = {
        $gte: dayjs().subtract(days, 'day').startOf('day').toDate(),
        $lte: new Date()
      };
    } else if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (department) filter.department = department;

    // Run all dashboard queries in parallel
    const [
      totalApplications,
      approvedApplications,
      rejectedApplications,
      avgProcessingSpeed,
      avgConfidence,
      departmentStats
    ] = await Promise.all([
      ScreeningResultModel.countDocuments(filter),
      ScreeningResultModel.countDocuments({ ...filter, decision: 'Approved' }),
      ScreeningResultModel.countDocuments({ ...filter, decision: 'Rejected' }),
      ScreeningResultModel.aggregate([
        { $match: filter },
        { $group: { _id: null, avgSpeed: { $avg: '$AI_Processing_Speed' } } }
      ]),
      ScreeningResultModel.aggregate([
        { $match: filter },
        { $group: { _id: null, avgConf: { $avg: '$AI_Confidence' } } }
      ]),
      ScreeningResultModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$department',
            total: { $sum: 1 },
            approved: {
              $sum: { $cond: [{ $eq: ['$decision', 'Approved'] }, 1, 0] }
            },
            avgScore: { $avg: '$overallScore' }
          }
        },
        {
          $addFields: {
            passRate: {
              $cond: [
                { $eq: ['$total', 0] },
                0,
                { $multiply: [{ $divide: ['$approved', '$total'] }, 100] }
              ]
            }
          }
        },
        { $sort: { total: -1 } }
      ])
    ]);

   console.log('Dashboard Overview Data:', {
      totalApplications,
      approvedApplications,
      rejectedApplications,
      avgProcessingSpeed,
      avgConfidence,
      departmentStats
   })

    const totalApps = totalApplications || 0;
    const approved = approvedApplications || 0;
    const rejected = rejectedApplications || 0;
    const approvalRate = totalApps > 0 ? Math.round((approved / totalApps) * 100) : 0;
    const rejectionRate = totalApps > 0 ? Math.round((rejected / totalApps) * 100) : 0;

    const processingSpeed = avgProcessingSpeed[0]?.avgSpeed || 0;
    const confidence = avgConfidence[0]?.avgConf || 0;

    const dashboardData = {
      keyMetrics: {
        totalApplications: totalApps,
        aiApproved: approved,
        aiRejected: rejected,
        processingSpeed: `${processingSpeed.toFixed(1)}s`
      },
      insights: {
        interviewScheduled: 0,
        aiConfidence: `${Math.round(confidence)}%`,
        activeDepartments: departmentStats.length,
        topSkillMatch: `${approvalRate}%`
      },
      analytics: {
        accuracyRate: `${Math.round(confidence * 0.94)}%`,
        highScorers: Math.round(approved * 0.6)
      },
      departmentPerformance: departmentStats.map(dept => ({
        department: dept._id,
        totalApps: dept.total,
        approved: dept.approved,
        Reject: dept.total - dept.approved,
        passRate: `${Math.round(dept.passRate)}%`,
        avgScore: Math.round(dept.avgScore || 0)
      }))
    };

    return success(res, "AI Dashboard", dashboardData);

  } catch (error) {
    console.error('Dashboard Overview Error:', error);
    return unknownError(res, error);
  }
};

// Screening Analytics API  
// export const getScreeningAnalytics = async (req, res) => {
//   try {
//     const { department, period = '30d' } = req.query;

//     // Calculate date range
//     const endDate = new Date();
//     const startDate = new Date();

//     switch (period) {
//       case '7d':
//         startDate.setDate(startDate.getDate() - 7);
//         break;
//       case '30d':
//         startDate.setDate(startDate.getDate() - 30);
//         break;
//       case '90d':
//         startDate.setDate(startDate.getDate() - 90);
//         break;
//       default:
//         startDate.setDate(startDate.getDate() - 30);
//     }

//     const filter = {
//       createdAt: { $gte: startDate, $lte: endDate }
//     };
//     if (department) filter.department = department;

//     // Get analytics data
//     const [
//       rejectionReasons,
//       skillsAnalysis,
//       confidenceDistribution,
//       trendsData
//     ] = await Promise.all([
//       // Top rejection reasons
//       ScreeningResultModel.aggregate([
//         { $match: { ...filter, decision: 'Rejected' } },
//         { $unwind: '$rejectReason' },
//         {
//           $group: {
//             _id: '$rejectReason.point',
//             count: { $sum: 1 }
//           }
//         },
//         { $sort: { count: -1 } },
//         { $limit: 5 }
//       ]),

//       // Skills assessment radar
//       ScreeningResultModel.aggregate([
//         { $match: filter },
//         {
//           $group: {
//             _id: null,
//             technicalSkills: { $avg: '$breakdown.skillsMatch' },
//             experienceSkills:{$avg :'$breakdown.experienceMatch'},
//             communication: { $avg: '$breakdown.Communication_Skills' },
//             leadership: { $avg: '$breakdown.Leadership_Initiative' },
//             problemSolving: { $avg: '$breakdown.Project_Exposure' },
//             adaptability: { $avg: '$breakdown.Learning_Ability' },
//             teamwork: { $avg: '$breakdown.Cultural_Fit' }
//           }
//         }
//       ]),

//       // AI Confidence distribution
//       ScreeningResultModel.aggregate([
//         { $match: filter },
//         {
//           $bucket: {
//             groupBy: '$AI_Confidence',
//             boundaries: [0, 60, 80, 100],
//             default: 'other',
//             output: {
//               count: { $sum: 1 },
//               avgScore: { $avg: '$overallScore' }
//             }
//           }
//         }
//       ]),

//       // Weekly trends
//       ScreeningResultModel.aggregate([
//         { $match: filter },
//         {
//           $group: {
//             _id: { $dateToString: { format: "%Y-%U", date: "$createdAt" } },
//             applications: { $sum: 1 },
//             approved: { $sum: { $cond: [{ $eq: ['$decision', 'Approved'] }, 1, 0] } },
//             avgScore: { $avg: '$overallScore' }
//           }
//         },
//         { $sort: { _id: 1 } }
//       ])
//     ]);

//     // Process rejection reasons with percentages
//     const totalRejections = rejectionReasons.reduce((sum, reason) => sum + reason.count, 0);
//     const processedRejectionReasons = rejectionReasons.map(reason => ({
//       reason: reason._id || 'Insufficient Experience',
//       count: reason.count,
//       percentage: totalRejections > 0 ? Math.round((reason.count / totalRejections) * 100) : 0
//     }));

//     // Default rejection reasons if no data
//     const defaultRejectionReasons = [
//       { reason: 'Insufficient Experience', count: 89, percentage: 32 },
//       { reason: 'Skills Mismatch', count: 67, percentage: 24 },
//       { reason: 'Poor Communication', count: 45, percentage: 16 },
//       { reason: 'Cultural Fit', count: 34, percentage: 12 },
//       { reason: 'Salary Expectations', count: 28, percentage: 10 }
//     ];

//     // Skills radar data
//     const skillsData = skillsAnalysis[0] || {};
//     const skillsRadar = {
//       technicalSkills: Math.round(skillsData.technicalSkills || 85),
//       experienceSkills:Math.round(skillsData.experienceSkills || 85),
//       communication: Math.round(skillsData.communication || 72),
//       leadership: Math.round(skillsData.leadership || 65),
//       problemSolving: Math.round(skillsData.problemSolving || 78),
//       adaptability: Math.round(skillsData.adaptability || 88),
//       teamwork: Math.round(skillsData.teamwork || 80)

//     };

//     // Confidence distribution
//     const confidenceData = confidenceDistribution.length > 0 ? confidenceDistribution : [
//       { _id: 80, count: 74, avgScore: 88 },
//       { _id: 60, count: 89, avgScore: 72 },
//       { _id: 0, count: 58, avgScore: 45 }
//     ];

//     const totalAppsForConfidence = confidenceData.reduce((sum, conf) => sum + conf.count, 0);
//     const processedConfidenceData = confidenceData.map(conf => ({
//       range: conf._id === 80 ? '80-100%' : conf._id === 60 ? '60-79%' : '0-59%',
//       count: conf.count,
//       percentage: totalAppsForConfidence > 0 ? Math.round((conf.count / totalAppsForConfidence) * 100) : 0,
//       avgScore: Math.round(conf.avgScore || 0)
//     }));

//     const analyticsData = {
//       period,
//       rejectionReasons: processedRejectionReasons.length > 0 ? processedRejectionReasons : defaultRejectionReasons,
//       skillsRadar,
//       confidenceDistribution: processedConfidenceData,

//       trends: trendsData.map(trend => ({
//         week: trend._id,
//         applications: trend.applications,
//         approved: trend.approved,
//         approvalRate: trend.applications > 0 ? Math.round((trend.approved / trend.applications) * 100) : 0,
//         avgScore: Math.round(trend.avgScore || 0)
//       })),

//       summary: {
//         totalAnalyzed: totalAppsForConfidence,
//         topRejectionReason: processedRejectionReasons[0]?.reason || 'Insufficient Experience',
//         avgSkillScore: Math.round(Object.values(skillsRadar).reduce((a, b) => a + b, 0) / Object.keys(skillsRadar).length)
//       }
//     };

//     return success(res , "analyticsData" , analyticsData)

//   } catch (error) {
//     console.error('Screening Analytics Error:', error);
//     return unknownError(res , error)
//   }
// };



// Enhanced Screening Analytics API  
export const getScreeningAnalytics = async (req, res) => {
  try {

    const { department, period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const filter = {
      createdAt: { $gte: startDate, $lte: endDate },
      organizationId: new ObjectId(req.employee.organizationId)
    };
    if (department) filter.department = department;

    // Get analytics data
    const [
      rejectionReasons,
      skillsAnalysis,
      confidenceDistribution,
      trendsData,
      positionMetrics,
      hotPositions,
      coldPositions
    ] = await Promise.all([
      // Top rejection reasons
      ScreeningResultModel.aggregate([
        { $match: { ...filter, decision: 'Rejected' } },
        { $unwind: '$rejectReason' },
        {
          $group: {
            _id: '$rejectReason.point',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),

      // Skills assessment radar
      ScreeningResultModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            technicalSkills: { $avg: '$breakdown.skillsMatch' },
            experienceSkills: { $avg: '$breakdown.experienceMatch' },
            communication: { $avg: '$breakdown.Communication_Skills' },
            leadership: { $avg: '$breakdown.Leadership_Initiative' },
            problemSolving: { $avg: '$breakdown.Project_Exposure' },
            adaptability: { $avg: '$breakdown.Learning_Ability' },
            teamwork: { $avg: '$breakdown.Cultural_Fit' }
          }
        }
      ]),

      // AI Confidence distribution
      ScreeningResultModel.aggregate([
        { $match: filter },
        {
          $bucket: {
            groupBy: '$AI_Confidence',
            boundaries: [0, 60, 80, 100],
            default: 'other',
            output: {
              count: { $sum: 1 },
              avgScore: { $avg: '$overallScore' }
            }
          }
        }
      ]),

      // Weekly trends
      ScreeningResultModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%U", date: "$createdAt" } },
            applications: { $sum: 1 },
            approved: { $sum: { $cond: [{ $eq: ['$decision', 'Approved'] }, 1, 0] } },
            avgScore: { $avg: '$overallScore' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Position Performance Matrix
      ScreeningResultModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$position',
            applications: { $sum: 1 },
            approved: { $sum: { $cond: [{ $eq: ['$decision', 'Approved'] }, 1, 0] } },
            avgScore: { $avg: '$overallScore' },
            department: { $first: '$department' }
          }
        },
        {
          $addFields: {
            passRate: {
              $cond: [
                { $gt: ['$applications', 0] },
                { $multiply: [{ $divide: ['$approved', '$applications'] }, 100] },
                0
              ]
            }
          }
        },
        { $sort: { applications: -1, passRate: -1 } }
      ]),

      // Hot Positions (High volume, high success rate)
      ScreeningResultModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$position',
            applications: { $sum: 1 },
            approved: { $sum: { $cond: [{ $eq: ['$decision', 'Approved'] }, 1, 0] } },
            avgScore: { $avg: '$overallScore' },
            department: { $first: '$department' }
          }
        },
        {
          $addFields: {
            passRate: {
              $cond: [
                { $gt: ['$applications', 0] },
                { $multiply: [{ $divide: ['$approved', '$applications'] }, 100] },
                0
              ]
            }
          }
        },
        {
          $match: {
            applications: { $gte: 5 }, // High volume threshold
            passRate: { $gte: 70 }      // High success rate threshold
          }
        },
        { $sort: { applications: -1, passRate: -1 } },
        { $limit: 4 }
      ]),

      // Cold Positions (Low volume or low success rate)
      ScreeningResultModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$position',
            applications: { $sum: 1 },
            approved: { $sum: { $cond: [{ $eq: ['$decision', 'Approved'] }, 1, 0] } },
            avgScore: { $avg: '$overallScore' },
            department: { $first: '$department' }
          }
        },
        {
          $addFields: {
            passRate: {
              $cond: [
                { $gt: ['$applications', 0] },
                { $multiply: [{ $divide: ['$approved', '$applications'] }, 100] },
                0
              ]
            }
          }
        },
        {
          $match: {
            $or: [
              { applications: { $lt: 5 } }, // Low volume
              { passRate: { $lt: 70 } }      // Low success rate
            ]
          }
        },
        { $sort: { applications: 1, passRate: 1 } },
        { $limit: 4 }
      ])
    ]);

    // Process rejection reasons with percentages
    const totalRejections = rejectionReasons.reduce((sum, reason) => sum + reason.count, 0);
    const processedRejectionReasons = rejectionReasons.map(reason => ({
      reason: reason._id || 'Insufficient Experience',
      count: reason.count,
      percentage: totalRejections > 0 ? Math.round((reason.count / totalRejections) * 100) : 0
    }));

    // Default rejection reasons if no data
    const defaultRejectionReasons = [
      { reason: 'Insufficient Experience', count: 89, percentage: 32 },
      { reason: 'Skills Mismatch', count: 67, percentage: 24 },
      { reason: 'Poor Communication', count: 45, percentage: 16 },
      { reason: 'Cultural Fit', count: 34, percentage: 12 },
      { reason: 'Salary Expectations', count: 28, percentage: 10 }
    ];

    // Skills radar data
    const skillsData = skillsAnalysis[0] || {};
    const skillsRadar = {
      technicalSkills: Math.round(skillsData.technicalSkills || 85),
      experienceSkills: Math.round(skillsData.experienceSkills || 85),
      communication: Math.round(skillsData.communication || 72),
      leadership: Math.round(skillsData.leadership || 65),
      problemSolving: Math.round(skillsData.problemSolving || 78),
      adaptability: Math.round(skillsData.adaptability || 88),
      teamwork: Math.round(skillsData.teamwork || 80)
    };

    // Confidence distribution
    const confidenceData = confidenceDistribution.length > 0 ? confidenceDistribution : [
      { _id: 80, count: 74, avgScore: 88 },
      { _id: 60, count: 89, avgScore: 72 },
      { _id: 0, count: 58, avgScore: 45 }
    ];

    const totalAppsForConfidence = confidenceData.reduce((sum, conf) => sum + conf.count, 0);
    const processedConfidenceData = confidenceData.map(conf => ({
      range: conf._id === 80 ? '80-100%' : conf._id === 60 ? '60-79%' : '0-59%',
      count: conf.count,
      percentage: totalAppsForConfidence > 0 ? Math.round((conf.count / totalAppsForConfidence) * 100) : 0,
      avgScore: Math.round(conf.avgScore || 0)
    }));

    // Process position metrics for dashboard cards
    const processedPositionMetrics = positionMetrics.map(pos => ({
      position: pos._id,
      department: pos.department,
      applications: pos.applications,
      approved: pos.approved,
      passRate: Math.round(pos.passRate),
      avgScore: Math.round(pos.avgScore || 0),
      volume: pos.applications >= 70 ? 'High Volume' : pos.applications >= 5 ? 'Medium Volume' : 'Low Volume',
      status: pos.passRate >= 70 ? 'Excellent' : pos.passRate >= 60 ? 'Good' : pos.passRate >= 40 ? 'Average' : 'Needs Attention'
    }));

    // Process hot positions
    const processedHotPositions = hotPositions.map(pos => ({
      position: pos._id,
      department: pos.department,
      applications: pos.applications,
      passRate: Math.round(pos.passRate),
      avgScore: Math.round(pos.avgScore || 0),
      status: 'Trending'
    }));

    // Process cold positions  
    const processedColdPositions = coldPositions.map(pos => ({
      position: pos._id,
      department: pos.department,
      applications: pos.applications,
      passRate: Math.round(pos.passRate),
      avgScore: Math.round(pos.avgScore || 0),
      status: 'Needs Attention'
    }));

    // Calculate dashboard summary metrics
    const totalApplications = processedPositionMetrics.reduce((sum, pos) => sum + pos.applications, 0);
    const totalApproved = processedPositionMetrics.reduce((sum, pos) => sum + pos.approved, 0);
    const overallPassRate = totalApplications > 0 ? Math.round((totalApproved / totalApplications) * 100) : 0;

    const analyticsData = {
      period,
      rejectionReasons: processedRejectionReasons.length > 0 ? processedRejectionReasons : defaultRejectionReasons,
      skillsRadar,
      confidenceDistribution: processedConfidenceData,

      trends: trendsData.map(trend => ({
        week: trend._id,
        applications: trend.applications,
        approved: trend.approved,
        approvalRate: trend.applications > 0 ? Math.round((trend.approved / trend.applications) * 100) : 0,
        avgScore: Math.round(trend.avgScore || 0)
      })),

      dashboard: {
        hotPositions: processedHotPositions.slice(0, 4),
        coldPositions: processedColdPositions.slice(0, 4),
        positionMatrix: {
          highVolume: processedPositionMetrics.filter(pos => pos.applications >= 5),
          lowVolume: processedPositionMetrics.filter(pos => pos.applications < 20)
        }
      },

      summary: {
        totalAnalyzed: totalAppsForConfidence,
        totalApplications,
        totalApproved,
        overallPassRate,
        topRejectionReason: processedRejectionReasons[0]?.reason || 'Insufficient Experience',
        avgSkillScore: Math.round(Object.values(skillsRadar).reduce((a, b) => a + b, 0) / Object.keys(skillsRadar).length),
        hotPositionsCount: processedHotPositions.length,
        coldPositionsCount: processedColdPositions.length,
        topPerformingPosition: processedPositionMetrics[0]?.position || 'N/A',
        avgPassRate: processedPositionMetrics.length > 0 
          ? Math.round(processedPositionMetrics.reduce((sum, pos) => sum + pos.passRate, 0) / processedPositionMetrics.length)
          : 0
      }
    };

    return success(res, "analyticsData", analyticsData);

  } catch (error) {
    console.error('Screening Analytics Error:', error);
    return unknownError(res, error);
  }
};



export const getJobApplyFields = async (req, res) => {
  try {
    const fieldNames = Object.keys(jobApply.schema.paths).filter(
      (key) => !["_id", "__v", "createdAt", "updatedAt"].includes(key)
    );

    return success(res, "Field names retrieved successfully", fieldNames);
  } catch (error) {
    return badRequest(res, error.message);
  }
};



export const calculatexcelcount = async (req, res) => {
  try{

    const orgainizationId = req.employee.organizationId;
    const count = req.body.count;
    if(!orgainizationId) {
      return badRequest(res, "Organization ID not provided");
    }

    const activePlan=await organizationPlanModel.findOne({ organizationId: orgainizationId, isActive: true }).lean();
    if(!activePlan) {
      return badRequest(res, "No active plan found for this organization");
    }

    const createdAt = new Date(activePlan.createdAt);
    const expiryDate = new Date(createdAt);
    expiryDate.setDate(expiryDate.getDate() + (activePlan.Numberofdownloads || 0));

    if(new Date() > expiryDate) {
      return badRequest(res, "Your plan has expired. Please renew your plan to continue using the service.");
    }


    if(count> activePlan.Numberofdownloads) {
      return badRequest(res, `You can only download ${activePlan.Numberofdownloads} times. Please upgrade your plan to download more.`);
    }


    // decrese Numberofdownloads from active plan

    if(activePlan.Numberofdownloads > 0) {
      const Updateservice = await organizationPlanModel.findOneAndUpdate(
        { organizationId: orgainizationId, isActive: true },
        { $inc: { Numberofdownloads: -count } },
        { new: true }
      ).lean();
    }


    return success(res, "Excel download successfully", { remainingDownloads: activePlan.Numberofdownloads - count });
  }
  catch(error){
    console.error("Error in calculatexcelcount:", error);
    return unknownError(res, error);
  }
}


export const exportJobApplicationsExcel = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;

    if (!organizationId) {
      return badRequest(res, "Organization ID not provided");
    }

    const jobAppliedDetails = await jobApply.aggregate([
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
      {
        $unwind: {
          path: "$department",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "jobposts",
          localField: "jobPostId",
          foreignField: "_id",
          as: "jobPostDetail",
        },
      },
      {
        $unwind: {
          path: "$jobPostDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "newdesignations",
          localField: "jobPostDetail.designationId",
          foreignField: "_id",
          as: "designationDetail",
        },
      },
      {
        $unwind: {
          path: "$designationDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "jobPostDetail.subDepartmentId",
          foreignField: "subDepartments._id",
          as: "subDepartmentDetail",
        },
      },
      {
        $unwind: {
          path: "$subDepartmentDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          subDepartment: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$subDepartmentDetail.subDepartments",
                  as: "sub",
                  cond: {
                    $eq: ["$$sub._id", "$jobPostDetail.subDepartmentId"],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          candidateUniqueId: 1,
          name: 1,
          mobileNumber: 1,
          emailId: 1,
          resume: 1,
          AI_Screeing_Result: 1,
          AI_Screeing_Status: 1,
          AI_Score: 1,
          AI_Confidence: 1,
          jobPostId: 1,
          resumeShortlisted: 1,
          Remark: 1,
          JobType: 1,
          currentCTC: 1,
          expectedCTC: 1,
          isEligible: 1,
          summary: 1,
          matchPercentage: 1,
          lastOrganization: 1,
          position: 1,
          createdAt: 1,
          department: "$department.name",
          designation: "$designationDetail.name",
          subDepartment: "$subDepartment.name",
        },
      },
    ]);

    if (jobAppliedDetails.length === 0) {
      return success(res, "No job applications found", []);
    }

    const fileUrl = await generateExcelAndUpload(jobAppliedDetails, "Job_Applications_Report");

    return success(res, "Excel file generated and uploaded", { url: fileUrl });
  } catch (error) {
    console.error("Export Excel Error:", error);
    return unknownError(res, error);
  }
};



export const assignCandidateUniqueIds = async (req, res) => {
  try {
    const { organizationId } = req.query;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      return badRequest(res, "Valid organizationId is required");
    }

    const candidates = await jobApply.find({ orgainizationId: organizationId })
      .sort({ createdAt: 1 }) // Sort by latest first
      .select("_id")
      .lean();

    if (!candidates.length) {
      return success(res, "No candidates found to update", []);
    }

    const bulkOps = candidates.map((candidate, index) => {
      const paddedNumber = (index + 1).toString().padStart(3, "0"); // FIN001
      return {
        updateOne: {
          filter: { _id: candidate._id },
          update: { $set: { candidateUniqueId: `FIN${paddedNumber}` } }
        }
      };
    });

    const result = await jobApply.bulkWrite(bulkOps);

    return success(res, "Candidate IDs updated successfully", {
      totalUpdated: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error in assignCandidateUniqueIds:", error.message);
    return UnknownError(res, error);
  }
};





