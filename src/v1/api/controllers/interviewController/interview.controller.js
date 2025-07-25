import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { google } from "googleapis";

//
import axios from 'axios';
import FormData from "form-data";

import { validationResult } from 'express-validator';
import screeningresultModel from "../../models/screeningResultModel/screeningResult.model.js"
import InterviewDetailModel from "../../models/InterviewDetailsModel/interviewdetails.model.js";
import JobApplyForm from "../../models/jobformModel/jobform.model.js";
import jobPostModel from "../../models/jobPostModel/jobPost.model.js";
import Employee from "../../models/employeemodel/employee.model.js";
import OrganizationModel from "../../models/organizationModel/organization.model.js";
import employeeModel from "../../models/employeemodel/employee.model.js";
import CallLogModel from "../../models/airPhoneModels/calllog.model.js";
import agentModel from "../../models/airPhoneModels/agent.model.js";
import AI_Interviwew from "../../models/InterviewDetailsModel/aiInterview.model.js";
import { generateAIScreening, callSummaryPrompt , generatingInterview } from "../../services/Geminiservices/gemini.service.js"
import {
  success,
  badRequest,
  notFound,
  unknownError,
} from "../../formatters/globalResponse.js";
import EmailuserModel from "../../models/UserEmail/user.js"
import { generateInterviewPrompt } from "../../prompt/InterviewPrompt.js"
import { sendEmail } from "../../Utils/sendEmail.js";


const CLIENT_ID = "872671367575-jg9vohru7bc7cj22iitp617iascb9pjn.apps.googleusercontent.com"
const CLIENT_SECRET = "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"
const REDIRECT_URI = "https://finexe.fincooper.in/callback"
const ACCESS_TOKEN = "ya29.a0AeXRPp5zHWCRNeYdt8Ppy-5885VUaHtB5HIocDgrnaVwSc_gOs5zhpODFE8PYjIh_U6nA6kecQvRB1xes8Y6kLrnjyPiW9R8xe7bKgH1ojx2arFWBjEdn4Gytwmvjmf4xDJNqzTZS0-PR5nXXuzKXArYLi3FIlF25Kr3EgX1aCgYKASUSARASFQHGX2MiJmfv90mN-q4k-wAy7uW0TQ0175"
const REFRESH_TOKEN = "1//0gNOPs9nx_5veCgYIARAAGBASNwF-L9IrRdWAA9LjQgzoL2hciELQpx93lM3jqeIgBa6VwxM-n-jkvAhHX8hN07z1dxJHWO4NAnQ"
const EXPIRY_DATE = "3599"

