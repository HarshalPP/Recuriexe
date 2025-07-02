import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { google } from "googleapis";
import screeningresultModel from "../../models/screeningResultModel/screeningResult.model.js"
import InterviewDetailModel from "../../models/InterviewDetailsModel/interviewdetails.model.js";
import JobApplyForm from "../../models/jobformModel/jobform.model.js";
import jobPostModel from "../../models/jobPostModel/jobPost.model.js";
import Employee from "../../models/employeemodel/employee.model.js";
import OrganizationModel from "../../models/organizationModel/organization.model.js";
import {
    success,
    badRequest,
    notFound,
    unknownError,
} from "../../formatters/globalResponse.js";


//  const CLIENT_ID="872671367575-jg9vohru7bc7cj22iitp617iascb9pjn.apps.googleusercontent.com"
// const REDIRECT_URI="https://finexe.fincooper.in/callback"
// const ACCESS_TOKEN="ya29.a0AeXRPp5zHWCRNeYdt8Ppy-5885VUaHtB5HIocDgrnaVwSc_gOs5zhpODFE8PYjIh_U6nA6kecQvRB1xes8Y6kLrnjyPiW9R8xe7bKgH1ojx2arFWBjEdn4Gytwmvjmf4xDJNqzTZS0-PR5nXXuzKXArYLi3FIlF25Kr3EgX1aCgYKASUSARASFQHGX2MiJmfv90mN-q4k-wAy7uW0TQ0175"
// const REFRESH_TOKEN="1//0gNOPs9nx_5veCgYIARAAGBASNwF-L9IrRdWAA9LjQgzoL2hciELQpx93lM3jqeIgBa6VwxM-n-jkvAhHX8hN07z1dxJHWO4NAnQ"
// const EXPIRY_DATE="3599"
// const CLIENT_SECRET="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"

const GOOGLE_CLIENT_ID='872671367575-jg9vohru7bc7cj22iitp617iascb9pjn.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET='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'
const REDIRECT_URI='https://finexe.fincooper.in/callback'
const CLIENT_ID='872671367575-jg9vohru7bc7cj22iitp617iascb9pjn.apps.googleusercontent.com'
const CLIENT_SECRET='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'
const ACCESS_TOKEN='ya29.a0AS3H6Nze4Ivb-PTC5MleGCuPLExQ0u399XCZc9nz2AZ2njcGWvc8rghpiltIhrT1gHrixa8LPqOGxip2N_00Zfn0Q1kz2Y3S4pAwzOmua1sxfX1eiRsCbMOXEeEgSnTqVLkgwShp2A5oNjtDgs2Rq7f8eiKrmfv8pPInFaUBaCgYKAS0SARASFQHGX2MiHz62IteppY64ZTlocrxTmQ0175'
const REFRESH_TOKEN='1//0gCRpUj6-Bt_ICgYIARAAGBASNwF-L9IrofH_1PmPml0lVdRsmahXJnYHa2GCxj8PEcnz3X167UtSQTI-xdW_zeVCRqqF6bl8KyM'
const EXPIRY_DATE='1751440014544'

/* ───────────────────────────── 1.  Add / schedule ─────────────────────────── */
// export const addInterview = async (req, res) => {
//     try {
//         const { organizationId } = req.employee || {};

//         if (!organizationId) return badRequest(res, "Invalid token – organizationId missing");

//         const {
//             candidateId,
//             interviewerId,
//             interviewModel,
//             interviewType,
//             scheduleDate,
//             durationMinutes,
//             roundName = "",
//             feedback = "",
//             skillsFeedback = [],
//         } = req.body;

//         if (!candidateId || !interviewerId)
//             return badRequest(res, "candidateId & interviewerId are required");

//         if (!interviewModel || !interviewType)
//             return badRequest(res, "interviewModel & interviewType are required");


//         const baseTime = new Date(scheduleDate);
//         if (isNaN(baseTime.getTime())) {
//             return badRequest(res, "Invalid Schedule Date");
//         }
//         const completedRounds = await InterviewDetailModel.countDocuments({
//             organizationId,
//             candidateId,
//             status: "complete",
//         });

//         const newInterview = await InterviewDetailModel.create({
//             organizationId,
//             candidateId,
//             interviewerId,
//             interviewModel,
//             interviewType,
//             roundNumber: completedRounds + 1,
//             roundName,
//             scheduleDate,
//             durationMinutes,
//             feedback,
//             skillsFeedback,
//         });

