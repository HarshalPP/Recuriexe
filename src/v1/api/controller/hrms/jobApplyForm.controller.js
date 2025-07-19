const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  parseJwt,
} = require("../../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const jobApplyFormModel = require("../../model/hrms/jobApplyForm.model");
const interviewerModel = require("../../model/hrms/interviewer.model");
const interviewDetailsModel = require("../../model/hrms/interviewDetails.model");
const mailsToCandidatesModel = require("../../model/hrms/mailsToCandidate.model");
const employeModel = require("../../model/adminMaster/employe.model");
const vacancyRequestModel = require("../../model/hrms/vacancyRequest.model");
const feedbackInterviewerModel = require("../../model/hrms/feedbackInterviewer.model");
const availabilityModel =require("../../model/hrms/availability.model");
const { sendEmail, hrmsSendEmail , sendThankuEmail } = require("../functions.Controller");
const { createGoogleMeetLink } = require("../hrms/googleMeet.controller");
const { jobFormGoogleSheet , jobFormDate} = require("../hrms/hrmsGoogleSheet.controller");
const uploadToSpaces = require("../../services/spaces.service");
const fs = require("node:fs");
const { parseDate } = require("pdf-lib");
const cron = require("node-cron");
const moment = require("moment");
const {screenApplicant} = require("../../controller/gemini/screeningRoundAI.controller")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//-----------------------------------------------------------------------------
cron.schedule("00 09 * * *", async () => {
  // Adjusted to 9:00 PM
  try {
    const notTakenAction = await jobApplyFormModel
      .find({
        status: "hold",
        resumeShortlisted: "hold",
        jobFormType: "recommended",
        hrInterviewSchedule: "active",
      })
      .populate({
        path: "branchId",
        select: "_id name status",
      })
      .populate({
        path: "vacancyRequestId",
      })
      .populate({
        path: "recommendedByID",
        select: "_id employeName workEmail reportingManagerId status",
      })
      .populate({
        path: "departmentId",
        select: "_id name status",
      });
    // console.log(notTakenAction)
    const now = moment();

    notTakenAction.forEach(async (jobform) => {
      const createdAt = moment(jobform.createdAt);
      const diffInHours = now.diff(createdAt, "hours");

      if (diffInHours >= 24) {
        const managerEmail = await employeModel.findById(
          jobform.recommendedByID.reportingManagerId
        ); // Assuming `createdByManager` has `email`
// console.log(jobform.recommendedByID.reportingManagerId)
// console.log(managerEmail.workEmail)
        if (managerEmail) {
          const toEmails = managerEmail.workEmail;
          const ccEmails = process.env.HR3_EMAIL;

    const msg = `<div style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
    
    <p style="font-size: 16px; color: #000;">Dear ${managerEmail.employeName},</p>
    <p style="font-size: 16px; color: #000;">The following Recommended Candidate requires your approval:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <tr>
        <th style="text-align: left; padding: 10px; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">Candidate</th>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${jobform.name}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 10px; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">Department</th>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${jobform.departmentId.name}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 10px; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">Branch</th>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${jobform.branchId.name}</td>
      </tr>
       <tr>
        <th style="text-align: left; padding: 10px; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">Position</th>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${jobform.position}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 10px; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">Requested By</th>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${jobform.recommendedByID.employeName}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 10px; background-color: #f4f4f4; border-bottom: 1px solid #ddd;">Requested Date</th>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${new Date(jobform.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
      </tr>
    </table>
    
    <p style="font-size: 16px; color: #000; margin-top: 20px;">
      Please <a href="https://finexe.fincooper.in/hrms/talantAquisition/vacancyTable/candidateToApprove/" style="color: #000; text-decoration: underline;">review and approve</a> this request at your earliest convenience.
    </p>
    
    <p style="font-size: 16px; color: #000;">Thank you.</p>
    <p style="font-size: 16px; color: #000;">Regards,<br>Your HR Team</p>
    
    <p style="font-size: 14px; color: #555; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px;">
      This is a system-generated message. Please do not reply to this email.
    </p>
  </div>
</div>
`;

          hrmsSendEmail(
            toEmails,
            ccEmails,
            "Recommended Candidate Approval Request",
            msg,
            ""
          );
          console.log(`Email sent to manager: ${managerEmail.employeName} for vacancy ID: ${jobform._id}`);
        }
        else {
          console.warn(`No email found for manager of vacancy ID: ${jobform._id}`);
        }
      }
    });
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});
//---------------------------------pending work mail to hr and sir --------------------------------------------

cron.schedule("30 18 * * *", async () => {
  try {
    const notTakenActionRequest = await jobApplyFormModel
      .find({
        status: "active",
        resumeShortlisted: "active",
        jobFormType: "request",
        hrInterviewSchedule: "active",
      })
      .populate({
        path: "branchId",
        select: "_id name status",
      })
      .populate({
        path: "vacancyRequestId",
      })
      .populate({
        path: "recommendedByID",
        select: "_id employeName workEmail reportingManagerId status",
      })
      .populate({
        path: "departmentId",
        select: "_id name status",
      });

    const notTakenActionRecommend = await jobApplyFormModel
      .find({
        status: "inProgress",
        resumeShortlisted: "shortlisted",
        jobFormType: "recommended",
        hrInterviewSchedule: "active",
      })
      .populate({
        path: "branchId",
        select: "_id name status",
      })
      .populate({
        path: "vacancyRequestId",
      })
      .populate({
        path: "recommendedByID",
        select: "_id employeName workEmail reportingManagerId status",
      })
      .populate({
        path: "departmentId",
        select: "_id name status",
      });

    const notTakenActionVacancy = await vacancyRequestModel
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

    const toEmails = process.env.HR3_EMAIL;
    const ccEmails = process.env.KETAV_SIR || "";

    const msg = `
  <div style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
      <p style="font-size: 16px; color: #333; line-height: 1.6;">Dear HR,</p>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Please find below the summary of pending actions in the system:
      </p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #ddd; font-size: 16px; color: #333;">
        <thead>
          <tr style="background-color: #f4f4f4; text-align: left;">
            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Pending Work</th>
            <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Count</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd;">Active Candidate Applications (Requests)</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${notTakenActionRequest.length}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd;">Pending Recommended Candidates</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${notTakenActionRecommend.length}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd;">Pending Vacancies</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${notTakenActionVacancy.length}</td>
          </tr>
        </tbody>
      </table>
      
      <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 20px;">
        Kindly <a href="https://finexe.fincooper.in/hrms/talantAquisition/allApplication/" style="color: #1a73e8; text-decoration: none;">review and take the necessary actions</a> at your earliest convenience. 
        Your prompt attention to these pending tasks will ensure smooth processing and efficient workflow.
      </p>
      
      <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 20px;">Thank you for your cooperation.</p>
      
      <p style="font-size: 14px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px;">
        This is an automated message generated by the system. Please do not reply to this email.
      </p>
    </div>
  </div>
`;


    hrmsSendEmail(
      toEmails,
      ccEmails,
      "Summary of Pending Actions",
      msg,
      ""
    );

    console.log(
      `Email sent to HR: ${toEmails} with counts - Requests: ${notTakenActionRequest.length}, Recommendations: ${notTakenActionRecommend.length}, Vacancies: ${notTakenActionVacancy.length}`
    );
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

//------------------------------------------------------------------------
cron.schedule("00 09 * * *", async () => {
  try {
    const notTakenAction = await jobApplyFormModel
      .find({
        status: "active",
        resumeShortlisted: "active",
        jobFormType: "request",
        hrInterviewSchedule: "active",
      })
      .populate({
        path: "branchId",
        select: "_id name status",
      })
      .populate({
        path: "vacancyRequestId",
      })
      .populate({
        path: "recommendedByID",
        select: "_id employeName workEmail reportingManagerId status",
      })
      .populate({
        path: "departmentId",
        select: "_id name status",
      });

    const now = moment();
    const delayedActions = notTakenAction.filter((jobform) => {
      const createdAt = moment(jobform.createdAt);
      const diffInHours = now.diff(createdAt, "hours");
      return diffInHours >= 24;
    });

    if (delayedActions.length > 0) {
      const toEmails = process.env.HR3_EMAIL;
      const ccEmails = "";

      const tableRows = delayedActions
        .map((jobform) => {
          return `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">${jobform.name}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${jobform.departmentId.name}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${jobform.branchId.name}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${jobform.position}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date(jobform.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</td>
            </tr>`;
        })
        .join("");

      const msg = `
        <div style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
            <p style="font-size: 16px; color: #000;">Dear HR,</p>
            <p style="font-size: 16px; color: #000;">
              This is to inform you that there are <b>${delayedActions.length}</b> candidates who have applied through the website but no action has been taken on their profiles yet:
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #ddd;">
              <tr style="background-color: #f4f4f4;">
                <th style="padding: 10px; border: 1px solid #ddd;">Candidate</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Department</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Branch</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Position</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Applied Date</th>
              </tr>
              ${tableRows}
            </table>
            
            <p style="font-size: 16px; color: #000; margin-top: 20px;">
              Please <a href="https://finexe.fincooper.in/hrms/talantAquisition/allApplication/" style="color: #000; text-decoration: underline;">review and approve</a> these requests at your earliest convenience.
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
        "Pending Candidate Applications Notification",
        msg,
        ""
      );

      console.log(
        `Email sent to HR: ${toEmails} for ${delayedActions.length} pending applications.`
      );
    } else {
      console.log("No delayed actions found.");
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

//------------------------------------------------------------------------
cron.schedule("00 09 * * *", async () => {
  try {
    const notTakenAction = await jobApplyFormModel
      .find({
        status: "inProgress",
        resumeShortlisted: "shortlisted",
        jobFormType: "recommended",
        hrInterviewSchedule: "active",
      })
      .populate({
        path: "branchId",
        select: "_id name status",
      })
      .populate({
        path: "vacancyRequestId",
      })
      .populate({
        path: "recommendedByID",
        select: "_id employeName workEmail reportingManagerId status",
      })
      .populate({
        path: "departmentId",
        select: "_id name status",
      });

    const now = moment();
    const delayedActions = notTakenAction.filter((jobform) => {
      const createdAt = moment(jobform.createdAt);
      const diffInHours = now.diff(createdAt, "hours");
      return diffInHours >= 24;
    });

    if (delayedActions.length > 0) {
      const toEmails = process.env.HR3_EMAIL;
      const ccEmails = "";

      const tableRows = delayedActions
        .map((jobform) => {
          return `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">${jobform.name}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${jobform.departmentId.name}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${jobform.branchId.name}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${jobform.position}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date(jobform.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</td>
            </tr>`;
        })
        .join("");

      const msg = `
        <div style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
            <p style="font-size: 16px; color: #000;">Dear HR,</p>
            <p style="font-size: 16px; color: #000;">
              This is to inform you that there are <b>${delayedActions.length}</b> recommended candidates and no action has been taken on their profiles yet:
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #ddd;">
              <tr style="background-color: #f4f4f4;">
                <th style="padding: 10px; border: 1px solid #ddd;">Candidate</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Department</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Branch</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Position</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Applied Date</th>
              </tr>
              ${tableRows}
            </table>
            
            <p style="font-size: 16px; color: #000; margin-top: 20px;">
              Please <a href="https://finexe.fincooper.in/hrms/talantAquisition/allApplication/" style="color: #000; text-decoration: underline;">review and approve</a> these requests at your earliest convenience.
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
        "Pending Candidate Applications Notification",
        msg,
        ""
      );

      console.log(
        `Email sent to HR: ${toEmails} for ${delayedActions.length} pending applications.`
      );
    } else {
      console.log("No delayed actions found.");
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

//--------------------------------------------------------------

async function getJobFormsByStatus(req, res) {
  try {
    // Define statuses that you want to filter on
    const statuses = [
      "active",
      "shortlisted",
      "hold",
      "reject",
      "inProgress",
      "managerReview",
      "shortlistedBYManager",
    ];

    // Prepare an object to hold data and count for each status
    let result = {};

    for (let status of statuses) {
      // Fetch job applications based on the current status
      let jobApplications = await jobApplyFormModel.find({ status });

      // Add the status, count, and data to the result
      result[status] = {
        count: jobApplications.length,
        data: jobApplications,
      };
    }

    // Send the result back in response
    success(res, "Job forms fetched successfully", result);
  } catch (error) {
    unknownError(res, error);
  }
}

//--------------------------------------------------------------

async function getRejectedJobForms(req, res) {
  try {
    const statuses = ["hold", "reject"];

    const jobApplications = await jobApplyFormModel
      .find({ status: { $in: statuses }, jobFormType: "request" })
      .populate({
        path: "branchId",
        select: "_id name status",
      })
      .sort({ createdAt: -1 });
    console.log(jobApplications.length);

    success(res, "Job forms fetched successfully", jobApplications);
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------HRMS  Add jobApplyForm ---------------------------------------
// async function jobApplyFormAdd(req, res) {
//   try {
//     let token = parseJwt(req.headers.token);
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     if (req.body.vacancyRequestId) {
//       const alreadyExist = await jobApplyFormModel.findOne({
//         mobileNumber: req.body.mobileNumber,
//         vacancyRequestId: new ObjectId(req.body.vacancyRequestId),
//       });
//       if (alreadyExist) {
//         return badRequest(res, "Already applied for this post");
//       }
//     }
//     if (req.body.jobPostId) {
//       const alreadyExist = await jobApplyFormModel.findOne({
//         mobileNumber: req.body.mobileNumber,
//         jobPostId: new ObjectId(req.body.jobPostId),
//       });
//       if (alreadyExist) {
//         return badRequest(res, "Already applied for this post");
//       }
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
//     const generateUniqueId = (phoneNumber) => {
//       const timestamp = Date.now();
//       const lastFiveDigits = String(phoneNumber).slice(-5);
//       return `CAN-${lastFiveDigits}-${timestamp}`;
//     };

//     const candidateMobileNumber = req.body.mobileNumber;
//     const candidateUniqueId = generateUniqueId(candidateMobileNumber);

//     req.body.candidateUniqueId = candidateUniqueId;

//     const jobApplyForm = await jobApplyFormModel.create(req.body);
//     if (jobApplyForm.jobFormType === "recommended") {
//       await jobApplyFormModel.findByIdAndUpdate(
//         { _id: jobApplyForm._id },
//         {
//           status: "inProgress",
//           resumeShortlisted: "shortlisted",
//           recommendedByID: token.Id,
//         },
//         { new: true }
//       );
//     }
//     await jobFormGoogleSheet(jobApplyForm);

//     success(res, "Job Applied  Successfully", jobApplyForm);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }


async function jobApplyFormAdd(req, res) {
  try {
    let token = parseJwt(req.headers.token);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const twoMonthsInMilliseconds = 60 * 24 * 60 * 60 * 1000; // 2 months in milliseconds
    const currentTime = Date.now();

    // Check if the user has applied for any position within the last 2 months
    const recentApplication = await jobApplyFormModel.findOne({
      mobileNumber: req.body.mobileNumber,
      createdAt: { $gte: new Date(currentTime - twoMonthsInMilliseconds) },
    });

    if (recentApplication) {
      return badRequest(
        res,
        "You can reapply for any job only after 2 months from your last application."
      );
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

    const generateUniqueId = (phoneNumber) => {
      const timestamp = Date.now();
      const lastFiveDigits = String(phoneNumber).slice(-5);
      return `CAN-${lastFiveDigits}-${timestamp}`;
    };

    const candidateMobileNumber = req.body.mobileNumber;
    const candidateUniqueId = generateUniqueId(candidateMobileNumber);

    req.body.candidateUniqueId = candidateUniqueId;

    const jobApplyForm = await jobApplyFormModel.create(req.body);

    if (jobApplyForm.jobFormType === "recommended") {
      await jobApplyFormModel.findByIdAndUpdate(
        { _id: jobApplyForm._id },
        {
          status: "inProgress",
          resumeShortlisted: "shortlisted",
          recommendedByID: token.Id,
        },
        { new: true }
      );
    }


    await jobFormGoogleSheet(jobApplyForm);
    success(res, "Job Applied Successfully", jobApplyForm);
    await sendThankuEmail(req.body.emailId, req.body.name , req.body.position);


        // AI SCREENING CODE HERE //

        if(jobApplyForm.jobFormType == "request") {
          const Eligibility = await screenApplicant(req.body.jobPostId , req.body.resume)
          if(Eligibility) {
            await jobApplyFormModel.findByIdAndUpdate(
              { _id: jobApplyForm._id },
              {
                isEligible:Eligibility.isEligible,
                matchPercentage:Eligibility.matchPercentage,
                summary:Eligibility.summary
              },
              { new: true }
            );
          }

          // end of AI SCREENING CODE HERE //


          }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}



//--------------------------------------------------------------------------------------------
async function jobApplyFormUpdate(req, res) {
  try {
    const token = parseJwt(req.headers.token);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { id, ...updateFields } = req.body; // Extract `id` and other fields to update

    if (!id) {
      return badRequest(res, "Job application ID is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, "Invalid job application ID.");
    }

    let candidate = await jobApplyFormModel.findOne({
      _id: id,
    });

    if (candidate.status !== "hold" || candidate.resumeShortlisted !== "hold") {
      return badRequest(res, "Cannot update this candidate as it is approved by your reporting manager");
    }
    // Disallow updating certain fields
    const restrictedFields = ["branchId","position","jobFormType","recommendedByID", "vacancyRequestId", "workLocationId", "departmentId"];
    restrictedFields.forEach((field) => {
      if (updateFields[field] !== undefined) {
        delete updateFields[field];
      }
    });

    // Trim string fields if provided
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
      if (updateFields[field]) {
        updateFields[field] = updateFields[field].trim();
      }
    });

    // Update the document
    const updatedJobApplyForm = await jobApplyFormModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!updatedJobApplyForm) {
      return badRequest(res, "Job application not found.");
    }

    // Optional: Update Google Sheets or other external integrations
    await jobFormGoogleSheet(updatedJobApplyForm);

    success(res, "Job application updated successfully.", updatedJobApplyForm);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//------------------------------------------------------------------------------------------
async function getJobFormById(req, res) {
  try {
    const id = req.query.Id;

    let jobApplyForm = await jobApplyFormModel
      .findById(id)
      .populate({ path: "departmentId", select: "name" })
      .populate({ path: "branchId", select: "name" });
    success(res, "JobApplyForm details", jobApplyForm);
  } catch (error) {
    unknownError(res, error);
  }
}
// ------------------Resume  Upload And Get resume Url---------------------------------------
async function resumeUpload(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      if (!req.file) {
        return badRequest(res,"No file provided.")
      }
      
      // Read the file from the temp folder
      const fileContent = fs.readFileSync(req.file.path);
      const filePathInBucket = `${process.env.PATH_BUCKET}/LOS/PDF/${Date.now()}_${req.file.originalname}`;
      const contentType = req.file.mimetype;
  
      // Call our separate upload function
      const bucketName = 'finexe';
      const data = await uploadToSpaces(bucketName, filePathInBucket, fileContent, 'public-read', contentType);
  
      // Clean up the temp file
      fs.unlinkSync(req.file.path);
  
      // data.Location will be the public URL of the uploaded file (if ACL is public)
      return success(res,"File uploaded successfully!",{pdf: `https://cdn.fincooper.in/${filePathInBucket}`})
    }
    } catch (error) {
      console.error('Error uploading to Spaces:', error);
  
      // If something fails, attempt to remove the temp file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
  
      return unknownError(res,error)
  
    }
  }
// ------------------HRMS View All jobApplyForm ---------------------------------------

// async function getAllJobApplied(req, res) {
//   try {
//     let jobAppliedDetails = await jobApplyFormModel.aggregate([
//       {
//         $match: { status: "active", jobFormType: "request" }, // Match only active status
//       },
//       {
//         $lookup: {
//           from: "newdepartments", // Collection name for departments
//           localField: "departmentId", // Field in jobPostModel
//           foreignField: "_id", // Field in departments collection
//           pipeline: [
//             {
//               $project: {
//                 _id: 0, // Exclude the _id field
//                 name: 1, // Include only the employeName field
//               },
//             },
//           ],
//           as: "department", // Alias for the joined data
//         },
//       },
//       {
//         $unwind: {
//           path: "$department", // Unwind the department array
//           preserveNullAndEmptyArrays: true, // Allow null values if no match is found
//         },
//       },
//       {
//         $lookup: {
//           from: "newbranches", // Collection name for branches
//           localField: "branchId", // Field in jobPostModel
//           foreignField: "_id", // Field in branches collection
//           pipeline: [
//             {
//               $project: {
//                 _id: 0, // Exclude the _id field
//                 name: 1, // Include only the employeName field
//               },
//             },
//           ],
//           as: "branches", // Alias for the joined data
//         },
//       },
//       {
//         $unwind: {
//           path: "$branches", // Unwind the branches array
//           preserveNullAndEmptyArrays: true, // Allow null values if no match is found
//         },
//       },
//       {
//         $lookup: {
//           from: "employees", // Collection name for employees
//           localField: "employeUniqueId", // Field in jobApplyFormModel
//           foreignField: "employeUniqueId", // Field in employees collection
//           pipeline: [
//             {
//               $project: {
//                 _id: 0, // Exclude the _id field
//                 employeName: 1, // Include only the employeName field
//               },
//             },
//           ],
//           as: "employees", // Alias for the joined data
//         },
//       },
//       {
//         $unwind: {
//           path: "$employees", // Unwind the employees array
//           preserveNullAndEmptyArrays: true, // Allow null values in case no match is found
//         },
//       },
//       {
//         $lookup: {
//           from: "employees", // Collection name for departments
//           localField: "managerID", // Field in jobPostModel
//           foreignField: "_id", // Field in departments collection
//           pipeline: [
//             {
//               $project: {
//                 _id: 0, // Exclude the _id field
//                 employeName: 1, // Include only the employeName field
//               },
//             },
//           ],
//           as: "manager", // Alias for the joined data
//         },
//       },
//       {
//         $unwind: {
//           path: "$manager", // Unwind the department array
//           preserveNullAndEmptyArrays: true, // Allow null values in case no match is found
//         },
//       },
//       {
//         $lookup: {
//           from: "interviewdetails", // Collection name for interviewDetails
//           localField: "_id", // Field in jobApplyFormModel
//           foreignField: "jobApplyFormId", // Field in interviewDetails
//           as: "interviewDetails", // Alias for the joined data
//         },
//       },
//       {
//         $unwind: {
//           path: "$interviewDetails", // Unwind the interviewDetails array
//           preserveNullAndEmptyArrays: true, // Allow null values in case no match is found
//         },
//       },
//       {
//         $lookup: {
//           from: "feedbackinterviewers", // Collection name for interviewDetails
//           localField: "_id", // Field in jobApplyFormModel
//           foreignField: "jobApplyFormId", // Field in interviewDetails
//           as: "hrFeedbackinterviewers", // Alias for the joined data
//         },
//       },
//       {
//         $unwind: {
//           path: "$hrFeedbackinterviewers", // Unwind the interviewDetails array
//           preserveNullAndEmptyArrays: true, // Allow null values in case no match is found
//         },
//       },
//       {
//         $lookup: {
//           from: "employees", // Join the employees collection
//           localField: "hrFeedbackinterviewers.interviewerId", // Match by interviewerId
//           foreignField: "_id",
//           pipeline: [
//             {
//               $project: {
//                 _id: 0, // Exclude the _id field
//                 employeName: 1, // Include only employeName
//               },
//             },
//           ],
//           as: "hrInterviewerDetails", // Alias for the interviewer data
//         },
//       },
//       {
//         $unwind: {
//           path: "$hrInterviewerDetails", // Unwind the interviewer details
//           preserveNullAndEmptyArrays: true, // Allow null if no match is found
//         },
//       },
//       {
//         $group: {
//           _id: "$_id", // Group by unique jobApplyForm ID
//           candidateUniqueId: { $first: "$candidateUniqueId" },
//           name: { $first: "$name" },
//           mobileNumber: { $first: "$mobileNumber" },
//           emailId: { $first: "$emailId" },
//           highestQualification: { $first: "$highestQualification" },
//           university: { $first: "$university" },
//           graduationYear: { $first: "$graduationYear" },
//           cgpa: { $first: "$cgpa" },
//           address: { $first: "$address" },
//           state: { $first: "$state" },
//           city: { $first: "$city" },
//           pincode: { $first: "$pincode" },
//           skills: { $first: "$skills" },
//           resume: { $first: "$resume" },
//           finCooperOfferLetter: { $first: "$finCooperOfferLetter" },
//           pathofferLetterFinCooper: { $first: "$pathofferLetterFinCooper" },
//           preferedInterviewMode: { $first: "$preferedInterviewMode" },
//           position: { $first: "$position" },
//           knewaboutJobPostFrom: { $first: "$knewaboutJobPostFrom" },
//           currentDesignation: { $first: "$currentDesignation" },
//           lastOrganization: { $first: "$lastOrganization" },
//           startDate: { $first: "$startDate" },
//           endDate: { $first: "$endDate" },
//           reasonLeaving: { $first: "$reasonLeaving" },
//           totalExperience: { $first: "$totalExperience" },
//           currentCTC: { $first: "$currentCTC" },
//           preferredLocation: { $first: "$preferredLocation" },
//           currentLocation: { $first: "$currentLocation" },
//           gapIfAny: { $first: "$gapIfAny" },
//           interviewSchedule: { $first: "$interviewSchedule" },
//           status: { $first: "$status" },
//           feedbackByHr: { $first: "$feedbackByHr" },
//           department: { $first: "$department" },
//           branches: { $first: "$branches" },
//           employees: { $first: "$employees" },
//           manager: { $first: "$manager" },
//           interviewDetails: { $first: "$interviewDetails" },
//           hrFeedbackinterviewers: { $last: "$hrFeedbackinterviewers" },
//           hrInterviewerDetails: { $last: "$hrInterviewerDetails" },
//           candidateStatus: { $first: "$candidateStatus" },
//         },
//       },
//     ]);

//     // Organize data by department
//     let departmentData = {};
//     jobAppliedDetails.forEach((job) => {
//       if (!job.department || !job.department.name) {
//         // Handle cases where department details are missing
//         return;
//       }

//       const departmentName = job.department.name;
//       if (job.interviewDetails) {
//         if (job.interviewDetails.interviewerId.equals(req.Id)) {
//           job.hrIsInterviewer = "yes";
//         } else {
//           job.hrIsInterviewer = "no";
//         }
//       }

//       // console.log(job.hrIsInterviewer);

//       if (!departmentData[departmentName]) {
//         departmentData[departmentName] = [];
//       }
//       departmentData[departmentName].push(job);
//     });

//     // Convert grouped data into an array format
//     const jobAppliedByDepartment = Object.keys(departmentData)
//       .sort()
//       .map((departmentName) => ({
//         department: departmentName,
//         jobs: departmentData[departmentName],
//       }));

//     success(res, "All job Applied Form details", jobAppliedByDepartment);
//   } catch (error) {
//     console.error(error);
//     unknownError(res, error);
//   }
// }


// async function getAllJobApplied(req, res) {
//   try {
//     let jobAppliedDetails = await jobApplyFormModel.aggregate([
//       {
//         $match: { status: "active", jobFormType: "request" }, // Match only active status
//       },
//       {
//         $sort: { createdAt: -1 } // Sort by createdAt in descending order (latest first)
//       },

//       {
//         $lookup: {
//           from: "newdepartments", // Collection name for departments
//           localField: "departmentId", // Field in jobPostModel
//           foreignField: "_id", // Field in departments collection
//           pipeline: [
//             {
//               $project: {
//                 _id: 0, // Exclude the _id field
//                 name: 1, // Include only the employeName field
//               },
//             },
//           ],
//           as: "department", // Alias for the joined data
//         },
//       },
//       {
//         $unwind: {
//           path: "$department", // Unwind the department array
//           preserveNullAndEmptyArrays: true, // Allow null values if no match is found
//         },
//       },
//       {
//         $lookup: {
//           from: "newbranches", // Collection name for branches
//           localField: "branchId", // Field in jobPostModel
//           foreignField: "_id", // Field in branches collection
//           pipeline: [
//             {
//               $project: {
//                 _id: 0, // Exclude the _id field
//                 name: 1, // Include only the employeName field
//               },
//             },
//           ],
//           as: "branches", // Alias for the joined data
//         },
//       },
//       {
//         $unwind: {
//           path: "$branches", // Unwind the branches array
//           preserveNullAndEmptyArrays: true, // Allow null values if no match is found
//         },
//       },
//       {
//         $lookup: {
//           from: "employees", // Collection name for employees
//           localField: "employeUniqueId", // Field in jobApplyFormModel
//           foreignField: "employeUniqueId", // Field in employees collection
//           pipeline: [
//             {
//               $project: {
//                 _id: 0, // Exclude the _id field
//                 employeName: 1, // Include only the employeName field
//               },
//             },
//           ],
//           as: "employees", // Alias for the joined data
//         },
//       },
//       {
//         $unwind: {
//           path: "$employees", // Unwind the employees array
//           preserveNullAndEmptyArrays: true, // Allow null values in case no match is found
//         },
//       },
//       {
//         $lookup: {
//           from: "employees", // Collection name for departments
//           localField: "managerID", // Field in jobPostModel
//           foreignField: "_id", // Field in departments collection
//           pipeline: [
//             {
//               $project: {
//                 _id: 0, // Exclude the _id field
//                 employeName: 1, // Include only the employeName field
//               },
//             },
//           ],
//           as: "manager", // Alias for the joined data
//         },
//       },
//       {
//         $unwind: {
//           path: "$manager", // Unwind the department array
//           preserveNullAndEmptyArrays: true, // Allow null values in case no match is found
//         },
//       },
//       {
//         $lookup: {
//           from: "interviewdetails", // Collection name for interviewDetails
//           localField: "_id", // Field in jobApplyFormModel
//           foreignField: "jobApplyFormId", // Field in interviewDetails
//           as: "interviewDetails", // Alias for the joined data
//         },
//       },
//       {
//         $unwind: {
//           path: "$interviewDetails", // Unwind the interviewDetails array
//           preserveNullAndEmptyArrays: true, // Allow null values in case no match is found
//         },
//       },
//       {
//         $lookup: {
//           from: "feedbackinterviewers", // Collection name for interviewDetails
//           localField: "_id", // Field in jobApplyFormModel
//           foreignField: "jobApplyFormId", // Field in interviewDetails
//           as: "hrFeedbackinterviewers", // Alias for the joined data
//         },
//       },
//       {
//         $unwind: {
//           path: "$hrFeedbackinterviewers", // Unwind the interviewDetails array
//           preserveNullAndEmptyArrays: true, // Allow null values in case no match is found
//         },
//       },
//       {
//         $lookup: {
//           from: "employees", // Join the employees collection
//           localField: "hrFeedbackinterviewers.interviewerId", // Match by interviewerId
//           foreignField: "_id",
//           pipeline: [
//             {
//               $project: {
//                 _id: 0, // Exclude the _id field
//                 employeName: 1, // Include only employeName
//               },
//             },
//           ],
//           as: "hrInterviewerDetails", // Alias for the interviewer data
//         },
//       },
//       {
//         $unwind: {
//           path: "$hrInterviewerDetails", // Unwind the interviewer details
//           preserveNullAndEmptyArrays: true, // Allow null if no match is found
//         },
//       },
      
//       {
//         $group: {
//           _id: "$_id", // Group by unique jobApplyForm ID
//           candidateUniqueId: { $first: "$candidateUniqueId" },
//           name: { $first: "$name" },
//           mobileNumber: { $first: "$mobileNumber" },
//           emailId: { $first: "$emailId" },
//           highestQualification: { $first: "$highestQualification" },
//           university: { $first: "$university" },
//           graduationYear: { $first: "$graduationYear" },
//           cgpa: { $first: "$cgpa" },
//           address: { $first: "$address" },
//           state: { $first: "$state" },
//           city: { $first: "$city" },
//           pincode: { $first: "$pincode" },
//           skills: { $first: "$skills" },
//           resume: { $first: "$resume" },
//           salarySlip:{ $first: "$salarySlip"},
//           finCooperOfferLetter: { $first: "$finCooperOfferLetter" },
//           pathofferLetterFinCooper: { $first: "$pathofferLetterFinCooper" },
//           preferedInterviewMode: { $first: "$preferedInterviewMode" },
//           position: { $first: "$position" },
//           knewaboutJobPostFrom: { $first: "$knewaboutJobPostFrom" },
//           currentDesignation: { $first: "$currentDesignation" },
//           lastOrganization: { $first: "$lastOrganization" },
//           startDate: { $first: "$startDate" },
//           endDate: { $first: "$endDate" },
//           reasonLeaving: { $first: "$reasonLeaving" },
//           totalExperience: { $first: "$totalExperience" },
//           currentCTC: { $first: "$currentCTC" },
//           preferredLocation: { $first: "$preferredLocation" },
//           currentLocation: { $first: "$currentLocation" },
//           gapIfAny: { $first: "$gapIfAny" },
//           interviewSchedule: { $first: "$interviewSchedule" },
//           status: { $first: "$status" },
//           feedbackByHr: { $first: "$feedbackByHr" },
//           department: { $first: "$department" },
//           branches: { $first: "$branches" },
//           employees: { $first: "$employees" },
//           manager: { $first: "$manager" },
//           interviewDetails: { $first: "$interviewDetails" },
//           hrFeedbackinterviewers: { $last: "$hrFeedbackinterviewers" },
//           hrInterviewerDetails: { $last: "$hrInterviewerDetails" },
//           candidateStatus: { $first: "$candidateStatus" },
//           isEligible:{ $first: "$isEligible" },
//           matchPercentage: { $first: "$matchPercentage" },
//           summary: { $first: "$summary" },
//           createdAt: { $first: "$createdAt" }, // Keep createdAt in sorting order

//         },
//       },
//     ]);

//     // Organize data by department
//     let departmentData = {};
//     jobAppliedDetails.forEach((job) => {
//       if (!job.department || !job.department.name) {
//         // Handle cases where department details are missing
//         return;
//       }

//       const departmentName = job.department.name;
//       if (job.interviewDetails) {
//         if (job.interviewDetails.interviewerId.equals(req.Id)) {
//           job.hrIsInterviewer = "yes";
//         } else {
//           job.hrIsInterviewer = "no";
//         }
//       }

//       // console.log(job.hrIsInterviewer);

//       if (!departmentData[departmentName]) {
//         departmentData[departmentName] = [];
//       }
//       departmentData[departmentName].push(job);
//     });

    
//     // Convert grouped data into an array format
//     /**
//      * const jobAppliedByDepartment = Object.keys(departmentData)
//   .sort() // Sort departments alphabetically
//   .map((departmentName) => ({
//     department: departmentName,
//     jobs: departmentData[departmentName].sort(
//       (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//     ), // Sort jobs within each department by createdAt (latest first)
//   }));

//      */


//  // Sort the jobs within each department by createdAt (descending)
//  const jobAppliedByDepartment = Object.keys(departmentData)
//  .map((departmentName) => ({
//    department: departmentName,
//    jobs: departmentData[departmentName]
//    .filter(job => job.createdAt) // Ensure createdAt exists
//    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), // Sort jobs within each department by createdAt
//  }));


//  // for loop on google sheet and update the status //
// //  for (const department of jobAppliedByDepartment) {
// //   for (const job of department.jobs) {
// //     if (job.createdAt) { // Ensure createdBy exists before updating
// //       await jobFormDate(job);
// //     }
// //   }
// // }


// // --------- loop over sheet ---------- // 

//     success(res, "All job Applied Form details", jobAppliedByDepartment);
//   } catch (error) {
//     console.error(error);
//     unknownError(res, error);
//   }
// }

// get all job applied form by hrms new //
async function getAllJobApplied(req, res) {
  try {
    let jobAppliedDetails = await jobApplyFormModel.aggregate([
      {
        $match: { status: "active", jobFormType: "request" },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0,
                name: 1,
              },
            },
          ],
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
          pipeline: [
            {
              $project: {
                _id: 0,
                name: 1,
              },
            },
          ],
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
          localField: "employeUniqueId",
          foreignField: "employeUniqueId",
          pipeline: [
            {
              $project: {
                _id: 0,
                employeName: 1,
              },
            },
          ],
          as: "employees",
        },
      },
      {
        $unwind: {
          path: "$employees",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "managerID",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0,
                employeName: 1,
              },
            },
          ],
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
          from: "interviewdetails",
          localField: "_id",
          foreignField: "jobApplyFormId",
          as: "interviewDetails",
        },
      },
      {
        $unwind: {
          path: "$interviewDetails",
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
          pipeline: [
            {
              $project: {
                _id: 0,
                employeName: 1,
              },
            },
          ],
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
          feedbackByHr: 1,
          department: 1,
          branches: 1,
          employees: 1,
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
    ]);

    // Group by department name and mark interviewer status
    let departmentData = {};
    jobAppliedDetails.forEach((job) => {
      if (!job.department || !job.department.name) return;

      const departmentName = job.department.name;
      if (job.interviewDetails) {
        job.hrIsInterviewer =
          job.interviewDetails.interviewerId?.toString() === req.Id?.toString()
            ? "yes"
            : "no";
      }

      if (!departmentData[departmentName]) {
        departmentData[departmentName] = [];
      }
      departmentData[departmentName].push(job);
    });

    // Format final response by sorting jobs in each department
    const jobAppliedByDepartment = Object.keys(departmentData).map(
      (departmentName) => ({
        department: departmentName,
        jobs: departmentData[departmentName]
          .filter((job) => job.createdAt)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
      })
    );

    success(res, "All job Applied Form details", jobAppliedByDepartment);
  } catch (error) {
    console.error("Error in getAllJobApplied:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}



async function getJobAppliedDates(req, res) {
  try {
    // Fetch only the createdAt field from jobApplyFormModel
    let jobAppliedDetails = await jobApplyFormModel.find({}, { createdAt: 1 });

    // Loop through the data and send it to Google Sheet via jobFormDate function
    for (const job of jobAppliedDetails) {
      if (job.createdAt) { // Ensure createdAt exists before updating
        await jobFormDate(job);
      }
    }


    success(res, "Job applied dates sent successfully", jobAppliedDetails);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}


// ------------------HRMS View recrtitment pipeline candidate jobApplyForm ---------------------------------------

async function getJobFormForRecruitment(req, res) {
  try {
    let jobAppliedDetails = await jobApplyFormModel.aggregate([
      {
        $match: {
          status: {
            $in: [
              "inProgress",
              "shortlisted",
              "managerReview",
              "shortlistedBYManager",
              "joined",
              "onBoarded",
            ],
          },
        },
      },
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
          from: "employees",
          localField: "employeUniqueId",
          foreignField: "employeUniqueId",
          as: "employees",
        },
      },
      { $unwind: { path: "$employees", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "employees",
          localField: "managerID",
          foreignField: "_id",
          as: "manager",
        },
      },
      { $unwind: { path: "$manager", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "newbranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branches",
        },
      },
      { $unwind: { path: "$branches", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          jobFormType: { $first: "$jobFormType" },
          createdAt: { $first: "$createdAt" },
          candidateUniqueId: { $first: "$candidateUniqueId" },
          name: { $first: "$name" },
          mobileNumber: { $first: "$mobileNumber" },
          emailId: { $first: "$emailId" },
          highestQualification: { $first: "$highestQualification" },
          university: { $first: "$university" },
          graduationYear: { $first: "$graduationYear" },
          cgpa: { $first: "$cgpa" },
          address: { $first: "$address" },
          state: { $first: "$state" },
          city: { $first: "$city" },
          pincode: { $first: "$pincode" },
          skills: { $first: "$skills" },
          resume: { $first: "$resume" },
          finCooperOfferLetter: { $first: "$finCooperOfferLetter" },
          pathofferLetterFinCooper: { $first: "$pathofferLetterFinCooper" },
          preferedInterviewMode: { $first: "$preferedInterviewMode" },
          position: { $first: "$position" },
          knewaboutJobPostFrom: { $first: "$knewaboutJobPostFrom" },
          currentDesignation: { $first: "$currentDesignation" },
          startDate: { $first: "$startDate" },
          endDate: { $first: "$endDate" },
          reasonLeaving: { $first: "$reasonLeaving" },
          totalExperience: { $first: "$totalExperience" },
          currentCTC: { $first: "$currentCTC" },
          currentLocation: { $first: "$currentLocation" },
          gapIfAny: { $first: "$gapIfAny" },
          status: { $first: "$status" },
          resumeShortlisted: { $first: "$resumeShortlisted" },
          docVerification: { $first: "$docVerification" },
          interviewSchedule: { $first: "$interviewSchedule" },
          postOffer: { $first: "$postOffer" },
          preOffer: { $first: "$preOffer" },
          sendOfferLetterToCandidate: { $first: "$sendOfferLetterToCandidate" },
          department: { $first: "$department" },
          employees: { $first: "$employees" },
          manager: { $first: "$manager" },
          branches: { $first: "$branches" },
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
          candidateUniqueId: 1,
          jobFormType: 1,
          name: {
            $concat: [
              { $toUpper: { $substr: ["$name", 0, 1] } },
              { $substr: ["$name", 1, { $strLenCP: "$name" }] },
            ],
          },
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
          finCooperOfferLetter: 1,
          pathofferLetterFinCooper: 1,
          preferedInterviewMode: 1,
          position: 1,
          knewaboutJobPostFrom: 1,
          currentDesignation: 1,
          startDate: 1,
          endDate: 1,
          reasonLeaving: 1,
          totalExperience: 1,
          currentCTC: 1,
          currentLocation: 1,
          gapIfAny: 1,
          status: 1,
          resumeShortlisted: 1,
          docVerification: 1,
          interviewSchedule: 1,
          postOffer: 1,
          preOffer: 1,
          sendOfferLetterToCandidate: 1,
          department: { _id: 1, name: 1 },
          employees: { _id: 1, employeName: 1, employeUniqueId: 1 },
          manager: { _id: 1, employeName: 1, employeUniqueId: 1 },
          branches: { _id: 1, name: 1 },
        },
      },
    ]);

    // let departmentData = {};
    // // Group jobs by department
    // jobAppliedDetails.forEach((job) => {
    //   if (!departmentData[job.department.departmentName]) {
    //     departmentData[job.department.departmentName] = [];
    //   }
    //   departmentData[job.department.departmentName].push(job);
    // });

    // // Convert grouped data into an array format
    // let departments = Object.keys(departmentData);
    // let jobAppliedByDepartment = departments.map((department) => ({
    //   department: department,
    //   jobs: departmentData[department],
    // }));
    console.log(jobAppliedDetails.length);
    success(res, "All job Applied Form details", jobAppliedDetails);
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------HRMS jobApplyForm "hold" or "approve"  or "reject" updated---------------------------------------

async function jobApplyFormStatusChange(req, res) {
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
      const reason = req.body.reason;
      const candidateDetails = await jobApplyFormModel.findById(id);

      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }

      if (candidateDetails.status === "active" && status === "reject") {
        const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
          { _id: id },
          {
            status: "reject",
            resumeShortlisted: "notshortlisted",
            managerRevertReason: reason,
          },
          { new: true }
        );
        success(res, "Job form status updated to reject", jobApplyFormStatus);
      } else if (candidateDetails.status === "active" && status === "hold") {
        const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
          { _id: id },
          {
            status: "hold",
            resumeShortlisted: "hold",
            managerRevertReason: reason,
          },
          { new: true }
        );
        success(res, "Job form status updated to hold", jobApplyFormStatus);
      } else if (status == "hold") {
        const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
          { _id: id },
          { status: "hold", managerRevertReason: reason },
          { new: true }
        );
        success(res, "Job form status updated to hold", jobApplyFormStatus);
      } else if (status == "shortlisted") {
        const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
          { _id: id },
          {
            status: "shortlisted",
            resumeShortlisted: "hold",
            managerRevertReason: reason,
          },
          { new: true }
        );
        success(res, "Job form shortlisted", jobApplyFormStatus);
      } else if (status == "reject") {
        const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
          { _id: id },
          {
            status: "reject",
            resumeShortlisted: "notshortlisted",
            managerRevertReason: reason,
          },
          { new: true }
        );
        success(res, "Job form rejected", jobApplyFormStatus);
      } else if (status == "managerReview") {
        const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
          { _id: id },
          { status: "managerReview", managerRevertReason: reason },
          // { resumeShortlisted: "shortlisted" },
          { new: true }
        );
        success(
          res,
          "Job form status updated to managerReview",
          jobApplyFormStatus
        );
      } else if (status == "shortlistedBYManager") {
        const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
          { _id: id },
          {
            status: "shortlistedBYManager",
            resumeShortlisted: "shortlisted",
            managerRevertReason: reason,
          },
          { new: true }
        );
        success(
          res,
          "Job form status updated to shortlistedBYManager",
          jobApplyFormStatus
        );
      } else {
        return badRequest(
          res,
          "Status must be either 'hold','shortlisted','managerReview' ,'shortlistedBYManager'or 'reject'"
        );
      }
    }
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------HRMS jobApplyForm send to manager for review---------------------------------------

async function jobApplySendToManager(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    // const managerExists = await employeModel.findOne({
    //   _id: new ObjectId(req.body.managerID),
    // });
    const managerExists = await employeModel.findById(req.body.managerID);

    if (!managerExists) {
      return notFound(res, "Invalid managerID provided.");
    }

    const ids = req.body.ids; // Array of job application IDs
    const managerID = req.body.managerID; // Array of job application IDs
    const status = req.body.status; // Single status value to be applied to all IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return badRequest(res, "IDs should be a non-empty array");
    }

    if (
      !status ||
      ![
        "hold",
        "shortlisted",
        "reject",
        "inProgress",
        "managerReview",
        "shortlistedBYManager",
      ].includes(status)
    ) {
      return badRequest(
        res,
        "Status must be either 'hold', 'shortlisted','inProgress','managerReview','shortlistedBYManager' or 'reject'"
      );
    }

    // Validate each ID
    for (const id of ids) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, `Invalid ID: ${id}`);
      }
    }
    // Update all job applications with the given status
    const updatedForms = await jobApplyFormModel.updateMany(
      { _id: { $in: ids } },
      { status, managerID },
      { new: true }
    );

    if (updatedForms.modifiedCount > 0) {
      // Fetch updated forms to return
      const updatedJobForms = await jobApplyFormModel.find({
        _id: { $in: ids },
      });
      return success(res, `Job forms updated to '${status}'`, updatedJobForms);
    } else {
      return badRequest(res, "No job forms were updated");
    }
  } catch (error) {
    unknownError(res, error);
  }
}
// ------------------HRMS get jobApplyForm which are  send to manager for review ---------------------------------------