/* ───────────────────────────── 1.  Add / schedule ─────────────────────────── */
export const addInterview = async (req, res) => {
  try {
    const { organizationId, id } = req.employee || {};
    if (!organizationId)
      return badRequest(res, "Invalid token – organizationId missing");

    if (id) {
      const hrExist = await employeeModel.findById(id)
      if (!hrExist) {
        return badRequest(res, "Employee Not Found ")
      }
    }
    const {
      candidateId,
      interviewerId,
      interviewModel,
      interviewType,
      scheduleDate,
      durationMinutes,
      roundName,
      description,
      feedback = "",
      skillsFeedback = [],
      status,
      meetingSchedule,
      language
    } = req.body;

    

    if (!candidateId)
      return badRequest(res, "candidateId  are required");
    // console.log("organization", organizationId)
    // console.log("candidateId", candidateId)

    // const hasCompleteInterview = await InterviewDetailModel.exists({
    //   candidateId,
    //   status: "complete"
    // });
    // console.log("hasCompleteInterview",hasCompleteInterview)

    // if (!hasCompleteInterview) {
    //   return badRequest(res, "Cannot schedule interview. Candidate has no completed interview round yet.");
    // }

    // const hasAnyInterview = await InterviewDetailModel.exists({ candidateId });

    // // Does the candidate already have *at least one* COMPLETED round?
    // const hasCompletedInterview = await InterviewDetailModel.exists({
    //   candidateId,
    //   status: "approve",
    // });

    // // If the candidate is not new *and* still has no completed round ⇒ block
    // if (hasAnyInterview && !hasCompletedInterview) {
    //   return badRequest(
    //     res,
    //     "Cannot schedule the next interview. Previous round has not been marked as Approve yet."
    //   );
    // }

    const agentData = await agentModel.findOne({
      employeeId: interviewerId,
      organizationId: organizationId,
      status: "Active",
    });
    console.log("Agent data found:", agentData);

    if (interviewType === "Call" && (!agentData || agentData.status !== "Active")) {
      console.log("Employee is not active for call, please activate employee.");
      return badRequest(res, "Interviewer is not active for Call interview or Registered for call.");
    }

    const latestInterview = await InterviewDetailModel
      .findOne({ organizationId, candidateId })
      .sort({ createdAt: -1 })
      .lean();
    if (latestInterview && latestInterview.status !== "complete") {
      return badRequest(
        res,
        "Cannot Schedule The Next Interview. Candidate's Last Round Has Not Been complete"
      );
    }

    let finalInterviewModel = interviewModel;
    let finalInterviewType = interviewType;



    // if (latestInterview) {
    //   finalInterviewModel = interviewModel ? interviewModel : latestInterview.interviewModel;
    //   finalInterviewType = interviewType ? interviewType : latestInterview.interviewType;
    // } else {
    //   if (!interviewModel || !interviewType) {
    //     return badRequest(
    //       res,
    //       "interviewModel & interviewType are required for the first round"
    //     );
    //   }
    // }


    if (status === "schedule") {
      if (!scheduleDate || !durationMinutes) {
        return badRequest(res, "Duration & ScheduleDate Are Required");
      }

      // ✅ Check if candidate is shortlisted
      const candidate = await JobApplyForm.findOne({ _id: candidateId, resumeShortlisted: "shortlisted" });
      if (!candidate) {
        return badRequest(res, "Candidate is not shortlisted or does not exist.");
      }

      // ✅ Check interviewer availability (prevent time overlap)
      const baseStart = new Date(scheduleDate);
      if (isNaN(baseStart.getTime())) {
        return badRequest(res, "Invalid scheduleDate");
      }

      const baseEnd = new Date(baseStart.getTime() + durationMinutes * 60000);

      const overlappingInterview = await InterviewDetailModel.findOne({
        interviewerId,
        organizationId,
        status: { $in: ["schedule", "running"] },
        scheduleDate: { $lt: baseEnd },
        $expr: {
          $gt: [
            { $add: ["$scheduleDate", { $multiply: ["$durationMinutes", 60000] }] },
            baseStart,
          ],
        },
      });

      if (overlappingInterview) {
        return badRequest(res, "Interviewer already has an interview scheduled at this time.");
      }
    }

    let baseTime;
    if (scheduleDate) {
      baseTime = new Date(scheduleDate);
      if (isNaN(baseTime.getTime()))
        return badRequest(res, "Invalid scheduleDate");
    }


    const Newdate = new Date(baseTime.getTime() + (5.5 * 60 * 60 * 1000)); // shift back to pretend it's IST

    const completedRounds = await InterviewDetailModel.countDocuments({
      organizationId,
      candidateId,
      status: "complete",
    });


    let newInterview;

    if (finalInterviewModel == "AI") {
      try {
        const jobApplyForm = await JobApplyForm.findById(candidateId).lean();
        const jobPostId = jobApplyForm?.jobPostId;

        if (!jobPostId) {
          console.warn("AI Interview skipped: jobPostId missing");
        } else {
          const job = await jobPostModel.findById(jobPostId).populate({
            path: 'jobDescriptionId',
            select: 'jobDescription'
          });

          const { JobSummary, RolesAndResponsibilities, KeySkills } = job?.jobDescriptionId?.jobDescription || {};

          if (!JobSummary || !RolesAndResponsibilities || !KeySkills) {
            console.warn("AI Interview skipped: job description incomplete");
          } else {
            const aiInterview = await AI_Interviwew.create({
              organizationId,
              candidateId,
              jobId: jobPostId,
              resumeText: jobApplyForm?.resume || "",
              durationMinutes: durationMinutes || 30,
              scheduleDate: Newdate || new Date(),
              jobDescription: {
                JobSummary,
                RolesAndResponsibilities,
                KeySkills
              },
              language: language || "English",
              history: [],
              hrId: id
            });

            newInterview = await InterviewDetailModel.create({
              organizationId,
              candidateId,
              interviewerId: null,
              interviewModel: "AI",
              interviewType: "Online",
              roundNumber: completedRounds + 1,
              roundName: roundName || "AI Round",
              description: description || "AI-based screening interview",
              scheduleDate: Newdate || new Date(),
              durationMinutes,
              feedback: "",
              skillsFeedback: [],
              status,
              hrId: id,
              AIInterviewId: aiInterview._id || null
            });

            // ✅ Send Email to Candidate
            try {
              console.log("Sending AI interview email to candidate...", baseTime);
              // Manually remove the 5:30 offset so it behaves like IST
              const istDate = new Date(baseTime.getTime() + (5.5 * 60 * 60 * 1000)); // shift back to pretend it's IST
              const formattedDate = istDate.toLocaleString("en-IN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              }).replace(",", "");


              console.log("Formatted Date:", formattedDate);

              const frontendUrl = `${process.env.INTERVIEW_URL}/AI-Interview?InterviewId=${aiInterview._id}`;

const emailMessage = `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #1a73e8;">AI Interview Scheduled – ${job.position}</h2>

    <p>Dear <strong>${jobApplyForm.name}</strong>,</p>

    <p>We are excited to inform you that your <strong>AI interview</strong> for the role of <strong>${job.position}</strong> has been successfully scheduled.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-bottom: 10px; color: #444;">📅 Interview Details</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li><strong>📆 Date & Time:</strong> ${formattedDate}</li>
        <li><strong>⏱ Duration:</strong> ${durationMinutes || 30} minutes</li>
        <li><strong>💻 Mode:</strong> AI Interview (Online)</li>
      </ul>
    </div>

    <p>To begin your interview at the scheduled time, please click the button below:</p>

    <div style="text-align: center; margin: 25px 0;">
      <a href="${frontendUrl}" 
         style="background-color: #1a73e8; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
        🎯 Start AI Interview
      </a>
    </div>

    <p style="margin-top: 30px;">Please ensure you are in a quiet environment with a reliable internet connection. Use a desktop or laptop for the best experience.</p>

    <p>We wish you all the best in your interview process!</p>

    <p style="margin-top: 40px;">Sincerely,<br><strong>Fincoopers HR Team</strong></p>
  </div>
`;


              await sendEmail({
                to: jobApplyForm.emailId,
                subject: "Your AI Interview Schedule – Fincoopers",
                html: emailMessage,
              });

              console.log("✅ Interview email sent to candidate.");
            } catch (emailError) {
              console.error("❌ Failed to send AI interview email:", emailError.message);
            }

            console.log("✅ AI Interview initialized:", aiInterview._id);
          }
        }
      } catch (aiError) {
        console.error("❌ Error initializing AI Interview:", aiError.message);
      }
    } else {
      // 🧠 For HUMAN interviews – only this block runs
      newInterview = await InterviewDetailModel.create({
        organizationId,
        candidateId,
        interviewerId,
        interviewModel: finalInterviewModel,
        interviewType: finalInterviewType,
        roundNumber: completedRounds + 1,
        roundName,
        description,
        scheduleDate: scheduleDate ? baseTime : null,
        durationMinutes,
        feedback,
        skillsFeedback,
        status,
        hrId: id
      });
    }


    // const newInterview = await InterviewDetailModel.create({
    //   organizationId,
    //   candidateId,
    //   interviewerId,
    //   interviewModel: finalInterviewModel,
    //   interviewType: finalInterviewType,
    //   roundNumber: completedRounds + 1,
    //   roundName,
    //   description,
    //   scheduleDate: scheduleDate ? baseTime : null,
    //   durationMinutes,
    //   feedback,
    //   skillsFeedback,
    //   status,
    //   hrId: id
    // });

    // ✅ Generate meet link for Online interviews
    if (finalInterviewType === "Online" && baseTime) {
      const jobApplyForm = await JobApplyForm.findById(candidateId);
      const organization = await OrganizationModel.findById(organizationId);
      const employee = await Employee.findById(interviewerId);


      if (!employee.email) {
        return badRequest(res, "Employee Email Not Found");
      }
      if (jobApplyForm && organization && employee && meetingSchedule) {
        const meetLink = await generateInterviewLink({
          date: baseTime.toISOString().split("T")[0],
          time: baseTime.toTimeString().slice(0, 5),
          durationMinutes,
          candidateEmail: jobApplyForm.emailId,
          candidateName: jobApplyForm.name,
          jobTitle: jobApplyForm.position,
          companyName: organization.name || "",
          interviewerName: employee.employeName || employee.userName || "",
          interviewerEmail: employee.email
        });
        console.log('schedule meeting link done ')
        newInterview.scheduleLink = meetLink;
        await newInterview.save();
      }
    }






    return success(res, "Interview scheduled", newInterview);
  } catch (err) {
    console.error("addInterview:", err);
    return unknownError(res, err);
  }
};



export const addBulkInterviews = async (req, res) => {
  try {
    const { organizationId } = req.employee || {};
    if (!organizationId)
      return badRequest(res, "Invalid token – organizationId missing");

    
    
    
    
    
    
    
    
    
    
    
    
    const {
      candidateIds = [],
      interviewerId,
      interviewModel,
      interviewType,
      durationMinutes,
      scheduleDate,
      roundName,
      feedback = "",
      skillsFeedback = [],
    } = req.body;

    if (!Array.isArray(candidateIds) || candidateIds.length === 0)
      return badRequest(res, "candidateIds must be a non-empty array");

    if (!interviewerId || !interviewModel || !interviewType)
      return badRequest(res, "interviewerId, interviewModel, interviewType are required");

    if (!durationMinutes || !scheduleDate)
      return badRequest(res, "Duration and scheduleDate are required");

    const startTime = new Date(scheduleDate);
    if (isNaN(startTime.getTime()))
      return badRequest(res, "Invalid scheduleDate");

    let scheduledInterviews = [];
    let currentTime = new Date(startTime);

    for (const candidateId of candidateIds) {
      const completedRounds = await InterviewDetailModel.countDocuments({
        organizationId,
        candidateId,
        status: "complete"
      });

      const newInterview = await InterviewDetailModel.create({
        organizationId,
        candidateId,
        interviewerId,
        interviewModel,
        interviewType,
        roundNumber: completedRounds + 1,
        roundName,
        scheduleDate: new Date(currentTime),
        durationMinutes,
        feedback,
        skillsFeedback,
        status: "schedule"
      });

      scheduledInterviews.push(newInterview);

      // Increment currentTime by (duration + 2 minutes)
      currentTime = new Date(currentTime.getTime() + (durationMinutes + 2) * 60 * 1000);
    }

    return success(res, "Bulk interviews scheduled", scheduledInterviews);

  } catch (err) {
    console.error("addBulkInterviews:", err);
    return unknownError(res, err);
  }
};

/* ───────────────────────────── 2.  Update ─────────────────────────────────── */
// export const updateInterview = async (req, res) => {
//     try {
//         const { id } = req.query;
//         if (!id) return badRequest(res, "Id is required");
//         if (!mongoose.Types.ObjectId.isValid(id))
//             return badRequest(res, "Invalid interview id");

//         const interview = await InterviewDetailModel.findById(id).populate({ path: "interviewerId", select: "userName" }).populate({ path: "candidateId", select: "name mobileNumber" }).lean();
//         if (!interview) return notFound(res, "Interview not found");

//         const jobApplyForm = await JobApplyForm.findById(interview.candidateId);
//         if (!jobApplyForm) return notFound(res, "Candidate not found");

//         const jobPost = jobApplyForm.jobPostId
//         console.log("jobPost:", jobPost);
//         if (!jobPost) return notFound(res, "Job Post not found");



//         const organization = await OrganizationModel.findById(interview.organizationId);

//         const employee = await Employee.findById(interview.interviewerId);

//         if (req.body.scheduleDate) {
//             const baseTime = new Date(req.body.scheduleDate);
//             if (isNaN(baseTime.getTime())) {
//                 return badRequest(res, "Invalid Schedule Date");
//             }
//             interview.scheduleDate = new Date(req.body.scheduleDate);
//         }

//         Object.entries(req.body).forEach(([key, value]) => {
//             if (key !== "_id") interview[key] = value;
//         });

//         const meetLink = await generateInterviewLink({
//             date: interview.scheduleDate.toISOString().split("T")[0],
//             time: interview.scheduleDate.toTimeString().split(" ")[0].slice(0, 5), // HH:MM format
//             candidateEmail: jobApplyForm.emailId,
//             candidateName: jobApplyForm.name,
//             jobTitle: jobApplyForm.jobTitle ,
//             companyName: organization.name,
//             interviewerName: employee.employeName,
//         });

//         interview.scheduleLink = meetLink;


//         await interview.save();
//         return success(res, "Interview updated", interview);
//     } catch (err) {
//         console.error("updateInterview:", err);
//         return unknownError(res, err);
//     }
// };

export const updateInterview = async (req, res) => {
  try {
    /* 1. basic checks */
    const { id } = req.query;
    const { organizationId } = req.employee
    const { interviewerId, interviewType, candidateId, status, scheduleDate, durationMinutes, meetingSchedule } = req.body
    if (!id) return badRequest(res, 'Id is required');
    if (!mongoose.Types.ObjectId.isValid(id))
      return badRequest(res, 'Invalid interview id');

    /* 2. load interview as a Mongoose document (NO .lean()) */
    const interview = await InterviewDetailModel.findById(id);
    //   .populate({ path: 'interviewerId', select: 'userName employeName' })
    //   .populate({ path: 'candidateId', select: 'name mobileNumber emailId' });

    if (!interview) return notFound(res, 'Interview not found');
    /* 3. load related data */
    const jobApplyForm = await JobApplyForm.findOne({
      _id: interview.candidateId,   // adjust to your schema
    });
    if (!jobApplyForm) return notFound(res, 'Candidate not found');

    const organization = await OrganizationModel.findById(
      interview.organizationId,
    );
    const employee = await Employee.findById(interview.interviewerId);

    if (!employee?.email && !interview?.interviewModel == "AI") {
      return badRequest(res, "Employee Email Not Found");
    }

    if (status === "schedule") {
      if (!scheduleDate || !durationMinutes) {
        return badRequest(res, "Duration & ScheduleDate Are Required");
      }

      // ✅ Check if candidate is shortlisted
      const candidate = await JobApplyForm.findOne({ _id: candidateId, resumeShortlisted: "shortlisted" });
      if (!candidate) {
        return badRequest(res, "Candidate is not shortlisted or does not exist.");
      }

      // ✅ Check interviewer availability (prevent time overlap)
      const baseStart = new Date(scheduleDate);
      if (isNaN(baseStart.getTime())) {
        return badRequest(res, "Invalid scheduleDate");
      }
      const baseEnd = new Date(baseStart.getTime() + durationMinutes * 60000);

      const agentData = await agentModel.findOne({
        employeeId: interviewerId,
        organizationId: organizationId,
        status: "Active",
      });
      // console.log("Agent data found:", agentData);
      if (interviewType === "Call" && (!agentData || agentData.status !== "Active")) {
        return badRequest(res, "Interviewer is not active for Call interview or Registered for call.");
      }
      const overlappingInterview = await InterviewDetailModel.findOne({
        interviewerId,
        organizationId,
        status: { $in: ["schedule", "running"] },
        scheduleDate: { $lt: baseEnd },
        $expr: {
          $gt: [
            { $add: ["$scheduleDate", { $multiply: ["$durationMinutes", 60000] }] },
            baseStart,
          ],
        },
      });
      if (overlappingInterview) {
        return badRequest(res, "Interviewer already has an interview scheduled at this time.");
      }
    }
    /* 4. handle scheduleDate (if supplied) */
    if (scheduleDate) {
      const newDate = new Date(scheduleDate);
      if (isNaN(newDate.getTime()))
        return badRequest(res, 'Invalid Schedule Date');
      interview.scheduleDate = newDate;
    }

    /* 5. merge every other updatable field from req.body */
    Object.entries(req.body).forEach(([key, value]) => {
      if (key !== '_id' && key !== 'scheduleDate') interview[key] = value;
    });

    /* 6. regenerate / update meeting link */
    // const meetLink = await generateInterviewLink({
    //   date: interview.scheduleDate.toISOString().split('T')[0], // YYYY‑MM‑DD
    //   time: interview.scheduleDate.toTimeString().slice(0, 5),  // HH:MM
    //   candidateEmail: jobApplyForm.emailId,
    //   candidateName: jobApplyForm.name,
    //   jobTitle: jobApplyForm.jobTitle,
    //   companyName: organization?.name,
    //   interviewerName: employee?.employeName ?? employee?.userName,
    // });
    // interview.scheduleLink = meetLink;
    if (interview.interviewType === "Online" && interview.scheduleDate && meetingSchedule) {
      const meetLink = await generateInterviewLink({
        date: interview.scheduleDate.toISOString().split("T")[0],
        time: interview.scheduleDate.toTimeString().slice(0, 5), // HH:MM
        durationMinutes: durationMinutes,
        candidateEmail: jobApplyForm.emailId,
        candidateName: jobApplyForm.name,
        jobTitle: jobApplyForm.position,
        companyName: organization?.name || "",
        interviewerName: employee?.employeName || employee?.userName || "",
        interviewerEmail: employee.email
      });
      console.log('schedue mett link done ')
      interview.scheduleLink = meetLink;
    }

    /* 7. save & respond */
    await interview.save();
    return success(res, 'Interview updated', interview);
  } catch (err) {
    console.error('updateInterview:', err);
    return unknownError(res, err);
  }
};

/* ───────────────────────────── 2.  detail ─────────────────────────────────── */
export const detailInterview = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return badRequest(res, "Id is required");
    if (!mongoose.Types.ObjectId.isValid(id))
      return badRequest(res, "Invalid interview id");

    const interview = await InterviewDetailModel.findById(id).populate({ path: "interviewerId", select: "userName email workEmail employeName" }).populate({ path: "candidateId", select: "name mobileNumber position" }).lean();
    if (!interview) return notFound(res, "Interview not found");

    const screening = await screeningresultModel
      .findOne({ candidateId: interview.candidateId })
      .select("criteria")
      .lean();

    const masterNames = screening?.criteria?.map(c => c.criteria) ?? [];

    const feedbackMap = new Map();
    (interview.skillsFeedback ?? []).forEach(({ criteria, score = 0 }) => {
      feedbackMap.set(criteria, score);
    });

    for (const name of masterNames) {
      if (!feedbackMap.has(name)) feedbackMap.set(name, 0);
    }

    const mergedskillsFeedback = [
      ...masterNames.map(name => ({ criteria: name, score: feedbackMap.get(name) })),
      ...[...feedbackMap.keys()]
        .filter(name => !masterNames.includes(name))
        .map(name => ({ criteria: name, score: feedbackMap.get(name) }))
    ];

    const interviewWithMerged = {
      ...interview,
      skillsFeedback: mergedskillsFeedback,
    };

    return success(res, "Interview Detail", { interview: interviewWithMerged });
  } catch (err) {
    console.error("detailInterview:", err);
    return unknownError(res, err);
  }
};


