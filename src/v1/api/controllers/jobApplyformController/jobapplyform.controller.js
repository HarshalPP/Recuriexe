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
import mailSwitchesModel from "../../models/mailModel/mailSwitch.model.js"
import designationModel from "../../models/designationModel/designation.model.js";

//   import jobFormGoogleSheet from "../../../helpers/jobFormGoogleSheet.js"; // adjust path
//   import jobFormGoogleSheet from "../../../helpers/jobFormGoogleSheet.js"; // adjust path


// Apply Job form //


export const jobApplyFormAdd = async (req, res) => {
  try {
    let token = req.user._id;
    const userId = req.user._id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // ⛔ Prevent duplicate application for same job
    const alreadyApplied = await jobApply.findOne({
      candidateId: userId,
      jobPostId: req.body.jobPostId,
    });

    //  const organizationId = req.employee.organizationId
    if (alreadyApplied) {
      return badRequest(res, "You have already applied for this job.");
    }

    // Check if the user has applied for any position within the last 2 months
    // const recentApplication = await jobApply.findOne({
    //   mobileNumber: req.body.mobileNumber,
    //   createdAt: { $gte: new Date(currentTime - twoMonthsInMilliseconds) },
    // });

    // if (recentApplication) {
    //   return badRequest(
    //     res,
    //     "You can reapply for any job only after 2 months from your last application."
    //   );
    // }

    if (!req.body.resume) {
      return badRequest(res, "Please Upload Resume before apply...")
    }

    let fieldsToProcess = [
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

    const candidateMobileNumber = req.body.mobileNumber;
    req.body.candidateId = token;

    // === AI SCREENING LOGIC STARTS HERE ===

    const jobPost = await jobPostModel.findById(req.body.jobPostId).lean();
    if (!jobPost) {
      return badRequest(res, "Job post not found.");
    }

    const finddesingnation = await designationModel.findById(jobPost.designationId).lean();
    if (!finddesingnation) {
      return badRequest(res, "Designation not found for this job post.");
    }



    req.body.departmentId = jobPost.departmentId;
    req.body.subDepartmentId = jobPost.subDepartmentId;
    req.body.position = finddesingnation.name;
    req.body.branchId = jobPost.branchId[0]; // Assuming branchId is an array, taking the first element

    const vacancyRequest = await vacancyRequestModel.findOne({ jobPostId: req.body.jobPostId }).lean();


    const aiScreeningEnabled =
      jobPost?.AI_Screening == "true" || vacancyRequest?.AI_Screening == "true";

    const requiredPercentage = Math.max(
      jobPost?.AI_Percentage || 0,
      vacancyRequest?.AI_Percentage || 0
    );

    const aiConfig = await aiModel.findOne({ title: 'AI Screening', enableAIResumeParsing: true });

    if (aiScreeningEnabled) {
      if (!aiConfig) {
        console.warn("AI screening is enabled but the AI configuration is missing (title: 'AI Screening', enableAIResumeParsing: true). Skipping screening.");
        req.body.AI_Result = "false";
      } else {
        const aiResult = await screenApplicant(req.body.jobPostId, req.body.resume);

        if (!aiResult || aiResult.error || aiResult.status == 429) {
          req.body.AI_Result = "false";
        }
        else if (aiResult.matchPercentage < requiredPercentage) {
          return badRequest(
            res,
            `AI screening failed: Your resume match score is ${aiResult.matchPercentage}%. Required: ${requiredPercentage}%`
          );
        } else {
          req.body.AI_Result = "true";
          req.body.isEligible = aiResult.isEligible;
          req.body.matchPercentage = aiResult.matchPercentage;
          req.body.summary = aiResult.summary;
        }
      }
    }

    const jobFormInstance = new jobApply(req.body);
    const jobApplyForm = await jobFormInstance.save(); // triggers pre("save")


    if (jobApplyForm.jobFormType == "recommended") {
      await jobApply.findByIdAndUpdate(
        { _id: jobApplyForm._id },
        {
          status: "inProgress",
          resumeShortlisted: "shortlisted",
          recommendedByID: token.Id,
        },
        { new: true }
      );
    }

    //   await jobFormGoogleSheet(jobApplyForm);
    success(res, "Job Applied Successfully", jobApplyForm);

    // const jobAapplyMail = await mailSwitchesModel.findOne({organizationId:new mongoose.Types.ObjectId(organizationId)});
    const jobAapplyMail = await mailSwitchesModel.findOne({});
    if (jobAapplyMail?.masterMailStatus && jobAapplyMail?.hrmsMail.hrmsMail && jobAapplyMail?.hrmsMail.jobApplyMail) {
      await sendThankuEmail(req.body.emailId, req.body.name, req.body.position);
      // console.log('Sending email to HR:')
    }

  } catch (error) {

    console.log(error, "heroo");
    unknownError(res, error);

  }
}


// Get JobApplyed  details //
export const getAllJobApplied = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page 1
    const limit = parseInt(req.query.limit) || 10; // default 10 items per page
    const skip = (page - 1) * limit;

    const jobAppliedDetails = await jobApply.aggregate([
      {
        $match: {
          status: { $in: ["active"] },
          jobFormType: "request",
        },
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



          // highestQualification: 1,
          // university: 1,
          // graduationYear: 1,
          // cgpa: 1,
          // address: 1,
          // state: 1,
          // city: 1,
          // pincode: 1,
          // skills: 1,
          // salarySlip: 1,
          // finCooperOfferLetter: 1,
          // pathofferLetterFinCooper: 1,
          // preferedInterviewMode: 1,
          // knewaboutJobPostFrom: 1,
          // currentDesignation: 1,
          // startDate: 1,
          // endDate: 1,
          // reasonLeaving: 1,
          // totalExperience: 1,
          // currentCTC: 1,
          // preferredLocation: 1,
          // currentLocation: 1,
          // gapIfAny: 1,
          // interviewSchedule: 1,
          // status: 1,
          // feedbackByHr: 1,
          // branches: 1,
          // manager: 1,
          // interviewDetails: 1,
          // hrFeedbackinterviewers: 1,
          // hrInterviewerDetails: 1,

          candidateStatus: 1,
          // AI_Result: 1,
          // jobPostDetail:1,
          // candidateDetails: 1,
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



    const { year = new Date().getFullYear() } = req.query;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Create date range for the year
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    // Get overall application count
    const totalApplications = await jobApply.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Get count of applications in different stages
    const statusCounts = await jobApply.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
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
          AI_Result: { $exists: true }
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

    console.log("stat", startDate)
    console.log("emd", endDate)

    // Calculate average time to hire
    const timeToHireData = await jobApply.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: "shortlisted", // hired
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


    // calclulate Rejected candidates //


    const rejectedCandidates = await jobApply.aggregate([{
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: "reject" // rejected candidates
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
      createdAt: { $gte: sevenDaysAgo }
    });

    // 2. Count rejections in the last 7 days
    const rejectedLast7Days = await jobApply.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      status: 'rejected'
    });


    const topAppliedDepartments = await jobApply.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
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
          position: { $exists: true, $ne: "" }
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
          knewaboutJobPostFrom: { $exists: true, $ne: null }
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
          _id: {
            position: "$position",
            departmentId: "$departmentId"
          },
          departmentName: { $first: "$departmentDetails.name" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10 
      },
      {
        $project: {
          _id: 0,
          position: "$_id.position",
          departmentId: "$_id.departmentId",
          departmentName: { $ifNull: ["$departmentName", "OTHERS"] },
          applications: "$count"
        }
      }
    ]);



    const coldPositions = await jobApply.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          position: { $exists: true, $ne: "" },
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
          _id: {
            position: "$position",
            departmentId: "$departmentId"
          },
          departmentName: { $first: "$departmentDetails.name" },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $lte: 5 } // you can adjust the threshold here
        }
      },
      {
        $sort: { count: 1 }
      },
      {
        $project: {
          _id: 0,
          position: "$_id.position",
          departmentId: "$_id.departmentId",
          departmentName: { $ifNull: ["$departmentName", "OTHERS"] },
          applications: "$count"
        }
      }
    ]);


        // Get applications by department
    const applicationsByDepartment = await getApplicationsByDepartment(startDate, endDate);


    // Get current month vs previous month stats
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthStartDate = new Date(`${year}-${String(currentMonth).padStart(2, '0')}-01T00:00:00.000Z`);
    const currentMonthEndDate = new Date(year, currentMonth, 0, 23, 59, 59, 999);

    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousMonthYear = currentMonth === 1 ? year - 1 : year;
    const previousMonthStartDate = new Date(`${previousMonthYear}-${String(previousMonth).padStart(2, '0')}-01T00:00:00.000Z`);
    const previousMonthEndDate = new Date(previousMonthYear, previousMonth, 0, 23, 59, 59, 999);

    const currentMonthApplications = await jobApply.countDocuments({
      createdAt: { $gte: currentMonthStartDate, $lte: currentMonthEndDate }
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
        totalShorlisted: timeToHireData[0]?.totalHired || 0,
        totalRejected: rejectedCandidates[0]?.totalRejected || 0,
        applicationsLast7Days: appsLast7Days || 0,
        rejectedLast7Days: rejectedLast7Days || 0,
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

    // Create date range for the year
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    // Get applications by month
    const applicationsByMonth = await getApplicationsByMonth(startDate, endDate);

    // Get hiring success rate by month
    const ShortlistedlistRate = await getHiringSuccessRate(startDate, endDate);

    // Get applications by department
    const applicationsByDepartment = await getApplicationsByDepartment(startDate, endDate);

    // Get applications by status
    const applicationsByStatus = await getApplicationsByStatus(startDate, endDate);

    // Get AI screening metrics
    const aiScreeningMetrics = await getAIScreeningMetrics(startDate, endDate);

    // Get positions with most applications
    const topPositions = await getTopPositions(startDate, endDate);

    // Get average time to hire
    const timeToHire = await getTimeToHire(startDate, endDate);

    // Get source breakdown
    const applicationSources = await getApplicationSources(startDate, endDate);

    // Get application workflow status
    const workflowStats = await getWorkflowStats(startDate, endDate);

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
const getApplicationsByMonth = async (startDate, endDate) => {
  const monthlyApplications = await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
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
const getHiringSuccessRate = async (startDate, endDate) => {
  const monthlyStats = await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
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
const getApplicationsByDepartment = async (startDate, endDate) => {
  return await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
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
const getApplicationsByStatus = async (startDate, endDate) => {
  const statusCounts = await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: "$status",
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
const getAIScreeningMetrics = async (startDate, endDate) => {
  // Get monthly AI screening results
  const monthlyAIResults = await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        AI_Result: { $exists: true }
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
const getTopPositions = async (startDate, endDate) => {
  return await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
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
const getTimeToHire = async (startDate, endDate) => {
  const hiredCandidates = await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ["onBoarded"] },
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
const getApplicationSources = async (startDate, endDate) => {
  const sources = await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        knewaboutJobPostFrom: { $exists: true, $ne: null }
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
const getWorkflowStats = async (startDate, endDate) => {
  // Get monthly workflow stats
  const workflowData = await jobApply.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
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