async function getjobApplyManagerReview(req, res) {
  try {
    let jobAppliedDetails = await jobApplyFormModel.find({
      managerID: req.body.managerID,
    });
    // console.log(jobAppliedDetails);
    let departmentData = {};
    jobAppliedDetails.forEach((job) => {
      if (!departmentData[job.department]) {
        departmentData[job.department] = [];
      }
      departmentData[job.department].push(job);
    });

    // Convert grouped data into an array format
    let departments = Object.keys(departmentData);
    let jobAppliedByDepartment = departments.map((department) => ({
      department: department,
      jobs: departmentData[department],
    }));
    success(
      res,
      "All job Applied Form details for manager",
      jobAppliedByDepartment
    );
  } catch (error) {
    unknownError(res, error);
  }
}
// ------------------HRMS jobApplyForm "hold" or "approve"  or "reject" updated---------------------------------------

async function jobApplyBulkStatusChange(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const ids = req.body.ids; // Array of job application IDs
    const status = req.body.status; // Single status value to be applied to all IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return badRequest(res, "IDs should be a non-empty array");
    }

    if (
      !status ||
      ![
        "hold",
        "shortlisted",
        "reject",
        // "inProgress",
        // "managerReview",
        "shortlistedBYManager",
      ].includes(status)
    ) {
      return badRequest(
        res,
        "Status must be either 'hold', 'shortlisted','shortlistedBYManager' or 'reject'"
      );
    }

    // Validate each ID
    for (const id of ids) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, `Invalid ID: ${id}`);
      }
    }
    // Update all job applications with the given status
    const updatedForms = await jobApplyFormModel.updateMany(
      { _id: { $in: ids } },
      { status },
      { new: true }
    );

    if (updatedForms.modifiedCount > 0) {
      // Fetch updated forms to return
      const updatedJobForms = await jobApplyFormModel.find({
        _id: { $in: ids },
      });
      return success(res, `Job forms updated to '${status}'`, updatedJobForms);
    } else {
      return badRequest(res, "No job forms were updated");
    }
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------HRMS jobApplyForm get form after status updated ---------------------------------------