//         return success(res, "Interview scheduled", newInterview);
//     } catch (err) {
//         console.error("addInterview:", err);
//         return unknownError(res, err);
//     }
// };

export const addInterview1 = async (req, res) => {
    try {
        const { organizationId } = req.employee || {};
        if (!organizationId)
            return badRequest(res, "Invalid token – organizationId missing");

        const {
            candidateId,
            interviewerId,
            interviewModel,
            interviewType,
            scheduleDate,
            durationMinutes,
            roundName = "",
            feedback = "",
            skillsFeedback = [],
            status,
        } = req.body;

        if (!candidateId || !interviewerId)
            return badRequest(res, "candidateId & interviewerId are required");

        const latestInterview = await InterviewDetailModel
            .findOne({ organizationId, candidateId })
            .sort({ createdAt: -1 })
            .lean();

        let finalInterviewModel = interviewModel;
        let finalInterviewType = interviewType;

        if (latestInterview) {
            finalInterviewModel = interviewModel ? interviewModel : latestInterview.interviewModel;
            finalInterviewType = interviewType ? interviewType : latestInterview.interviewType;
        } else {
            if (!interviewModel || !interviewType) {
                return badRequest(
                    res,
                    "interviewModel & interviewType are required for the first round"
                );
            }
        }

        if (status === "schedule") {
            if (!scheduleDate || !durationMinutes) {
                return badRequest(
                    res,
                    "Duration & ScheduleDate Are Required"
                );
            }
        }

        let baseTime;
        if (scheduleDate) {
            baseTime = new Date(scheduleDate);
            if (isNaN(baseTime.getTime()))
                return badRequest(res, "Invalid scheduleDate");
        }

        const completedRounds = await InterviewDetailModel.countDocuments({
            organizationId,
            candidateId,
            status: "complete",
        });

        const newInterview = await InterviewDetailModel.create({
            organizationId,
            candidateId,
            interviewerId,
            interviewModel: finalInterviewModel,
            interviewType: finalInterviewType,
            roundNumber: completedRounds + 1,
            roundName,
            scheduleDate: scheduleDate ? baseTime : null,
            durationMinutes,
            feedback,
            skillsFeedback,
            status,
        });

        // ✅ NEW: Add scheduleLink if Online interview
        if (finalInterviewType === "Online" && baseTime) {
            const jobApplyForm = await JobApplyForm.findById(candidateId);
            const organization = await OrganizationModel.findById(organizationId);
            const employee = await Employee.findById(interviewerId);

            if (jobApplyForm && organization && employee) {
                const meetLink = await generateInterviewLink({
                    date: baseTime.toISOString().split("T")[0],
                    time: baseTime.toTimeString().slice(0, 5),
                    durationMinutes:durationMinutes,
                    candidateEmail: jobApplyForm.emailId,
                    candidateName: jobApplyForm.name,
                    jobTitle: jobApplyForm.position,
                    companyName: organization.name || "",
                    interviewerName: employee.employeName || employee.userName || "",
                    // interviewerEmail:"darshanrajput@fincoopers.in",
                    // organizerName:"fincooper tech",
                });

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

export const addInterview = async (req, res) => {
    try {
        const { organizationId } = req.employee || {};
        if (!organizationId)
            return badRequest(res, "Invalid token – organizationId missing");

        const {
            candidateId,
            interviewerId,
            interviewModel,
            interviewType,
            scheduleDate,
            durationMinutes,
            roundName = "",
            feedback = "",
            skillsFeedback = [],
            status,
        } = req.body;

        if (!candidateId || !interviewerId)
            return badRequest(res, "candidateId & interviewerId are required");

        const latestInterview = await InterviewDetailModel
            .findOne({ organizationId, candidateId })
            .sort({ createdAt: -1 })
            .lean();

        let finalInterviewModel = interviewModel;
        let finalInterviewType = interviewType;

        if (latestInterview) {
            finalInterviewModel = interviewModel ? interviewModel : latestInterview.interviewModel;
            finalInterviewType = interviewType ? interviewType : latestInterview.interviewType;
        } else {
            if (!interviewModel || !interviewType) {
                return badRequest(
                    res,
                    "interviewModel & interviewType are required for the first round"
                );
            }
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

        const completedRounds = await InterviewDetailModel.countDocuments({
            organizationId,
            candidateId,
            status: "complete",
        });

        const newInterview = await InterviewDetailModel.create({
            organizationId,
            candidateId,
            interviewerId,
            interviewModel: finalInterviewModel,
            interviewType: finalInterviewType,
            roundNumber: completedRounds + 1,
            roundName,
            scheduleDate: scheduleDate ? baseTime : null,
            durationMinutes,
            feedback,
            skillsFeedback,
            status,
        });

        // ✅ Generate meet link for Online interviews
        if (finalInterviewType === "Online" && baseTime) {
            const jobApplyForm = await JobApplyForm.findById(candidateId);
            const organization = await OrganizationModel.findById(organizationId);
            const employee = await Employee.findById(interviewerId);

            if (jobApplyForm && organization && employee) {
                const meetLink = await generateInterviewLink({
                    date: baseTime.toISOString().split("T")[0],
                    time: baseTime.toTimeString().slice(0, 5),
                    durationMinutes,
                    candidateEmail: jobApplyForm.emailId,
                    candidateName: jobApplyForm.name,
                    jobTitle: jobApplyForm.position,
                    companyName: organization.name || "",
                    interviewerName: employee.employeName || employee.userName || "",
                });

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
      roundName = "",
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

    /* 4. handle scheduleDate (if supplied) */
    if (req.body.scheduleDate) {
      const newDate = new Date(req.body.scheduleDate);
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

    if (interview.interviewType === "Online" && interview.scheduleDate) {
      const meetLink = await generateInterviewLink({
        date: interview.scheduleDate.toISOString().split("T")[0],
        time: interview.scheduleDate.toTimeString().slice(0, 5), // HH:MM
        durationMinutes:req.body.durationMinutes,
        candidateEmail: jobApplyForm.emailId,
        candidateName: jobApplyForm.name,
        jobTitle: jobApplyForm.position,
        companyName: organization?.name || "",
        interviewerName: employee?.employeName || employee?.userName || "",
      });
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




/* ───────────────────────────── 2.  all schedule interview details ─────────────────────────────────── */
export const allInterViewDetail = async (req, res) => {
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



const OAuth2 = google.auth.OAuth2;
const oAuth2Client = new OAuth2(
    CLIENT_ID,
   CLIENT_SECRET,
   REDIRECT_URI
);


const loadTokens = async () => {
    // const { ACCESS_TOKEN, REFRESH_TOKEN, EXPIRY_DATE } = process.env;
    const tokens = {
        access_token: ACCESS_TOKEN,
        refresh_token: REFRESH_TOKEN,
        expiry_date: Number(EXPIRY_DATE || 0),
    };
    oAuth2Client.setCredentials(tokens);
    return tokens;
};

const saveTokens = async (tokens) => {
    process.env.ACCESS_TOKEN = tokens.access_token;
    process.env.REFRESH_TOKEN = tokens.refresh_token;
    process.env.EXPIRY_DATE = String(tokens.expiry_date);
};

const refreshAccessTokenIfNeeded = async () => {
    const { expiry_date } = await loadTokens();
    const now = Date.now();

    if (now >= expiry_date - 60_000) {
        console.log("Refreshing Google access token...");
        const { credentials } = await oAuth2Client.refreshAccessToken();
        await saveTokens(credentials);
        oAuth2Client.setCredentials(credentials);
    }
};


async function generateInterviewLink(opts) {
    const {
        date,
        time,
        candidateEmail,
        candidateName,
        jobTitle,
        companyName,
        interviewerName,
    } = opts;

    console.log("interview detail",date,
        time,
        candidateEmail,
        candidateName,
        jobTitle,
        companyName,
        interviewerName)
    await refreshAccessTokenIfNeeded();
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
          sendUpdates: "all",   
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
    const { interviewType, interviewModel, page = 1, limit = 10 } = req.query;

    if (!organizationId) {
      return badRequest(res, "Missing organizationId in token");
    }

    const filter = {
      organizationId,
      status: "schedule"
    };

    if (interviewType) {
      // Corrected variable name
      filter.interviewType = new RegExp("^" + interviewType + "$", "i");
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
          select: "name emailId mobileNumber position"
        })
        .populate({
          path: "interviewerId",
          select: "userName workEmail mobileNo"
        })
        .sort({ scheduleDate: 1 })
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