/* ───────────────────────────── Interview Schedule Approve And Reject ─────────────────────────────────── */
export const hrByApproveAndReject = async (req, res) => {
  try {
    const { id, status } = req.query;
    if (!id) return badRequest(res, "Id is required");
    if (!mongoose.Types.ObjectId.isValid(id))
      return badRequest(res, "Invalid candidate id");

    const interviewResult = await JobApplyForm.findById(id)
    if (!interviewResult) return notFound(res, "Candidate Not Found");

    const ALLOWED_STATUS = ["approve", "reject"];   // adjust casing if needed

    if (!status) {
      return notFound(res, "Status is required");
    }

    if (!ALLOWED_STATUS.includes(status.toLowerCase())) {
      return badRequest(
        res,
        `Invalid status. Allowed values are: ${ALLOWED_STATUS.join(", ")}`
      );
    }

    const hrByApprove = await JobApplyForm.findByIdAndUpdate(id, { resumeShortlisted: status }, { new: true })

    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    return success(res, `Candidate ${normalizedStatus}`);
  } catch (err) {
    console.error("detailInterview:", err);
    return unknownError(res, err);
  }
};



/* ───────────────────────────── 2.  all schedule interview details ─────────────────────────────────── */
export const allInterViewDetail1 = async (req, res) => {
  try {
    const { candidateId, status } = req.query;

    if (!candidateId) return badRequest(res, "Candidate Id is required");
    if (!ObjectId.isValid(candidateId))
      return badRequest(res, "Invalid Candidate Id");

    const query = { candidateId: new ObjectId(candidateId) };

    if (status) query.status = status;

    const interviewDetails = await InterviewDetailModel.find(query).populate({ path: "interviewerId", select: "userName email workEmail employeName" }).populate({ path: "candidateId", select: "name mobileNumber position emailId" }).lean();

    if (!interviewDetails || interviewDetails.length === 0)
      return notFound(res, "No Interview Found For The Candidate");

    return success(res, "Candidate Interview Details", { interviewDetails });

  } catch (err) {
    console.error(" error:", err);
    return unknownError(res, err);
  }
};