async function getJobFormFilter(req, res) {
  try {
    let jobAppliedFiltered = await jobApplyFormModel
      .find({
        status: req.query.status
      })
      .populate({
        path: "managerID",
        options: {
          retainNullValues: true, // Retain null interviewerId
        },
      })
      .populate({
        path: "avablityStatus",
        options: {
          retainNullValues: true, // Retain null interviewerId
        },
      })
    let count = jobAppliedFiltered.length;
    // console.log(parseJwt(req.headers.token));
    success(res, "Filtered job applied forms", {
      count: count, // Add count
      data: jobAppliedFiltered, // Send the filtered data
    });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

async function getJobFormFilterMangerReview(req, res) {
  try {
    const ManagerId = req.Id;
    let jobAppliedFiltered = await jobApplyFormModel
      .find({
        status: req.query.status,
        managerID:ManagerId
      })
      .populate({
        path: "managerID",
        options: {
          retainNullValues: true, // Retain null interviewerId
        },
      })
      .populate({
        path: "avablityStatus",
        options: {
          retainNullValues: true, // Retain null interviewerId
        },
      })
    let count = jobAppliedFiltered.length;
    // console.log(parseJwt(req.headers.token));
    success(res, "Filtered job applied forms", {
      count: count, // Add count
      data: jobAppliedFiltered, // Send the filtered data
    });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// async function getJobFormFilter(req, res) {
//   try {
//     const SUPER_ADMIN_ID = "673f35beb7b6d5e5cfdbe659";

//     // Build the filter object
//     let filter = {
//       status: req.query.status,
//     };


//     // If user is not super admin, apply managerID filter
//     if (req.Id !== SUPER_ADMIN_ID) {
//       filter.managerID = req.Id;
//     }

//     const jobAppliedFiltered = await jobApplyFormModel
//       .find(filter)
//       .populate({
//         path: "managerID",
//         options: { retainNullValues: true },
//       })
//       .populate({
//         path: "avablityStatus",
//         options: { retainNullValues: true },
//       });

//     success(res, "Filtered job applied forms", {
//       count: jobAppliedFiltered.length,
//       data: jobAppliedFiltered,
//     });

//   } catch (error) {
//     console.error(error);
//     unknownError(res, error);
//   }
// }



// check Shortlisted and reject and hold and managerReview and shortlistedBYManager //

async function getJobFormFilterStatus(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const managerID = req.Id; // Extract managerID from the request
    console.log(managerID);
    if (!managerID) {
      return badRequest(res, "Manager ID is required");
    }
    const { status } = req.query;

    if (!status) {
      return badRequest(res, "status are required");
    }

    const result = await jobApplyFormModel.aggregate([
      {
        $match: {
          status: status,
          managerID: new mongoose.Types.ObjectId(managerID),
        },
      },
      {
        $lookup: {
          from: "employees", // collection name of managers (adjust if different)
          localField: "managerID",
          foreignField: "_id",
          as: "managerInfo",
        },
      },
      {
        $unwind: {
          path: "$managerInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
           $sort:{
            updatedAt:-1 // Sort by createdAt in descending order (latest first)
           }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          position:1,
          status: 1,
          createdAt: 1,
          managerID: 1,
          managerName: "$managerInfo.employeName", // assuming 'name' exists in manager schema
          skills: 1,
        },
      },
    ]);

    success(res, `Job forms with status '${status}'`, {
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

// ------------------HRMS jobApplyForm manager review show data ---------------------------------------

async function getJobFormSendManagerReview(req, res) {
  try {
    const loginUser = parseJwt(req.headers.token);
    let jobApplied = await jobApplyFormModel.find({
      managerID: loginUser.Id,
      status: "managerReview",
    });

    let count = jobApplied.length;

    // {_id:ObjectId('6685521a2661f329c93d55fd')}
    success(res, "send to manager job applied forms", {
      count: count, // Add count
      data: jobApplied, // Send the filtered data
    });
  } catch (error) {
    unknownError(res, error);
  }
}
// ------------------HRMS jobApplyForm Send mail to candidate regarding appllication viewed ----------------------------------

async function sendApplicationViewedMail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const id = req.body.jobFormId;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }

      const candidate = await jobApplyFormModel.findById({ _id: id });
      if (candidate.resumeShortlisted === "shortlisted") {
        return res.status(404).json({
          errorName: "notFound",
          message: "Mail already send to candidate",
        });
      }

      const toEmails = candidate.emailId;
      const ccEmails = process.env.HR3_EMAIL;
      const baseURL = process.env.BASE_URL;
      const company = "Fin Coopers";

      const msg = ` <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
    </div>
    <div>
      <p style="font-size: 16px; color: #333;">Dear ${candidate.name},</p>

      <p style="font-size: 16px; color: #333;">
        Thank you for your interest in the ${candidate.position} position at Fin Coopers. We wanted to let you know that our hiring team has reviewed your application.
      </p>

      <p style="font-size: 16px; color: #333;">
        We will contact you shortly if we decide to move forward with your application for the next stage of the hiring process.
      </p>

      <p style="font-size: 16px; color: #333;">
        Thank you once again for your interest in joining our team.
      </p>

      <p style="font-size: 16px;color: #333;">
        Best regards,<br>
        HR Department<br>
        <a href="mailto:hr@fincoopers.com" style=" color: #333;text-decoration: none;">hr@fincoopers.com</a>
      </p>
    </div>
  </div>
</div>
`;

      hrmsSendEmail(toEmails, ccEmails, "Application Viewed", msg, "");
      //add entry in interview model
      let interviewData = await interviewDetailsModel.findOne({
        jobApplyFormId: id,
      });

      // const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
      //   { _id: id },
      //   {
      //     resumeShortlisted: "shortlisted",
      //   },
      //   { new: true }
      // );
      // }
      // Log the email in the mailsToCandidatesModel
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Application Viewed",
        body: msg,
        jobApplyFormId: id,
      });
      await mailData.save();

      success(res, "Mail send to candidate", "");
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------HRMS jobApplyForm Send mail to interviewer regarding interview ---------------------------------------

async function sendMailToInterviewer(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const id = req.body.candidateId;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }

      const candidate = await jobApplyFormModel.findById({ _id: id });
      if (candidate.status === "inProgress") {
        return res.status(404).json({
          errorName: "notFound",
          message: "Mail already send to candidate",
        });
      }

      const interviewer = await employeModel.findById(req.body.interviewerId);
      const toEmails = candidate.emailId;
      const ccEmails = interviewer.workEmail;
      const baseURL = process.env.BASE_URL;
      const company = "Fin Coopers";
      const location = req.body.location
        ? req.body.location
        : "Fin Coopers";
      // console.log(candidate);
      // create google meet link
      let interviewDetails;
      let meetLink;
      if (req.body.mode === "online") {
        meetLink = await createGoogleMeetLink(
          req.body.interviewDate,
          req.body.interviewTime,
          candidate.emailId,
          candidate.name,
          candidate.position,
          company,
          interviewer.employeName
        );

        interviewDetails = `<strong>Google Meet Link:</strong> <a href=${meetLink} style="color: #1a73e8;">Link</a><br>`;
      } else if (req.body.mode === "offline") {
        interviewDetails = `<strong>Location:</strong> ${location}<br>`;
      }
      //   applicant coaaplicant guranter document upload
      // date,time,candidateEmail,candidateName,jobTitle,companyName,interviewerName 310121
      const msg = `<table style="width: 100%; max-width: 600px; margin: auto; border-collapse: collapse; background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd;">
        <tr>
            <td style="padding: 20px; text-align: left;">
                <p style="color: #555;">Dear ${candidate.name},</p>
                <p style="color: #555;">
                    Thank you for your interest in the <strong>${candidate.position}</strong> position at <strong>Fin Coopers</strong>. We are excited to inform you that we have scheduled your interview and look forward to discussing how your background can contribute to our team's success.
                </p>
               <p style="color: #555;">
                    <strong>Please find the interview details below:</strong>
                </p>
               
                 <p style="color: #555;">
                    <strong>Date:</strong> ${req.body.interviewDate}<br>
                    <strong>Time:</strong> ${req.body.interviewTime} <br>
                    ${interviewDetails}
                    <strong>Interviewer:</strong> ${interviewer.employeName}, Payal
                </p>

                <p style="color: #555;">
                   Kindly confirm your availability for the above-mentioned date and time by the end of the day. Should you have any questions or need further clarification, do not hesitate to reach out to us.
                </p>

                <p style="color: #555;">
                     We are eager to continue our conversation and explore how your skills and experiences align with the mission and goals of <strong>Fin Coopers</strong>.
                </p>
                
                <p style="color: #555;">
                   Thank you once again for considering a career with us. We appreciate your time and interest in joining our team.
                </p>

                <p style="color: #555;">
                    Best regards,<br>
                    HR Department<br>
                    hr@fincoopers.com
                </p>
            </td>
        </tr>
    </table>`;

      hrmsSendEmail(
        toEmails,
        ccEmails,
        "Invitation: Interview Schedule at Fin Coopers",
        msg,
        ""
      );
      //add entry in interview model
      let interviewData = await interviewDetailsModel.findOne({
        jobApplyFormId: id,
        interviewBy: "interviewer",
      });
      let interviewDetailsData = await interviewDetailsModel.findByIdAndUpdate(
        { _id: interviewData._id },
        {
          googleLink: meetLink,
          interviewEventCreated: "created",
        },
        { new: true }
      );
      // console.log(interviewDetailsData)
      // let candidateData = await jobApplyFormModel.find({
      //   _id: id,
      // });
      // if (candidateData.status== "shortlisted") {
      //updating candidate status
      const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
        { _id: id },
        {
          status: "inProgress",
          interviewSchedule: "scheduled",
          resumeShortlisted: "shortlisted",
        },
        { new: true }
      );
      // }
      // Log the email in the mailsToCandidatesModel
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Invitation: Interview Schedule at Fin Coopers",
        body: msg,
        jobApplyFormId: id,
      });
      await mailData.save();

      success(res, "Mail send to candidate", "");
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------HRMS jobApplyForm Send mail to interviewer regarding interview ---------------------------------------

async function sendDirectMailInterviewer(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const id = req.body.candidateId;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      const candidate = await jobApplyFormModel.findById({ _id: id });
      if (candidate.status === "inProgress") {
        return res.status(404).json({
          errorName: "notFound",
          message: "Mail already send to candidate",
        });
      }

      //get interviewer details through token
      const managerExists = await employeModel.findById(req.Id);
      const toEmails = candidate.emailId;
      const ccEmails = managerExists.workEmail;
      const baseURL = process.env.BASE_URL;
      const company = "Fin Coopers";
      const location = req.body.location
        ? req.body.location
        : "Fin Coopers";
      let meetLink;
      // console.log(candidate);
      // create google meet link
      let interviewDetails;
      if (req.body.mode === "online") {
        meetLink = await createGoogleMeetLink(
          req.body.interviewDate,
          req.body.interviewTime,
          candidate.emailId,
          candidate.name,
          candidate.position,
          company,
          req.body.interviewer,
          ccEmails
        );

        interviewDetails = `<strong>Google Meet Link:</strong> <a href=${meetLink} style="color: #1a73e8;">Link</a><br>`;
      } else if (req.body.mode === "offline") {
        interviewDetails = `<strong>Location:</strong> ${location}<br>`;
      } else {
        return badRequest(res, "Mode must be online or offline");
      }

      // date,time,candidateEmail,candidateName,jobTitle,companyName,interviewerName
      const msg = `<table style="width: 100%; max-width: 600px; margin: auto; border-collapse: collapse; background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd;">
        <tr>
            <td style="padding: 20px; text-align: left;">
                <p style="color: #555;">Dear ${candidate.name},</p>
                <p style="color: #555;">
                    Thank you for your interest in the <strong>${candidate.position}</strong> position at <strong>Fin Coopers</strong>. We are excited to inform you that we have scheduled your interview and look forward to discussing how your background can contribute to our team's success.
                </p>
               <p style="color: #555;">
                    <strong>Please find the interview details below:</strong>
                </p>
               
                 <p style="color: #555;">
                    <strong>Date:</strong> ${req.body.interviewDate}<br>
                    <strong>Time:</strong> ${req.body.interviewTime} <br>
                    ${interviewDetails}
                    <strong>Interviewer:</strong> ${managerExists.employeName}, Payal
                </p>

                <p style="color: #555;">
                   Kindly confirm your availability for the above-mentioned date and time by the end of the day. Should you have any questions or need further clarification, do not hesitate to reach out to us.
                </p>

                <p style="color: #555;">
                     We are eager to continue our conversation and explore how your skills and experiences align with the mission and goals of <strong>Fin Coopers</strong>.
                </p>
                
                <p style="color: #555;">
                   Thank you once again for considering a career with us. We appreciate your time and interest in joining our team.
                </p>

                <p style="color: #555;">
                    Best regards,<br>
                    HR Department<br>
                    hr@fincoopers.com
                </p>
            </td>
        </tr>
    </table>`;

      hrmsSendEmail(
        toEmails,
        ccEmails,
        "Invitation: Interview Schedule at Fin Coopers",
        msg,
        ""
      );

      // let candidateData = await jobApplyFormModel.find({
      //   _id: id,
      // });

      //add entry in interview model
      const interviewDetailsData = await interviewDetailsModel.create({
        interviewDate: req.body.interviewDate,
        interviewTime: req.body.interviewTime,
        mode: req.body.mode,
        location: location,
        googleLink: meetLink,
        interviewerId: req.Id,
        jobApplyFormId: req.body.candidateId,
        availability: "available",
        interviewEventCreated: "created",
        interviewBy: "interviewer",
        // alternateInterviewerId: [req.Id], // Add interviewerId to alternateInterviewerId array
      });
      // console.log(interviewDetailsData);

      // updating candidate status
      const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
        { _id: id },
        {
          status: "inProgress",
          interviewSchedule: "scheduled",
          resumeShortlisted: "shortlisted",
        },
        { new: true }
      );

      // Log the email in the mailsToCandidatesModel
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Invitation: Interview Schedule at Fin Coopers",
        body: msg,
        jobApplyFormId: id,
      });
      await mailData.save();

      success(res, "Mail send to candidate", interviewDetailsData);
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------HRMS jobApplyForm Send mail to recommended by regarding interview ---------------------------------------