export const allInterViewDetail = async (req, res) => {
  try {
    const { candidateId, status } = req.query;

    /* ─────────────────── basic checks ─────────────────── */
    if (!candidateId) return badRequest(res, "Candidate Id is required");
    if (!ObjectId.isValid(candidateId)) return badRequest(res, "Invalid Candidate Id");

    /* ─────────────────── build interview query ─────────────────── */
    const query = { candidateId: new ObjectId(candidateId) };
    if (status) query.status = status;          // optional status filter

    /* ─────────────────── fetch interviews ─────────────────── */
    const interviews = await InterviewDetailModel
      .find(query)
      .populate({                 // interviewer details
        path: "interviewerId",
        select: "userName email workEmail employeName"
      })
      .populate({                 // candidate details
        path: "candidateId",
        select: "name mobileNumber position emailId jobPostId"
      })
      .lean();                    // lean → plain JS objects (easier to mutate)

    if (!interviews.length) return notFound(res, "No Interview Found For The Candidate");

    /* ─────────────────── pull all unique_ids ─────────────────── */
    const uniqueIds = interviews
      .map(i => i.callResult?.unique_id)        // may be undefined / ""
      .filter(Boolean);                         // remove empty / null

    /* ─────────────────── fetch call‑logs once, make a map ─────────────────── */
    let logMap = {};
    if (uniqueIds.length) {
      const callLogs = await CallLogModel
        .find({ unique_id: { $in: uniqueIds } })
        .select("unique_id call_status recording_url duration datetime") // only what we need
        .lean();

      logMap = callLogs.reduce((acc, log) => {
        acc[log.unique_id] = log;
        return acc;
      }, {});
    }

    /* ─────────────────── merge log details into each interview ─────────────────── */
    interviews.forEach(iv => {
      const log = logMap[iv.callResult?.unique_id];
      if (log) {
        // ⬇️  add the extra fields INSIDE the existing callResult object
        iv.callResult.callStatus = log.call_status;     // e.g. "Answered"
        iv.callResult.recordingUrl = log.recording_url;   // audio URL
        iv.callResult.duration = log.duration;        // "00:02:15"
        iv.callResult.datetime = log.datetime;        // original time‑stamp
      }
    });

    /* ─────────────────── send response ─────────────────── */
    return success(res, "Candidate Interview Details", { interviewDetails: interviews });

  } catch (err) {
    console.error("Error in allInterViewDetail:", err);
    return unknownError(res, err);
  }
};



const OAuth2 = google.auth.OAuth2;
const oAuth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  `${process.env.BASE_URI}/v1/api/google/callback`,
  // 'https://hrms-api.fincooperstech.com/v1/api/google/callback'
);



const saveTokens = async (tokens) => {
  process.env.ACCESS_TOKEN = tokens.access_token;
  process.env.REFRESH_TOKEN = tokens.refresh_token;
  process.env.EXPIRY_DATE = String(tokens.expiry_date);
};


async function loadTokens(hrEmail) {
  console.log('check ')
  const cred = await EmailuserModel.findOne({ email: hrEmail });
  if (!cred) throw new Error(`Not Created credentials for ${hrEmail}`);
  const tokens = {
    access_token: cred.accessToken,
    refresh_token: cred.refreshToken,
    expiry_date: cred.expiryDate,
  };
  oAuth2Client.setCredentials(tokens);
  return tokens;
}
async function refreshAccessTokenIfNeeded(hrEmail) {
  const { expiry_date } = await loadTokens(hrEmail);
  const now = Date.now();

  if (now >= expiry_date - 60_000) {          // 60 s safety margin
    console.log("🔄  Refreshing Google access token…");
    const { credentials } = await oAuth2Client.refreshAccessToken();
    await saveTokens(hrEmail, credentials);   // keep DB in sync
    oAuth2Client.setCredentials(credentials); // update client in memory
  }
}


async function generateInterviewLink(opts) {
  const {
    date,
    time,
    candidateEmail,
    candidateName,
    jobTitle,
    companyName,
    interviewerName,
    interviewerEmail,
  } = opts;

  console.log('  date',
    time,
    candidateEmail,
    candidateName,
    jobTitle,
    companyName, 'interviewerName---',
    interviewerName,
    interviewerEmail)
  await refreshAccessTokenIfNeeded(interviewerEmail);
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  const eventStart = new Date(`${date}T${time}:00+05:30`); // IST
  const eventEnd = new Date(eventStart);
  eventEnd.setMinutes(eventStart.getMinutes() + 60);

  const event = {
    summary: `${jobTitle} interview – ${candidateName}`,
    description: `Interview with ${candidateName} for the ${jobTitle} role at ${companyName}. Interviewer: ${interviewerName}.`,
    start: { dateTime: eventStart.toISOString(), timeZone: "Asia/Kolkata" },
    end: { dateTime: eventEnd.toISOString(), timeZone: "Asia/Kolkata" },
    attendees: [{ email: candidateEmail }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 60 },
        { method: "popup", minutes: 15 },
      ],
    },
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,      // must be unique per call
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const res = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,
  });

  return res.data.hangoutLink;  // Google‑Meet URL
}


// export async function generateInterviewLink(opts) {
//    const {
//  date, time, durationMinutes = 60,
//           candidateEmail, candidateName,jobTitle,companyName,
//            interviewerName,interviewerEmail,
//   } = opts;

//    await refreshAccessTokenIfNeeded();
//   const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

//   const start = new Date(`${date}T${time}:00+05:30`);
//   const end   = new Date(start); end.setMinutes(start.getMinutes() + durationMinutes);

//   const event = {
//     summary: `${jobTitle} interview – ${candidateName}`,
//     description: `Interview with ${candidateName} for the ${jobTitle} role at ${companyName}. Interviewer: ${interviewerName}.`,
//     start: { dateTime: start.toISOString(), timeZone: "Asia/Kolkata" },
//     end:   { dateTime: end.toISOString(),   timeZone: "Asia/Kolkata" },
//     conferenceData: {
//       createRequest: {
//         requestId: `meet-${Date.now()}`,
//         conferenceSolutionKey: { type: "hangoutsMeet" },
//       }
//     },
//     attendees: [
//       { email: candidateEmail,   displayName: candidateName },
//       { email: interviewerEmail, displayName: interviewerName }
//     ],
//     guestsCanSeeOtherGuests: false,
//     reminders: {
//       useDefault: false,
//       overrides: [
//         { method: "email", minutes: 60 },
//         { method: "popup", minutes: 15 }
//       ]
//     }
//   };

//   const { data } = await calendar.events.insert({
//     calendarId: "primary",        // or the ID of a renamed secondary calendar
//     conferenceDataVersion: 1,
//     resource: event,
//     sendUpdates: "all"
//   });

//   return data.hangoutLink;
// }
// get sheduled interview acc to organization


export const getAllScheduledInterviews = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    const employeeId = req.employee.id;
    console.log("employeeId:", employeeId);

    const { interviewType, status, interviewModel, allDataShow, page = 1, limit = 10 } = req.query;

    if (!organizationId) {
      return badRequest(res, "Missing organizationId in token");
    }

    const filter = {
      organizationId,
    };

    if (allDataShow !== "all") {
      filter.organizationId = organizationId;
      filter.interviewerId = employeeId;
    }

    if (interviewType) {
      // Corrected variable name
      filter.interviewType = new RegExp("^" + interviewType + "$", "i");
    }

    if (status) {
      const statusArray = status.split(",").map(s => s.trim().toLowerCase());
      filter.status = { $in: statusArray };
    }

    if (interviewModel) {
      // Corrected variable name
      filter.interviewModel = new RegExp("^" + interviewModel + "$", "i");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [interviews, total] = await Promise.all([
      InterviewDetailModel.find(filter)
        .populate({
          path: "candidateId",
          select: "name emailId mobileNumber position jobPostId"
        })
        .populate({
          path: "interviewerId",
          select: "userName workEmail mobileNo"
        })
        .sort({ scheduleDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),

      InterviewDetailModel.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return success(res, "Scheduled interviews fetched successfully", {
      totalRecords: total,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit),
      interviews
    });

  } catch (err) {
    console.error("Error fetching interviews:", err);
    return unknownError(res, err);
  }
};

export const getAllEmploye = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const organizationId = req.employee.organizationId;
    if (!organizationId) {
      return badRequest(res, "Invalid token – organizationId missing");
    }


    const RoleName = req.query.RoleName;
    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const skip = (page - 1) * limit;

    // Extract employeName from query params
    const employeName = req.query.employeName;

    // Base filter
    const filter = {
      organizationId,
      status: "active",
      onboardingStatus: { $in: ["enrolled"] },
      // Uncomment below if you want to exclude a specific role
      // roleId: { $ne: newJoineeRole._id }
    };

    // Add employeName filter if provided
    if (employeName) {
      // Using regex for case-insensitive partial matching
      filter.employeName = { $regex: employeName, $options: "i" };
    }

    const [employeDetail, totalCount] = await Promise.all([
      Employee
        .find(filter)
        .select(
          "organizationId employeePhoto employeUniqueId employeementHistory _id workEmail mobileNo userName employeName currentAddress permanentAddress dateOfBirth joiningDate status company onboardingStatus email"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "roleId", select: "roleName" })
        .populate({ path: "branchId", select: "name" })
        .populate({ path: "departmentId", select: "name" })
        .populate({ path: "designationId", select: "name" })
        .populate({ path: "workLocationId", select: "name" })
        .populate({ path: "reportingManagerId", select: "employeName" })
        .populate({ path: "employeeTypeId", select: "title" })
        .populate({ path: "employementTypeId", select: "title" })
        .populate({ path: "constCenterId", select: "title" }),

      Employee.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    success(res, "All Employees", {
      employees: employeDetail,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
};




// AI_Interview Config //


export const startAIInterview = async (req, res) => {
  try {
    const { candidateId, language } = req.body;
    const organizationId = req.employee.organizationId;

    if (!candidateId || !language) {
      return badRequest(res, "All fields (candidateId, resumeText, language) are required.");
    }

    const findCandidate = await JobApplyForm.findById(candidateId).lean();
    console.log("findCandidate:", findCandidate);

    if (!findCandidate) {
      return badRequest(res, "Candidate not found.");
    }

    const jobPostId = findCandidate.jobPostId;

    if (!jobPostId) {
      return badRequest(res, "Job post ID not found in candidate data.");
    }

    // Find job and populate only the job description
    const findJob = await jobPostModel.findById(jobPostId).populate({
      path: 'jobDescriptionId',
      select: 'jobDescription',
    });


    if (!findJob || !findJob.jobDescriptionId) {
      return badRequest(res, "Job or job description not found.");
    }

    // Extract only required fields
    const { JobSummary, RolesAndResponsibilities, KeySkills } = findJob.jobDescriptionId.jobDescription || {};

    if (!JobSummary || !RolesAndResponsibilities || !KeySkills) {
      return badRequest(res, "Incomplete job description data.");
    }

    const interview = await AI_Interviwew.create({
      organizationId,
      candidateId,
      jobId: jobPostId,
      resumeText: findCandidate.resume || "", // Ensure resumeText is a string
      jobDescription: {
        JobSummary,
        RolesAndResponsibilities,
        KeySkills
      },
      language,
      history: [],
    });

    return success(res, "Interview started successfully.", interview);

  } catch (error) {
    console.error("startAIInterview error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};





// interviewTurnHandler //
const formatHistory = (history) =>
  history.map(
    (msg) => `${msg.role == 'user' ? 'Candidate' : 'AI'}: ${msg.content}`
  ).join('\n');


function calculateAIStatus(jobFitScoreStr) {
  const score = parseInt(jobFitScoreStr.split('/')[0], 10); // e.g., "6/10" → 6
  if (score >= 8) return 'Recommended';
  if (score <= 4) return 'Not Recommended';
  return 'Neutral';
}


const callInterviewPrompt = async ({ resumeText, jobDescription, history, language }) => {
  const prompt = `You are an AI interviewer. Language: ${language || "English"}
Job Description:\n${jobDescription}
Resume:\n${resumeText}
Conversation:\n${formatHistory(history)}
Respond with your next question. End with 'INTERVIEW_COMPLETE' when finished.`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text?.();
  return { response: text?.trim() || "" };
};




export const interviewTurnHandler = async (req, res) => {
  try {
    const { interviewId, userMessage } = req.body;

    if (!interviewId || !userMessage) {
      return badRequest(res, "interviewId and userMessage are required.");
    }

    const interview = await AI_Interviwew.findById(interviewId);
    if (!interview) {
      return badRequest(res, "Interview not found.");
    }

    if (interview.isComplete == true) {
      return success(res, "Interview is already completed.");
    }

    const fileUrl = interview.resumeText;
    if (!fileUrl) {
      return badRequest(res, "resumeText (resume file URL) is missing in interview record.");
    }

    // Append user message
    interview.history.push({ role: "user", content: userMessage });

    // Generate prompt and get AI response
    const prompt = generateInterviewPrompt(interview);
    const aiResult = await generateAIScreening(prompt, fileUrl);

    if (aiResult?.error) {
      return unknownError(res, aiResult.error);
    }

    const aiReplyRaw = typeof aiResult == 'string' ? aiResult : aiResult.response || JSON.stringify(aiResult);
    interview.history.push({ role: "model", content: aiReplyRaw });

    let parsedReply;
    try {
      parsedReply = JSON.parse(aiReplyRaw);
    } catch (err) {
      return badRequest(res, "Invalid AI response format");
    }

    const wasCompleted = parsedReply.isComplete == true;
    if (wasCompleted) {
      interview.isComplete = true;
    }

    await interview.save();

    // ✅ Send response immediately
    success(res, "AI Interview Response", {
      response: parsedReply,
      isComplete: interview.isComplete
    });

    // 🧠 Continue processing summary in background (non-blocking)
    if (wasCompleted) {
      const transcript = formatHistory(interview.history);
      const summary = await callSummaryPrompt({
        transcript,
        jobDescription: interview.jobDescription,
        resume: interview.resumeText
      });

      interview.summary = summary;
      interview.aiDecision = summary.status || "Neutral";

      await interview.save(); // Save after summary
    }

  } catch (error) {
    return unknownError(res, error);
  }
};


export const getInterviewHistory = async (req, res) => {
  try {
    const { interviewId } = req.query;

    if (!interviewId) {
      return badRequest(res, "interviewId is required in query.");
    }

    const interview = await AI_Interviwew.findById(interviewId).lean();

    if (!interview) {
      return badRequest(res, "Interview not found.");
    }

    // Safely parse model responses
    const parsedHistory = interview.history.map((msg) => {
      if (msg.role === "model") {
        try {
          return {
            ...msg,
            content: JSON.parse(msg.content),
          };
        } catch (err) {
          console.warn("❌ Failed to parse model content JSON:", msg.content);
          return msg; // return original if parsing fails
        }
      }
      return msg;
    });

    const response = {
      interviewId: interview._id,
      candidateId: interview.candidateId,
      jobId: interview.jobId,
      language: interview.language,
      isComplete: interview.isComplete,
      history: parsedHistory,
      summary: interview.summary || null,
      aiDecision: interview.aiDecision || "Pending",
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
      scheduleDate:interview.scheduleDate ? interview.scheduleDate.toISOString() : null,
      durationMinutes: interview.durationMinutes || 0,
      videoUrl:interview.videoUrl || ""
    };

    return success(res, "Interview history fetched successfully", response);
  } catch (error) {
    return unknownError(res, error);
  }
};


export const completeInterviewManually = async (req, res) => {
  try {
    const { interviewId, videoUrl } = req.query;

    if (!interviewId) {
      return badRequest(res, "interviewId is required.");
    }

    const interview = await AI_Interviwew.findById(interviewId);
    if (!interview) {
      return badRequest(res, "Interview not found.");
    }

    if (interview.isComplete === true) {
      return success(res, "Interview is already marked as completed.");
    }

    // ✅ Mark as complete and update basic fields
    interview.isComplete = true;
    interview.videoUrl = videoUrl || "";
    interview.history.push({
      role: "model",
      content: "Interview was marked as complete because time limit exceeded or manually completed by HR."
    });

    await interview.save();

const result = await InterviewDetailModel.findOneAndUpdate(
  {
    candidateId: new mongoose.Types.ObjectId(interview.candidateId),
    AIInterviewId: new mongoose.Types.ObjectId(interviewId),
  },
  { status: "complete" },
  { new: true }
);


    // ✅ Respond to client immediately
    success(res, "Interview marked as completed successfully.", {
      isComplete: true,
      interviewId: interview._id
    });

    // 🧠 Continue processing summary in the background
    (async () => {
      try {
        const transcript = formatHistory(interview.history);
        const summary = await callSummaryPrompt({
          transcript,
          jobDescription: interview.jobDescription,
          resume: interview.resumeText
        });

        await AI_Interviwew.findByIdAndUpdate(interviewId, {
          summary,
          aiDecision: summary.status || "Neutral"
        });
      } catch (summaryErr) {
        console.error("⚠️ Failed to generate interview summary:", summaryErr);
      }
    })();

  } catch (error) {
    return unknownError(res, error);
  }
};






// sumarizeai Interview //

export const summarizeAIInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const interview = await AI_Interviwew.findById(interviewId);
    if (!interview || !interview.isComplete) {
      return badRequest(res, "Interview not completed and not found")
    }

    const transcript = formatHistory(interview.history);
    const summary = await callSummaryPrompt({
      transcript,
      jobDescription: interview.jobDescription,
      resume: interview.resumeText,
    });

    summary.status = calculateAIStatus(summary.jobFitScore);
    interview.summary = summary;
    interview.aiDecision = summary.status;
    await interview.save();

    return success(res, "summary", summary)


  } catch (error) {
    return unknownError(res, error)
  }
}


//get call dashboard data //
// export const getCallDashboardStats1 = async (req, res) => {
//   try {
//     const organizationId = req.employee?.organizationId;
//     if (!organizationId)
//       return badRequest(res, "organizationId is required in headers.");

//     const {
//       search = "",
//       startDate,
//       endDate,
//       agent,
//       status,
//       minDuration,
//       maxDuration,
//       page,
//       limit,
//       candidate,
//       interviewer,
//     } = req.query;

//     // Step 1: Get InterviewDetails
//     const interviewFilter = { organizationId };
//     if (candidate) interviewFilter.candidateId = candidate;
//     if (interviewer) interviewFilter.interviewerId = interviewer;

//     const interviews = await InterviewDetailModel.find(interviewFilter).select(
//       "callResult.unique_id candidateId interviewerId"
//     );
//     const uniqueIds = interviews.map((i) => i.callResult?.unique_id).filter(Boolean);

//     // Step 2: Build CallLog filter
//     const filter = {
//       unique_id: { $in: uniqueIds },
//     };

//     if (status) {
//       filter.call_status = new RegExp("^" + status + "$", "i"); // case-insensitive
//     }

//     if (agent) {
//       filter.received_id = agent;
//     }

//     if (search) {
//       filter.$or = [
//         { caller_id: { $regex: search, $options: "i" } },
//         { received_id: { $regex: search, $options: "i" } },
//         { ivr_number: { $regex: search, $options: "i" } },
//         { call_type: { $regex: search, $options: "i" } },
//         { call_status: { $regex: search, $options: "i" } },
//         { unique_id: { $regex: search, $options: "i" } },
//       ];
//     }

//     if (startDate || endDate) {
//       filter.createdAt = {};
//       if (startDate) {
//         filter.createdAt.$gte = new Date(startDate);
//       }
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         filter.createdAt.$lte = end;
//       }
//     }

//     if (minDuration || maxDuration) {
//       filter.duration = {};
//       if (minDuration) filter.duration.$gte = minDuration;
//       if (maxDuration) filter.duration.$lte = maxDuration;
//     }

//     // Step 3: Fetch logs for stats calculation (without pagination)
//     const allLogs = await CallLogModel.find(filter);

//     const stats = {
//       totalCalls: allLogs.length,
//       agentAnswered: 0,
//       callerNoAnswer: 0,
//       failed: 0,
//       agentNoAnswer: 0,
//       callerAnswered: 0,
//       callMissed: 0,
//     };

//     for (const log of allLogs) {
//       const status = log.call_status?.toLowerCase();
//       const type = log.call_type?.toLowerCase();

//       if (status === "answered") {
//         if (type === "incoming") {
//           stats.callerAnswered += 1;
//         } else if (type === "outgoing") {
//           stats.agentAnswered += 1;
//         }
//       } else if (status === "caller_no_answer") {
//         stats.callerNoAnswer += 1;
//       } else if (status === "agent_no_answer") {
//         stats.agentNoAnswer += 1;
//       } else if (status === "call missed") {
//         stats.callMissed += 1;
//       } else {
//         stats.failed += 1;
//       }
//     }

//     // Step 4: Pagination
//     const skip = page && limit ? (parseInt(page) - 1) * parseInt(limit) : 0;
//     const paginatedLogs = page && limit
//       ? await CallLogModel.find(filter)
//           .skip(skip)
//           .limit(parseInt(limit))
//           .sort({ createdAt: -1 })
//       : allLogs;

//     // Step 5: Join candidate + interviewer info from InterviewDetail
//     const enrichedLogs = paginatedLogs.map((log) => {
//       const matchingInterview = interviews.find(
//         (i) => i.callResult?.unique_id === log.unique_id
//       );

//       return {
//         ...log.toObject(),
//         candidate: matchingInterview?.candidateId || null,
//         interviewer: matchingInterview?.interviewerId || null,
//       };
//     });

//     const totalLogs = allLogs.length;
//     const totalPages =
//       page && limit ? Math.ceil(totalLogs / parseInt(limit)) : null;

//     return success(res, "Dashboard data with filters & pagination", {
//       ...stats,
//       logs: enrichedLogs,
//       totalLogs,
//       totalPages,
//       currentPage: page ? parseInt(page) : null,
//     });
//   } catch (err) {
//     console.error("Error in getCallDashboardStats:", err);
//     return unknownError(res, err.message);
//   }
// };

export const getCallDashboardStats = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    if (!organizationId) return badRequest(res, "organizationId is required in headers.");

    // Extract filters from query
    const {
      search = "",
      startDate,
      endDate,
      agent,
      status,
      minDuration,
      maxDuration,
      candidate,
      interviewer,
      page = 1,
      limit = 10,
    } = req.query;

    const interviewFilter = { organizationId };

    // ✅ Apply candidate/interviewer filters
    if (candidate) interviewFilter.candidateId = candidate;
    if (interviewer) interviewFilter.interviewerId = interviewer;

    // Fetch InterviewDetails to get valid unique_ids (with populated candidate & interviewer)
    const interviews = await InterviewDetailModel.find(interviewFilter)
      .select("callResult.unique_id candidateId interviewerId")
      .populate({
        path: "candidateId",
        select: "name emailId",
      })
      .populate({
        path: "interviewerId",
        select: "userName email",
      });

    const uniqueIds = interviews.map((s) => s.callResult?.unique_id).filter(Boolean);
    const interviewMap = {};
    interviews.forEach((item) => {
      if (item.callResult?.unique_id) {
        interviewMap[item.callResult.unique_id] = item;
      }
    });

    // Build call log filter
    const filter = {
      unique_id: { $in: uniqueIds },
    };

    if (status) {
      filter.call_status = new RegExp("^" + status + "$", "i");
    }

    if (agent) {
      filter.received_id = agent;
    }

    if (search) {
      filter.$or = [
        { caller_id: { $regex: search, $options: "i" } },
        { received_id: { $regex: search, $options: "i" } },
        { ivr_number: { $regex: search, $options: "i" } },
        { call_type: { $regex: search, $options: "i" } },
        { call_status: { $regex: search, $options: "i" } },
        { unique_id: { $regex: search, $options: "i" } },
      ];
    }

    // Handle startDate and endDate
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      }
    }

    if (minDuration || maxDuration) {
      filter.duration = {};
      if (minDuration) filter.duration.$gte = minDuration;
      if (maxDuration) filter.duration.$lte = maxDuration;
    }

    // Get all logs for dashboard stats (regardless of pagination)
    const allLogs = await CallLogModel.find(filter);

    const stats = {
      totalCalls: allLogs.length,
      agentAnswered: 0,
      callerNoAnswer: 0,
      failed: 0,
      agentNoAnswer: 0,
      callerAnswered: 0,
      callMissed: 0,
    };

    for (const log of allLogs) {
      const status = log.call_status?.toLowerCase();
      const type = log.call_type?.toLowerCase();

      if (status === "answered") {
        if (type === "incoming") {
          stats.callerAnswered += 1;
        } else if (type === "outgoing") {
          stats.agentAnswered += 1;
        }
      } else if (status === "caller_no_answer") {
        stats.callerNoAnswer += 1;
      } else if (status === "agent_no_answer") {
        stats.agentNoAnswer += 1;
      } else if (status === "call missed") {
        stats.callMissed += 1;
      } else {
        stats.failed += 1;
      }
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedLogs = await CallLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

    // Enrich logs with candidate & interviewer info
    const enrichedLogs = paginatedLogs.map((log) => {
      const matchingInterview = interviewMap[log.unique_id];

      return {
        ...log.toObject(),
        candidate: matchingInterview?.candidateId
          ? {
            _id: matchingInterview.candidateId._id,
            name: matchingInterview.candidateId.name,
            email: matchingInterview.candidateId.emailId,
          }
          : null,
        interviewer: matchingInterview?.interviewerId
          ? {
            _id: matchingInterview.interviewerId._id,
            userName: matchingInterview.interviewerId.userName,
            email: matchingInterview.interviewerId.email,
          }
          : null,
      };
    });

    const totalLogs = allLogs.length;
    const totalPages = Math.ceil(totalLogs / limit);

    return success(res, "Dashboard data with filters & pagination", {
      ...stats,
      logs: enrichedLogs,
      totalLogs,
      totalPages,
      currentPage: Number(page),
    });
  } catch (err) {
    console.error("Error in getCallDashboardStats:", err);
    return unknownError(res, err.message);
  }
};


export const getInterviewScheduleCalender = async (req, res) => {
  try {
    const { organizationId, id } = req.employee;
    const { status, startDate, endDate, allDataShow } = req.query;

    if (!organizationId || !startDate || !endDate) {
      return badRequest(res, "Missing required fields");
    }

    const statusArray = status ? status.split(",") : null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    end.setHours(23, 59, 59, 999);

    const filters = [
      { organizationId: new ObjectId(organizationId) },
      { scheduleDate: { $gte: start, $lte: end } }
    ];
    if (allDataShow !== "all") {
      filters.push({ interviewerId: new ObjectId(id) });
    }


    if (statusArray) {
      filters.push({ status: { $in: statusArray } });
    }

    const interviews = await InterviewDetailModel.aggregate([
      { $match: { $and: filters } },
      {
        $lookup: {
          from: "employees",
          localField: "interviewerId",
          foreignField: "_id",
          as: "interviewer"
        }
      },
      {
        $unwind: {
          path: "$interviewer",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          status: 1,
          scheduleDate: 1,
          durationMinutes: 1,
          "interviewer._id": 1,
          "interviewer.employeName": 1,
          "interviewer.userName": 1
        }
      }
    ]);

    const result = interviews.reduce((acc, interview) => {
      const date = new Date(interview.scheduleDate);
      const year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "long" });
      const day = date.getDate();

      // Initialize year, month, and day levels
      if (!acc[year]) acc[year] = {};
      if (!acc[year][month]) acc[year][month] = {};
      if (!acc[year][month][day]) {
        acc[year][month][day] = {
          interviews: [],
          counts: {}
        };
      }

      // Add interview to list
      acc[year][month][day].interviews.push(interview);

      // Update status count
      const status = interview.status || "Unknown";
      acc[year][month][day].counts[status] = (acc[year][month][day].counts[status] || 0) + 1;

      return acc;
    }, {});
    return success(res, "Interview Calendar Detail", result);
  } catch (err) {
    console.error(err);
    return unknownError(res, "Internal server error", err);
  }
};