async function sendMailToRecommendedBy(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    } else {
      const id = req.body.candidateId;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }

      const candidate = await jobApplyFormModel.findById({ _id: id });
      if (candidate.hrInterviewSchedule === "active" && candidate.feedbackByHr === "active") {
        return badRequest(res, "Cannot schedule interview for this candidate as it was not approved by reporting manager");
      }

      if (candidate.status !== "reject" && candidate.status !== "hold") {
        return badRequest(res, "Cannot schedule interview for this candidate as it is not rejected");
      }
      const interviewer = await employeModel.findById(candidate.recommendedByID);
      // console.log(interviewer);
      const toEmails = candidate.emailId;
      const ccEmails = [interviewer.workEmail,process.env.HR3_EMAIL];
      const baseURL = process.env.BASE_URL;
      const company = "Fin Coopers";
      const location = req.body.location
        ? req.body.location
        : "Fin Coopers";
      // console.log(candidate);
      // create google meet link
      let interviewDetails;
      let meetLink;
      if (req.body.mode === "online") {
        meetLink = await createGoogleMeetLink(
          req.body.interviewDate,
          req.body.interviewTime,
          candidate.emailId,
          candidate.name,
          candidate.position,
          company,
          interviewer.employeName
        );

        interviewDetails = `<strong>Google Meet Link:</strong> <a href=${meetLink} style="color: #1a73e8;">Link</a><br>`;
      } else if (req.body.mode === "offline") {
        interviewDetails = `<strong>Location:</strong> ${location}<br>`;
      }
      //   applicant coaaplicant guranter document upload
      // date,time,candidateEmail,candidateName,jobTitle,companyName,interviewerName 310121
      const msg = `<table style="width: 100%; max-width: 600px; margin: auto; border-collapse: collapse; background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd;">
        <tr>
            <td style="padding: 20px; text-align: left;">
                <p style="color: #555;">Dear ${candidate.name},</p>
                <p style="color: #555;">
                    We are pleased to inform you that an interview has been scheduled as part of your application process. Below are the details:
                 </p>
                </p>
               <p style="color: #555;">
                    <strong>Please find the interview details below:</strong>
                </p>
               
                 <p style="color: #555;">
                    <strong>Date:</strong> ${req.body.interviewDate}<br>
                    <strong>Time:</strong> ${req.body.interviewTime} <br>
                    ${interviewDetails}
                    <strong>Interviewer:</strong> ${interviewer.employeName}, Payal
                </p>

                <p style="color: #555;">
                     The interview will be conducted by the person who recommended you. Please ensure you are well-prepared and feel free to reach out if you have any questions.
                </p>

                <p style="color: #555;">
                   We look forward to your participation in the interview process.
                </p>
                
                <p style="color: #555;">
                    Best regards,<br>
                    HR Department<br>
                    hr@fincoopers.com
                </p>
            </td>
        </tr>
    </table>`;

      hrmsSendEmail(
        toEmails,
        ccEmails,
        "Invitation: Interview Schedule at Fin Coopers",
        msg,
        ""
      );
      //add entry in interview model
      const interviewDetailsData = await interviewDetailsModel.create({
        interviewDate: req.body.interviewDate,
        interviewTime: req.body.interviewTime,
        mode: req.body.mode,
        location: location,
        googleLink: meetLink,
        interviewerId: interviewer._id,
        jobApplyFormId: id,
        availability: "available",
        interviewEventCreated: "created",
        interviewBy: "interviewer",
        // alternateInterviewerId: [req.Id], // Add interviewerId to alternateInterviewerId array
      });
      
      // console.log(interviewDetailsData)
      // let candidateData = await jobApplyFormModel.find({
      //   _id: id,
      // });
      // if (candidateData.status== "shortlisted") {
      //updating candidate status
      const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
        { _id: id },
        {
          status: "inProgress",
          interviewSchedule: "scheduled",
          candidateStatus:"reconsidered",
        },
        { new: true }
      );
      // }
      // Log the email in the mailsToCandidatesModel
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Invitation: Interview Schedule at Fin Coopers",
        body: msg,
        jobApplyFormId: id,
      });
      await mailData.save();

      success(res, "Interview scheduled successfully", "");
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------HRMS jobApplyForm interviewer add ---------------------------------------
async function addInterviewer(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let fieldsToProcess = ["name", "emailId"];
    fieldsToProcess.forEach((field) => {
      if (req.body[field]) {
        req.body[field] = req.body[field].trim();
      }
    });

    const interviewerData = await interviewerModel.create(req.body);

    success(res, "Interviewer Data Added Successfully", interviewerData);
  } catch (error) {
    unknownError(res, error);
  }
}
// ------------------HRMS jobApplyForm interviewer get ---------------------------------------