import Emailuser from '../../models/UserEmail/user.js';

export async function getGoogleClientByEmail(email) {
  if (!email) throw new Error('email is required');

  /* 1️⃣  Look up the user */
  const user = await Emailuser.findOne({ email });
  if (!user) throw new Error(`Emailuser not found for ${email}`);
  if (!user.refreshToken)
    throw new Error('No refreshToken on file – user must re‑authorize with prompt:"consent".');

  /* 2️⃣  Token still fresh? → fast‑path */
  const LEEWAY_MS = 60_000;                               // 60‑s safety net
  if (
    user.accessToken &&
    user.expiryDate &&
    user.expiryDate > Date.now() + LEEWAY_MS
  ) {
    const oauth2 = buildClient(user);                     // helper below
    return { oauth2, user };
  }

  /* 3️⃣  Token missing / expiring → refresh */
  const oauth2 = buildClient(user);

  // Persist whatever Google rotates in
  oauth2.on('tokens', async t => {
    const patch = {
      ...(t.access_token && { accessToken: t.access_token }),
      ...(t.refresh_token && { refreshToken: t.refresh_token }),
      ...(t.expiry_date && { expiryDate: t.expiry_date }),
    };
    if (Object.keys(patch).length) {
      await Emailuser.findByIdAndUpdate(user._id, patch).catch(console.error);
      Object.assign(user, patch);                          // keep local copy fresh
    }
  });

  await oauth2.getAccessToken();                           // forces refresh
  return { oauth2, user };
}