async function getInterviewer(req, res) {
  try {
    let interviewerDetails = await interviewerModel.find({
      status: "active",
    });
    success(res, "All Interviewer details", interviewerDetails);
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------HRMS jobApplyForm interviewer availability ---------------------------------------

async function addInterviewerAvailability(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const id = req.body.jobApplyFormId;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, "Invalid ID");
    }

    const candidate = await jobApplyFormModel.findById({ _id: id });
    if (
      candidate.feedbackByHr === "active" ||
      candidate.feedbackByHr === "notAdded"
    ) {
      return badRequest(res, "Cannot add availability without hr feedbaack");
    }

    if (
      candidate.status === "active" ||
      candidate.status === "shortlistedBYManager"
    ) {
      if (candidate.interviewSchedule === "active") {
        // const interviewDetails = await interviewDetailsModel.create(req.body);
        const interviewDetails = await interviewDetailsModel.create({
          ...req.body,
          interviewEventCreated: "notCreated",
          interviewBy: "interviewer",
          // alternateInterviewerId: [req.body.interviewerId], // Add interviewerId to alternateInterviewerId array
        });
        const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
          { _id: id },
          {
            interviewSchedule: "confirmation",
            resumeShortlisted: "shortlisted",
          },
          { new: true }
        );
        success(res, "Interview Details Successfully Added", interviewDetails);
      } else {
        return res.status(404).json({
          errorName: "notFound",
          message: "Interview event is already added",
        });
      }
    } else {
      return res.status(404).json({
        errorName: "notFound",
        message: "Cannot schedule interview",
      });
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------HRMS jobApplyForm interviewer availability update ---------------------------------------
async function getInterviewById(req, res) {
  try {
    const interviewerId = req.query.Id;

    let interviewDetails = await interviewDetailsModel
      .findById({ _id: interviewerId })
      .populate("jobApplyFormId")
      .populate("interviewerId");
    success(res, "Interviewer details for manager", interviewDetails);
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------HRMS jobApplyForm interviewer availability for interviewer schedule interview ---------------------------------------

async function getInterviewDataById(req, res) {
  try {
    const managerId = req.Id;

    let interviewDetails = await interviewDetailsModel
      .find({
        status: "active",
        interviewerId: new ObjectId(managerId),
        availability: "available",
        interviewEventCreated: "created",
        interviewStatus: { $in: ["active", "done"] },
      })
      .populate("jobApplyFormId")
      .populate("interviewerId")
      .sort({ createdAt: -1 });
    success(res, "Interviewer details for interviewer", interviewDetails);
  } catch (error) {
    unknownError(res, error);
  }
}
// ------------------HRMS jobApplyForm interviewer availability for interviewer schedule interview ---------------------------------------

async function getCanceledInterviewDataById(req, res) {
  try {
    const managerId = req.Id;
    console.log(managerId);

    // Fetch interview details with population
    let interviewDetails = await interviewDetailsModel
      .find({
        status: "active",
        interviewerId: new ObjectId(managerId),
        interviewStatus: "cancelled",
      })
      .populate({
        path: "jobApplyFormId", // Populate jobApplyFormId
        match: { jobFormType: "request" }, // Filter populated data
      })
      .populate({ path: "interviewerId", select: "employeName" });

    // Filter out documents where jobApplyFormId is null after the populate
    interviewDetails = interviewDetails.filter(
      (detail) => detail.jobApplyFormId !== null
    );

    success(res, "Interviewer details for interviewer", interviewDetails);
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------HRMS jobApplyForm all cancelled interviewer for hr---------------------------------------

async function getAllCancelledInterview(req, res) {
  try {
    let interviewDetails = await interviewDetailsModel
      .find({
        status: "active",
        interviewBy: "interviewer",
        interviewStatus: "cancelled",
      })
      .populate({ path: "jobApplyFormId", select: "name position resume " })
      .populate({ path: "interviewerId", select: "employeName" });
    success(res, "Interviewer details for HR", interviewDetails);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------HRMS jobApplyForm interviewer availability update ---------------------------------------

async function updateInterviewerAvailability(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const interviewDetailsId = req.body.Id; // Get the ID of the interview details to update
    if (!mongoose.Types.ObjectId.isValid(interviewDetailsId)) {
      return badRequest(res, "Invalid Interview Details ID");
    }

    // Fetch the interview details using the provided ID
    const interviewDetails = await interviewDetailsModel.findById({
      _id: interviewDetailsId,
    });

    if (!interviewDetails) {
      return res.status(404).json({
        errorName: "notFound",
        message: "Interview Details not found",
      });
    }

    const id = interviewDetails.jobApplyFormId; // Get the job apply form ID from interviewDetails

    // Update the interview details
    const updatedInterviewDetails =
      await interviewDetailsModel.findByIdAndUpdate(
        { _id: interviewDetailsId },
        {
          ...req.body,
        },
        { new: true }
      );

    const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
      { _id: id },
      { interviewSchedule: "confirmation" },
      { new: true }
    );

    success(
      res,
      "Interview Details Successfully Updated",
      updatedInterviewDetails
    );
  } catch (error) {
    // console.log(error);
    unknownError(res, error);
  }
}

// ------------------HRMS jobApplyForm interviewer get manager interviews ---------------------------------------

async function getInterviewerData(req, res) {
  try {
    const loginUser = parseJwt(req.headers.token);

    let interviewDetails = await interviewDetailsModel
      .find({
        status: "active",
        availability: "available",
        interviewerId: loginUser.Id,
        interviewBy: "interviewer",
      })
      .populate("jobApplyFormId")
      .populate("interviewerId");
    success(res, "Interviewer details for manager", interviewDetails);
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------HRMS jobApplyForm interviewer get all interviews ---------------------------------------

async function getAllInterviewerData(req, res) {
  try {
    let interviewDetails = await interviewDetailsModel
      .find({
        status: "active",
        interviewBy: "interviewer",
      })
      .populate("jobApplyFormId")
      .populate("interviewerId")
      .sort({ createdAt: -1 });

    success(res, "Interviewer details for Hr", interviewDetails);
  } catch (error) {
    unknownError(res, error);
  }
}
// ------------------HRMS  interviewer get detaills for login interviewer---------------------------------------

async function getInterviewerAvailability(req, res) {
  try {
    const managerId = req.Id;

    let interviewDetails = await interviewDetailsModel
      .find({
        status: "active",
        interviewerId: new ObjectId(managerId),
        availability: "active",
        interviewBy: "interviewer",
      })
      .populate("jobApplyFormId")
      .populate("interviewerId");
    success(res, "Interviewer details for interviewer", interviewDetails);
  } catch (error) {
    unknownError(res, error);
  }
}

// ------------------HRMS jobApplyForm interviewer availability status change ---------------------------------------

async function changeAvailabilityStatus(req, res) {
  try {
    const id = req.body.Id;
    if (!id || id.trim() === "") {
      return badRequest(res, "ID is required and cannot be empty");
    }

    const availability = req.body.availability;
    if (!availability || availability.trim() === "") {
      return badRequest(res, "Availability is required and cannot be empty");
    }

    if (availability === "available") {
      const interviewDetailsStatus =
        await interviewDetailsModel.findByIdAndUpdate(
          { _id: id },
          { availability: availability },
          { new: true }
        );
      success(res, "Availability Status Updated", interviewDetailsStatus);
    } else if (availability === "notAvailable") {
      const alternateInterviewerId = req.body.alternateInterviewerId;
      const interviewer = await employeModel.findById(alternateInterviewerId);
      const name = interviewer.employeName;
      const reason = req.body.reason;

      if (!alternateInterviewerId || !reason || reason.trim() === "") {
        return badRequest(
          res,
          "Alternate interviewer ID and reason are required"
        );
      }

      const interviewDetailsStatus =
        await interviewDetailsModel.findByIdAndUpdate(
          { _id: id },
          {
            availability: availability,
            $push: {
              alternateInterviewerId: {
                interviewerId: alternateInterviewerId,
                name: name,
                reason: reason,
              },
            },
            interviewerId: null,
          },
          { new: true }
        );
      success(res, "Availability Status Updated", interviewDetailsStatus);
    } else {
      return badRequest(
        res,
        "Status must be either 'available' or 'notAvailable'"
      );
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//--------------------------Interviewer feedback------------------------------------

async function interviewerFeedback(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // salary and joining date in job form
    const Id = req.body.jobApplyFormId;
    // console.log(Id);
    //check if feedback already exist
    const dataOfFeedback = await feedbackInterviewerModel.findOne({
      jobApplyFormId: Id,
      feedbackBy: "interviewer",
    });
    // console.log(dataOfFeedback);
    if (dataOfFeedback) {
      return badRequest(res, "Feedback for this candidate already exist");
    }
    const salary = req.body.salary;
    const joiningDate = req.body.joiningDate;
    const sendOfferLetterToCandidate = req.body.sendOfferLetterToCandidate;
    // let interviewSchedule;
    // if (req.body.interviewTaken === "yes") {
    //   interviewSchedule = "done";
    // } else {
    //   interviewSchedule = "cancelled";
    // }
    const candidateMoreDetails = await jobApplyFormModel.findOneAndUpdate(
      { _id: Id },
      {
        salary: salary,
        joiningDate: joiningDate,
        // interviewSchedule: interviewSchedule,
        interviewSchedule: "done",
        sendOfferLetterToCandidate: sendOfferLetterToCandidate,
        feedbackByInterviewer: "added",
        feedbackBy: "interviewer",
      },
      { new: true }
    );

    await interviewDetailsModel.findOneAndUpdate(
      { jobApplyFormId: Id, interviewBy: "interviewer" },
      { interviewStatus: "done" },
      { new: true }
    );
    // login user id
    const loginUser = parseJwt(req.headers.token);
    const feedbackData = {
      ...req.body,
      interviewerId: loginUser.Id,
    };

    const feedbackInterviewer = await feedbackInterviewerModel.create(
      feedbackData
    );

    success(
      res,
      "Interviewer feedback added successfully",
      feedbackInterviewer
    );
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//--------------------------Interviewer feedback------------------------------------

async function getInterviewerFeedback(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    let feedbackInterviewerDetails = await feedbackInterviewerModel.find({
      status: "active",
    });

    const jobApplyFormIds = feedbackInterviewerDetails.map(
      (feedback) => new ObjectId(feedback.jobApplyFormId)
    );
    // Fetch jobApplyFormDetails with respective feedbackInterviewerDetails populated with interviewerId
    let jobApplyFormDetails = await jobApplyFormModel.aggregate([
      {
        $match: {
          _id: { $in: jobApplyFormIds }, // Match jobApplyForm based on jobApplyFormIds array
          preOffer: { $in: ["active", "generated"] },
          status: { $in: ["inProgress", "shortlisted"] },
        },
      },
      {
        $lookup: {
          from: "feedbackinterviewers", // Collection name for feedbackInterviewerModel
          localField: "_id", // Field in jobApplyFormModel (jobApplyFormId)
          foreignField: "jobApplyFormId", // Field in feedbackInterviewerModel
          as: "feedbackInterviewerDetails", // Alias for joined data
        },
      },
      {
        $unwind: {
          path: "$feedbackInterviewerDetails", // Unwind feedbackInterviewerDetails array
          preserveNullAndEmptyArrays: true, // Include jobApplyForms with no feedbackInterviewerDetails
        },
      },
      {
        $lookup: {
          from: "employees", // Collection for user/interviewer details
          localField: "feedbackInterviewerDetails.interviewerId", // interviewerId field in feedbackInterviewerModel
          foreignField: "_id", // ID in users collection
          pipeline: [
            {
              $project: {
                _id: 0, // Exclude the _id field
                employeName: 1, // Include only the employeName field
              },
            },
          ],
          as: "interviewerDetails", // Alias for interviewer details
        },
      },
      {
        $unwind: {
          path: "$interviewerDetails", // Unwind interviewerDetails to get an object
          preserveNullAndEmptyArrays: true, // Keep jobApplyForm entries even if no interviewer is found
        },
      },
      {
        $match: {
          $or: [
            { jobFormType: { $ne: "request" } }, // Include if jobFormType is not "request"
            { "feedbackInterviewerDetails.feedbackBy": { $ne: "HR" } }, // Include if feedbackBy is not "HR"
          ],
        },
      },
      {
        $group: {
          _id: "$_id", // Group by jobApplyForm ID
          jobApplyForm: { $first: "$$ROOT" }, // Store the full jobApplyForm document
        },
      },
      {
        $sort: { "jobApplyForm.updatedAt": -1 }, // Sort by createdAt in descending order
      },
      
    ]);
    console.log(jobApplyFormDetails.length);
    success(res, "Feedback Interviewers ", jobApplyFormDetails);
  } catch (error) {
    unknownError(res, error);
  }
}
// async function getInterviewerFeedback(req, res) {
//   try {
//     let jobAppliedDetails = await jobApplyFormModel.aggregate([
//       {
//         $match: { status: "active" }, // Match only active status
//       },
//       {
//         $lookup: {
//           from: "feedbackinterviewers", // Collection name for interviewDetails
//           localField: "_id", // Field in jobApplyFormModel
//           foreignField: "jobApplyFormId", // Field in interviewDetails
//           as: "feedbackinterviewers", // Alias for the joined data
//         },
//       },
//       {
//         $unwind: {
//           path: "$feedbackinterviewers", // Unwind the interviewDetails array
//           preserveNullAndEmptyArrays: true, // Allow null values in case no match is found
//         },
//       },
//       {
//         $match: {
//           feedbackinterviewers: { $ne: null }, // Match only if hrFeedbackinterviewers is not null
//         },
//       },
//       {
//         $group: {
//           _id: "$_id", // Group by unique jobApplyForm ID
//           candidateUniqueId: { $first: "$candidateUniqueId" },
//           name: { $first: "$name" },
//           mobileNumber: { $first: "$mobileNumber" },
//           emailId: { $first: "$emailId" },
//           highestQualification: { $first: "$highestQualification" },
//           university: { $first: "$university" },
//           graduationYear: { $first: "$graduationYear" },
//           cgpa: { $first: "$cgpa" },
//           address: { $first: "$address" },
//           state: { $first: "$state" },
//           city: { $first: "$city" },
//           pincode: { $first: "$pincode" },
//           skills: { $first: "$skills" },
//           resume: { $first: "$resume" },
//           finCooperOfferLetter: { $first: "$finCooperOfferLetter" },
//           pathofferLetterFinCooper: { $first: "$pathofferLetterFinCooper" },
//           preferedInterviewMode: { $first: "$preferedInterviewMode" },
//           position: { $first: "$position" },
//           knewaboutJobPostFrom: { $first: "$knewaboutJobPostFrom" },
//           currentDesignation: { $first: "$currentDesignation" },
//           lastOrganization: { $first: "$lastOrganization" },
//           startDate: { $first: "$startDate" },
//           endDate: { $first: "$endDate" },
//           reasonLeaving: { $first: "$reasonLeaving" },
//           totalExperience: { $first: "$totalExperience" },
//           currentCTC: { $first: "$currentCTC" },
//           preferredLocation: { $first: "$preferredLocation" },
//           currentLocation: { $first: "$currentLocation" },
//           gapIfAny: { $first: "$gapIfAny" },
//           status: { $first: "$status" },
//           feedbackByHr:{$first:"$feedbackByHr"},
//           feedbackInterviewerDetails: { $first: "$feedbackinterviewers" },
//         },
//       },
//     ]);

// console.log(jobAppliedDetails.length);
//     success(res, "All job Applied Form details", jobAppliedDetails);
//   } catch (error) {
//     console.error(error);
//     unknownError(res, error);
//   }
// }
//-----------------------------------------------------------------
async function changeInterviewStatus(req, res) {
  try {
    const jobFormId = req.body.jobFormId;

    await jobApplyFormModel.findByIdAndUpdate(
      { _id: jobFormId },
      { interviewSchedule: "done" },
      { new: true }
    );

    await interviewDetailsModel.findOneAndUpdate(
      { jobApplyFormId: jobFormId, interviewBy: "interviewer" },
      { interviewStatus: "done" },
      { new: true }
    );

    success(res, "Updated interview details");
  } catch (error) {
    unknownError(res, error);
  }
}
//-----------------------------------------------------------------
async function changeHrInterviewStatus(req, res) {
  try {
    const jobFormId = req.body.jobFormId;

    await jobApplyFormModel.findByIdAndUpdate(
      { _id: jobFormId },
      { hrInterviewSchedule: "done" },
      { new: true }
    );

    await interviewDetailsModel.findOneAndUpdate(
      { jobApplyFormId: jobFormId },
      { interviewStatus: "done" },
      { new: true }
    );

    success(res, "Updated interview details");
  } catch (error) {
    unknownError(res, error);
  }
}
//---------------------------updating status of interview as it is canceled for any reason-----------------------------------------
async function canceledInterview(req, res) {
  try {
    const jobFormId = req.body.jobFormId;

    await jobApplyFormModel.findByIdAndUpdate(
      { _id: jobFormId },
      { interviewSchedule: "cancelled" },
      { new: true }
    );

    const data = await interviewDetailsModel.findOneAndUpdate(
      { jobApplyFormId: jobFormId, interviewBy: "interviewer" },
      { interviewStatus: "cancelled", reasonCancel: req.body.reason },
      { new: true }
    );
    success(res, "Updated interview details");
  } catch (error) {
    // console.log(error)
    unknownError(res, error);
  }
}
//---------------------------get data of recommended job apply from-------------------------------------------
async function getRecommendedJobApplied(req, res) {
  try {
    let recommendedJobApplied = await jobApplyFormModel
      .find({
        status: "inProgress",
        jobFormType: "recommended",
      })
      .populate({ path: "recommendedByID", select: "employeName" })
      .populate({ path: "managerID", select: "employeName" })
      .populate("departmentId")
      .populate("vacancyRequestId")
      .populate("hrInterviewDetailsId")
      .populate("branchId")
      .populate("workLocationId")
      .sort({ createdAt: -1 });

    success(res, "Recommended Job Applied", recommendedJobApplied);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// Route: /api/deactivateJobApplications
// Method: PATCH

const deactivateJobApplications = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
     return badRequest(res, "IDs must be an array and not empty.");
    }

    const result = await jobApplyFormModel.updateMany(
      { _id: { $in: ids } },
      { $set: { status: "notActive" } }
    );

    if (result.modifiedCount === 0) {
   return badRequest(res, "No job applications found with the given IDs.");
    }

   return success(res, "Job applications deactivated successfully.");
   
  } catch (error) {
    console.error("Error deactivating job applications:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};



// Re-assing to another manager //


async function reassingtoanothermanager(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const id = req.body.jobApplyFormId;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, "Invalid ID");
    }

    const candidate = await jobApplyFormModel.findById({ _id: id });
    if (candidate.status == "active") {
      return badRequest(res, "Cannot reassign this candidate as it is active");
    }

    const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
      { _id: id },
      { managerID: req.body.managerID },
      { new: true }
    );
    success(res, "Reassigned to another manager", jobApplyFormStatus);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// check availability status of interview for hr and interviewer//

async function checkAvailabilityStatus(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const id = req.body.jobApplyFormId;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, "Invalid jobApplyFormId");
    }

    const candidate = await jobApplyFormModel.findById(id);
    if (!candidate) {
      return badRequest(res, "Candidate not found");
    }

    let availabilityRecord;

    const existing = await availabilityModel.findOne({ jobformId: id });
    if (existing) {
      availabilityRecord = await availabilityModel.findOneAndUpdate(
        { jobformId: id },
        {
          ...req.body,
          interviewerId: req.Id,
        },
        { new: true }
      );
    } else {
      availabilityRecord = await availabilityModel.create({
        ...req.body,
        interviewerId: req.Id,
        jobformId: id,
      });
    }

    // ✅ Update the jobApplyForm to mark availability set
    const updatedJobForm = await jobApplyFormModel.findByIdAndUpdate(
      id,
      { setAvaialbilityStatus: "yes" ,  avablityStatus:availabilityRecord._id},  // Make sure this matches your schema field name
      { new: true }
    );

    return success(res, "Availability status updated successfully", {
      availability: availabilityRecord,
      updatedJobForm,
    });

  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}


// candidate tracking api //

async function candidatetracking(req, res) {
  try {
    // Validation check for query parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Get page and limit from query parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit;

    // Aggregate pipeline to filter records where status is not "active" or "reject"
    const aggregate = [
      {
        $match: {
          status: { $nin: ["active", "reject"] }, // Filter out active and reject statuses
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
          pipeline: [
            {
              $project: {
                _id: 0,
                name: 1,
              },
            },
          ],
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
          pipeline: [
            {
              $project: {
                _id: 0,
                name: 1,
              },
            },
          ],
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
          localField: "employeUniqueId",
          foreignField: "employeUniqueId",
          pipeline: [
            {
              $project: {
                _id: 0,
                employeName: 1,
              },
            },
          ],
          as: "employees",
        },
      },
      {
        $unwind: {
          path: "$employees",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "managerID",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0,
                employeName: 1,
              },
            },
          ],
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
          from: "availabilities", // collection to join
          localField: "avablityStatus", // field in `jobApplyForm` schema
          foreignField: "_id", // field in `availabilities` collection
          as: "managerAvailability" // alias for the joined data
        }
      },
      {
        $unwind: {
          path: "$managerAvailability",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "employees", // collection to join
          localField: "managerAvailability.interviewerId", // field in `managerAvailability` that links to `employees`
          foreignField: "_id", // field in `employees` collection
          as: "MangerInterviewName" // alias for the joined data (list of employees)
        }
      },
      {
        $unwind: {
          path: "$MangerInterviewName",
          preserveNullAndEmptyArrays: true, // Set to true if no interviewers are found
        },
      },
      {
        $lookup: {
          from: "interviewdetails",
          localField: "_id",
          foreignField: "jobApplyFormId",
          as: "interviewDetails",
        },
      },
      {
        $unwind: {
          path: "$interviewDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $lookup: {
      //     from: "feedbackinterviewers",
      //     localField: "_id",
      //     foreignField: "jobApplyFormId",
      //     as: "feedbackByHR",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$feedbackByHR",
      //     preserveNullAndEmptyArrays: true, // Include records with no HR feedback
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "feedbackinterviewers", // Join again for the interviewer feedback
      //     localField: "_id",
      //     foreignField: "jobApplyFormId",
      //     as: "feedbackByInterviewer",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$feedbackByInterviewer",
      //     preserveNullAndEmptyArrays: true, // Include records with no interviewer feedback
      //   },
      // },
      {
        $lookup: {
          from: "employees",
          localField: "hrFeedbackinterviewers.interviewerId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0,
                employeName: 1,
              },
            },
          ],
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
          // feedbackByHR: {
          //   feedbackBy: "$feedbackByHR.feedbackBy",
          //   interviewerId: "$feedbackByHR.interviewerId",
          //   interviewTaken: "$feedbackByHR.interviewTaken",
          //   furtherProcessProfile: "$feedbackByHR.furtherProcessProfile",
          //   remark: "$feedbackByHR.remark",
          //   candidateReview: "$feedbackByHR.candidateReview",
          //   skillReview: "$feedbackByHR.skillReview",
          //   hireCandidate: "$feedbackByHR.hireCandidate",
          //   note: "$feedbackByHR.note",
          //   status: "$feedbackByHR.status",
          //   createdAt: "$feedbackByHR.createdAt",
          //   updatedAt: "$feedbackByHR.updatedAt",
          // },
          // feedbackByInterviewer: {
          //   feedbackBy: "$feedbackByInterviewer.feedbackBy",
          //   interviewerId: "$feedbackByInterviewer.interviewerId",
          //   interviewTaken: "$feedbackByInterviewer.interviewTaken",
          //   furtherProcessProfile: "$feedbackByInterviewer.furtherProcessProfile",
          //   remark: "$feedbackByInterviewer.remark",
          //   candidateReview: "$feedbackByInterviewer.candidateReview",
          //   skillReview: "$feedbackByInterviewer.skillReview",
          //   hireCandidate: "$feedbackByInterviewer.hireCandidate",
          //   note: "$feedbackByInterviewer.note",
          //   status: "$feedbackByInterviewer.status",
          //   createdAt: "$feedbackByInterviewer.createdAt",
          //   updatedAt: "$feedbackByInterviewer.updatedAt",
          // },
          managerAvailability:1,
          "MangerInterviewName.employeName":1,
          setAvaialbilityStatus:1,
          managerRevertReason:1,
          feedbackByInterviewer:1,
          department: 1,
          branches: 1,
          employees: 1,
          manager: 1,
          interviewDetails: 1,
          hrFeedbackinterviewers: 1,
          hrInterviewerDetails: 1,
          candidateStatus: 1,
          isEligible: 1,
          matchPercentage: 1,
          summary: 1,
          createdAt: 1,
          preOffer:1,
          docVerification:1,
          postOffer:1,
          sendOfferLetterToCandidate:1,
          sendZohoCredentials:1,
          interviewSchedule:1,
          finCooperOfferLetter:1,
        },
      },
      {
        $skip: skip,  // Skip records based on pagination
      },
      {
        $limit: limit, // Limit the number of records per page
      },
    ];

    // Get the total count of records before pagination to calculate the total pages
    const totalCount = await jobApplyFormModel.aggregate([
      { $match: { status: { $nin: ["active", "reject"] } } },
      { $count: "total" },
    ]);

    const totalRecords = totalCount[0] ? totalCount[0].total : 0;
    const totalPages = Math.ceil(totalRecords / limit);

// Execute the aggregation pipeline
const results = await jobApplyFormModel.aggregate(aggregate);

const resultsWithFeedback = await Promise.all(results.map(async (result) => {
  // Fetch the feedback based on jobApplyFormId
  const feedback = await feedbackInterviewerModel.find({
    jobApplyFormId: result._id, // match feedback for the current jobApplyFormId
  }).sort({ feedbackBy: 1 }); // Sort feedback by 'feedbackBy' (HR first, then interviewer)

  // Separate the feedback by 'HR' and 'interviewer'
  const hrFeedback = feedback.filter(f => f.feedbackBy == 'HR');
  const interviewerFeedback = feedback.filter(f => f.feedbackBy == 'interviewer');

  // Add the sorted feedback to the result object
  result.feedback = {
    hrFeedback,
    interviewerFeedback,
  };

  return result;
}));

// Return the response with pagination info
return success(res, "Paginated candidate tracking results", {
  data: resultsWithFeedback,
  pagination: {
    totalRecords,
    totalPages,
    currentPage: page,
    perPage: limit,
  },
});

  } catch (error) {
    console.error(error);
    unknownError(res, error); // Handle unknown errors
  }
}










module.exports = {
  getJobFormsByStatus,
  getRejectedJobForms,
  jobApplyFormAdd,
  getAllJobApplied,
  getJobFormForRecruitment,
  jobApplyFormStatusChange,
  jobApplyBulkStatusChange,
  jobApplySendToManager,
  getjobApplyManagerReview,
  getJobFormFilter,
  getJobFormSendManagerReview,
  sendApplicationViewedMail,
  sendMailToInterviewer,
  sendDirectMailInterviewer,
  addInterviewer,
  getInterviewer,
  resumeUpload,
  addInterviewerAvailability,
  updateInterviewerAvailability,
  getInterviewerData,
  getInterviewById,
  getInterviewDataById,
  getAllInterviewerData,
  getCanceledInterviewDataById,
  getAllCancelledInterview,
  getInterviewerAvailability,
  changeAvailabilityStatus,
  interviewerFeedback,
  getInterviewerFeedback,
  changeInterviewStatus,
  changeHrInterviewStatus,
  canceledInterview,
  getRecommendedJobApplied,
  sendMailToRecommendedBy,
  jobApplyFormUpdate,
  getJobFormById,
  getJobAppliedDates,
  deactivateJobApplications,
  reassingtoanothermanager,
  getJobFormFilterStatus,
  checkAvailabilityStatus,
  getJobFormFilterMangerReview,
  candidatetracking
};