/* ────────────────────────────────────────────────────────────── helpers ── */

function buildClient({ refreshToken, accessToken, expiryDate }) {
  const oauth2 = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
  oauth2.setCredentials({
    refresh_token: refreshToken,
    access_token: accessToken,
    expiry_date: expiryDate,
  });
  return oauth2;
}




// export const candidateLastRoundReview = async (req, res) => {
//   try {
//     const { startDate = "all", endDate = "all", status } = req.query;
//     const matchConditions = {};
//     if (startDate !== "all" && endDate !== "all") {
//       matchConditions.scheduleDate = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     }

//     if (status) {
//       const statusArray = status.split(",");
//       matchConditions.status = { $in: statusArray };
//     }
//     const result = await InterviewDetailModel.aggregate([
//       { $match: matchConditions },
//       { $sort: { updatedAt: -1 } },
//       {
//         $group: {
//           _id: "$candidateId",
//           lastRound: { $first: "$$ROOT" }
//         }
//       },
//       { $replaceRoot: { newRoot: "$lastRound" } },

//       {
//         $lookup: {
//           from: "jobapplyforms",
//           localField: "candidateId",
//           foreignField: "_id",
//           as: "candidateData"
//         }
//       },
//       { $unwind: { path: "$candidateData", preserveNullAndEmptyArrays: true } },

//       {
//         $lookup: {
//           from: "employees",
//           localField: "interviewerId",
//           foreignField: "_id",
//           as: "interviewerData"
//         }
//       },
//       { $unwind: { path: "$interviewerData", preserveNullAndEmptyArrays: true } },

//       {
//         $project: {
//           candidateId: 1,
//           interviewerId: 1,
//           status: 1,
//           updatedAt: 1,
//           scheduleDate: 1,
//           roundNumber: 1,
//           roundName: 1,
//           description: 1,
//           interviewType: 1,
//           feedback: 1,
//           skillsFeedback: 1,
//           candidate: {
//             name: "$candidateData.name",
//             candidateUniqueId: "$candidateData.candidateUniqueId"
//           },
//           interviewer: {
//             employeeName: "$interviewerData.employeName",
//             userName: "$interviewerData.userName"
//           }
//         }
//       }
//     ]);

//     return success(res, "Candidates Schedule Interview Details", {
//       data: result,
//     });
//   } catch (err) {
//     console.error("Error :", err);
//     return unknownError(res, "Internal Server Error");
//   }
// };


export const candidateLastRoundReview = async (req, res) => {
  try {
    const {
      startDate = "all",
      endDate = "all",
      status,
      // page = 1,
      // limit = 100,
      search='',
    } = req.query;

    const matchConditions = {};

    if (startDate !== "all" && endDate !== "all") {
      matchConditions.scheduleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (status && status !== "all") {
      const statusArray = status.split(",");
      matchConditions.status = { $in: statusArray };
    }

    // ----------- DASHBOARD COUNTS (for all data, not paginated) -----------
    const dashboardAggregation = await InterviewDetailModel.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          scheduledInterviews: {
            $sum: {
              $cond: [
                { $in: ["$status", ["schedule", "reSchedule"]] },
                1,
                0,
              ],
            },
          },
          completedInterviews: {
            $sum: {
              $cond: [{ $eq: ["$status", "complete"] }, 1, 0],
            },
          },
          canceledInterviews: {
            $sum: {
              $cond: [{ $eq: ["$status", "cancel"] }, 1, 0],
            },
          },
          runningInterviews: {
            $sum: {
              $cond: [{ $eq: ["$status", "running"] }, 1, 0],
            },
          },
          pendingInterviews: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
        },
      },
      { $project: { _id: 0 } },
    ]);

    const dashboardCounts = dashboardAggregation[0] || {
      totalInterviews: 0,
      scheduledInterviews: 0,
      completedInterviews: 0,
      canceledInterviews: 0,
      runningInterviews: 0,
      pendingInterviews: 0,
    };

    // ----------- CANDIDATE LAST ROUND DATA (paginated) -----------
    const pipeline = [
      { $match: matchConditions },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: "$candidateId",
          lastRound: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$lastRound" } },

      {
        $lookup: {
          from: "jobapplyforms",
          localField: "candidateId",
          foreignField: "_id",
          as: "candidateData"
        }
      },
      { $unwind: { path: "$candidateData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "employees",
          localField: "interviewerId",
          foreignField: "_id",
          as: "interviewerData"
        }
      },
      { $unwind: { path: "$interviewerData", preserveNullAndEmptyArrays: true } },

...(search ? [{
  $match: {
    $or: [
      { "candidateData.name": { $regex: search, $options: "i" } },
      { "candidateData.candidateUniqueId": { $regex: search, $options: "i" } },
      { "interviewerData.employeName": { $regex: search, $options: "i" } },
      { "interviewerData.userName": { $regex: search, $options: "i" } }
    ]
  }
}] : []),

      {
        $lookup: {
          from: "interviewdetails", // same collection
          localField: "candidateId",
          foreignField: "candidateId",
          as: "allInterviews"
        }
      },

      {
        $addFields: {
          totalInterviews: { $size: "$allInterviews" },
          scheduledInterviews: {
            $size: {
              $filter: {
                input: "$allInterviews",
                as: "interview",
                cond: {
                  $in: ["$$interview.status", ["schedule", "reSchedule"]]
                }
              }
            }
          },
          completedInterviews: {
            $size: {
              $filter: {
                input: "$allInterviews",
                as: "interview",
                cond: { $eq: ["$$interview.status", "complete"] }
              }
            }
          },
          canceledInterviews: {
            $size: {
              $filter: {
                input: "$allInterviews",
                as: "interview",
                cond: { $eq: ["$$interview.status", "cancel"] }
              }
            }
          },
          runningInterviews: {
            $size: {
              $filter: {
                input: "$allInterviews",
                as: "interview",
                cond: { $eq: ["$$interview.status", "running"] }
              }
            }
          },
          pendingInterviews: {
            $size: {
              $filter: {
                input: "$allInterviews",
                as: "interview",
                cond: { $eq: ["$$interview.status", "pending"] }
              }
            }
          }
        }
      },

      {
        $project: {
          candidateId: 1,
          interviewerId: 1,
          status: 1,
          updatedAt: 1,
          scheduleDate: 1,
          roundNumber: 1,
          roundName: 1,
          description: 1,
          interviewType: 1,
          interviewModel:1,
          feedback: 1,
          skillsFeedback: 1,
          candidate: {
            name: "$candidateData.name",
            candidateUniqueId: "$candidateData.candidateUniqueId"
          },
          interviewer: {
            employeeName: "$interviewerData.employeName",
            userName: "$interviewerData.userName"
          },
          totalInterviews: 1,
          scheduledInterviews: 1,
          completedInterviews: 1,
          canceledInterviews: 1,
          runningInterviews: 1,
          pendingInterviews: 1
        }
      }
    ];

    // Total result count before pagination
    const fullResult = await InterviewDetailModel.aggregate(pipeline);
    const totalCandidates = fullResult.length;

    // Apply pagination
    const paginatedResult = await InterviewDetailModel.aggregate([
      ...pipeline,
      // { $skip: (parseInt(page) - 1) * parseInt(limit) },
      // { $limit: parseInt(limit) }
    ]);

    return success(res, "Candidates Schedule Interview Details", {
      dashboardCounts,
      totalCandidates,
      // page: parseInt(page),
      // limit: parseInt(limit),
      data: paginatedResult
    });

  } catch (err) {
    console.error("Error :", err);
    return unknownError(res, "Internal Server Error");
  }
};


