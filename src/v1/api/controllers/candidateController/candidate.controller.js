import {
    success,
    unknownError,
    serverValidation,
    badRequest
  } from "../../formatters/globalResponse.js"
  import { validationResult } from "express-validator";
  import jobApplyFormModel from "../../models/jobformModel/jobform.model.js"
  import interviewDetailsModel from "../../models/InterviewDetailsModel/interviewdetails.model.js"
  import mailsToCandidatesModel from "../../models/mailsendCandidate/sendEmailcandidate.model.js"
  import employeModel from "../../models/employeemodel/employee.model.js"
  import{hrmsSendEmail} from "../../services/emailservices/email.services.js"
  import mongoose from "mongoose";
import { UnknownError } from "postmark/dist/client/errors/Errors.js";
import {offerLetterPDF , generateOfferLetterPDF , generateOfferLetterPDF1}  from "../../pdfhandler/offerletterpdf.js"
import bcrypt from "bcrypt"
import mailSwitchModel from "../../models/mailModel/mailSwitch.model.js"


  // Schdeule Interview //

  export const scheduleHrInterview = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const { jobFormId, mode, interviewDate, interviewTime, location, interviewer , status } = req.body;
  const organizationId = req.employee.organizationId
      if (!jobFormId || !mongoose.Types.ObjectId.isValid(jobFormId)) {
        return badRequest(res, "Valid Job Form ID is required.");
      }
  
      const candidate = await jobApplyFormModel.findById(jobFormId);
      if (!candidate) return badRequest(res, "Candidate not found.");

      if(candidate.status=="shortlisted"){
        return badRequest(res , "candidate is shortlisted , Can't schedule Interview.")
      }
  
      const hrUser = await employeModel.findById(req.employee.id);
      if (!hrUser) return badRequest(res, "HR or Manager not found");
  
      const toEmails = candidate.emailId;
      const ccEmails = [hrUser.workEmail, process.env.HR3_EMAIL];
      const company = "Fin Coopers";
      const interviewLocation = location || "Fin Coopers";
      let meetLink = "";
      let interviewDetailsHTML = "";
  
      // Format Interview Mode
      if (mode === "online") {
        meetLink = await createGoogleMeetLink(
          interviewDate,
          interviewTime,
          candidate.emailId,
          candidate.name,
          candidate.position,
          company,
          interviewer,
          ccEmails
        );
  
        interviewDetailsHTML = `
          <strong>Google Meet Link:</strong><br>
          <a href="${meetLink}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #1a73e8; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Join Meeting
          </a><br>`;
      } else if (mode === "offline") {
        interviewDetailsHTML = `<strong>Location:</strong> ${interviewLocation}<br>`;
      } else if (mode === "call") {
        interviewDetailsHTML = `Our HR team will connect with you over the phone soon.`;
      } else {
        return badRequest(res, "Invalid mode. Allowed values: online, offline, call.");
      }
  
      // Email Body
      const emailBody = `
      <table style="width: 100%; max-width: 600px; margin: auto; border-collapse: collapse; background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd;">
        <tr>
          <td style="padding: 20px; text-align: left;">
            <p style="color: #555;">Dear ${candidate.name},</p>
            <p style="color: #555;">
              Thank you for your application for the <strong>${candidate.position}</strong> role at <strong>${company}</strong>.
              We are pleased to inform you that you have been shortlisted for an HR interview.
            </p>
            <p style="color: #555;"><strong>Interview Details:</strong></p>
            <p style="color: #555;">
              <strong>Date:</strong> ${interviewDate}<br>
              <strong>Time:</strong> ${interviewTime}<br>
              ${interviewDetailsHTML}
              <strong>Interviewer:</strong> ${hrUser.employeName}
            </p>
            <p style="color: #555;">
              Please confirm your availability. If you have questions, reply to this email.
            </p>
            <p style="color: #555;">
              Best regards,<br>
              HR Department<br>
              hr@fincoopers.com
            </p>
          </td>
        </tr>
      </table>`;
  
      // Send email

      
      const interviewSchedule = await mailSwitchModel.findOne({organizationId:new mongoose.Types.ObjectId(organizationId)});
              if (interviewSchedule?.masterMailStatus && interviewSchedule?.hrmsMail.hrmsMail && interviewSchedule?.hrmsMail.interviewSchedule) {
                const data =  await hrmsSendEmail(
                  toEmails,
                  ccEmails,
                  "Invitation: HR Interview Schedule at Fin Coopers",
                  emailBody,
                  ""
                );
              }

                // Log the mail
                await mailsToCandidatesModel.create({
                  recipient: toEmails,
                  subject: "Invitation: HR Interview Schedule at Fin Coopers",
                  body: emailBody,
                  jobApplyFormId:req.body.jobFormId,
                });




      // console.log("data" , data)
      // Determine Interview Round
let lastRound = await interviewDetailsModel
.findOne({ jobApplyFormId: jobFormId })
.sort({ createdAt: -1 }); // Or use a `round` field and sort by that

let newRound = lastRound?.interviewRound ? lastRound.interviewRound + 1 : 1;
  
      // Create Interview Record
      const interviewEntry = await interviewDetailsModel.create({
        interviewDate,
        interviewTime,
        mode,
        location: interviewLocation,
        googleLink: meetLink,
        interviewerId: req.employee.id,
        managerId:req.body.managerId,
        jobApplyFormId: req.body.jobFormId,
        availability: "available",
        interviewEventCreated: "created",
        interviewBy: req.body.interviewBy,
        feedback: "", // future feedback field
        status: "scheduled",
        interviewRound: newRound, 
        interviewer:req.body.interviewer
      });
  

      // console.log("status" , status)
  
      // Update Job Apply Form
      await jobApplyFormModel.findByIdAndUpdate(
        jobFormId,
        {
          hrInterviewSchedule: "scheduled",
          resumeShortlisted: "shortlisted",
          status: status || "active",
          $push: { InterviewDetailsIds: interviewEntry._id },
        },
        { new: true }
      );
  
      return success(res, "Interview scheduled", interviewEntry);
    } catch (error) {
      console.error("Interview Scheduling Error:", error);
      return unknownError(res, error);
    }
  };


  // Update Feedback //

  export const UpdateInterviewfeedback = async (req, res) => {
    try {
      const { jobApplyFormId , ID } = req.body;
      const interviewerId = req.employee.id;
  
      if (!jobApplyFormId || !interviewerId) {
        return res.status(400).json({ message: "Missing required identifiers." });
      }
  
      // Corrected: pass the actual ID
      const findJob = await jobApplyFormModel.findById(jobApplyFormId);
      if (!findJob) {
        return badRequest(res, "Job form not found");
      }
  
      // Validate interview exists
      const interview = await interviewDetailsModel.findOne({
        _id:ID,
        jobApplyFormId
      });
  
      if (!interview) {
        return badRequest(res, "Interview not found");
      }
  
      // Corrected: conditional logic
      if (
        findJob.hrInterviewSchedule !== "scheduled" ||
        findJob.resumeShortlisted !== "shortlisted"
      ) {
        return badRequest(
          res,
          "Interview is not scheduled or Resume is not shortlisted"
        );
      }
  
      if (["accept", "reject"].includes(interview.hireCandidate)) {
        return res
          .status(403)
          .json({ message: "Feedback already finalized." });
      }
  
      const {
        feedbackBy,
        interviewTaken,
        furtherProcessProfile,
        remark,
        candidateReview,
        skillReview,
        hireCandidate,
        note,
      } = req.body;
  
      // Update feedback fields
      interview.feedbackBy = feedbackBy || interview.feedbackBy;
      interview.interviewTaken = interviewTaken || interview.interviewTaken;
      interview.furtherProcessProfile =
        furtherProcessProfile || interview.furtherProcessProfile;
      interview.remark = remark || interview.remark;
      interview.candidateReview = candidateReview || interview.candidateReview;
      interview.skillReview = skillReview || interview.skillReview;
      interview.hireCandidate = hireCandidate || interview.hireCandidate;
      interview.note = note || interview.note;
  
      await interview.save();
  
      return success(res, "Feedback updated successfully", interview);
    } catch (error) {
      console.error("Update feedback error:", error);
      return UnknownError(res, "Internal Server Error");
    }
  };
  


// change status of candidate //
export const jobApplyFormStatusChange = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { ids, status, reason } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return badRequest(res, "IDs should be a non-empty array");
    }

    for (const id of ids) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, `Invalid ID: ${id}`);
      }
    }

    const validStatuses = [
      "hold",
      "shortlisted",
      "managerReview",
      "shortlistedBYManager",
      "reject"
    ];

    if (!status || !validStatuses.includes(status)) {
      return badRequest(
        res,
        "Status must be one of: 'hold', 'shortlisted', 'managerReview', 'shortlistedBYManager', or 'reject'"
      );
    }

    const candidates = await jobApplyFormModel.find({ _id: { $in: ids } });
    if (candidates.length === 0) {
      return badRequest(res, "No valid candidates found for provided IDs");
    }

    // Build update data for all candidates
    const bulkOps = candidates.map((candidate) => {
      let resumeShortlisted;
      switch (status) {
        case "reject":
          resumeShortlisted = "notshortlisted";
          break;
        case "hold":
          resumeShortlisted = candidate.status === "active" ? "hold" : undefined;
          break;
        case "shortlisted":
          resumeShortlisted = "shortlisted";
          break;
        case "shortlistedBYManager":
          resumeShortlisted = "shortlisted";
          break;
        case "managerReview":
        default:
          resumeShortlisted = undefined;
      }

      const updateFields = {
        status,
        managerRevertReason: reason || null,
        rejectedById: req.employee?.id || null,
      };

      if (resumeShortlisted !== undefined) {
        updateFields.resumeShortlisted = resumeShortlisted;
      }

      return {
        updateOne: {
          filter: { _id: candidate._id },
          update: { $set: updateFields },
        },
      };
    });

    await jobApplyFormModel.bulkWrite(bulkOps);

    const updatedCandidates = await jobApplyFormModel.find({ _id: { $in: ids } });

    return success(res, `Job form(s) status updated to '${status}'`, updatedCandidates);
  } catch (error) {
    return unknownError(res, error);
  }
};

  //  Reschdeule Interview

  export const rescheduleHrInterview = async(req,res)=>{


    try {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }

      const { jobFormId, mode, location, interviewDate, interviewTime, interviewer , status } = req.body;
      const validModes = ["online", "offline", "call"];

      const organizationId = req.employee.organizationId
      if (!validModes.includes(mode)) {
        return badRequest(res, "Invalid mode. Mode must be 'online', 'offline', or 'call'");
      }

      if (!jobFormId || !mongoose.Types.ObjectId.isValid(jobFormId)) {
        return badRequest(res, "Invalid or missing Job Form ID");
      }

      const candidate = await jobApplyFormModel.findById(jobFormId);
      if (!candidate) return badRequest(res, "Candidate not found");



      
    if (candidate.hrInterviewSchedule == "scheduled" && candidate.candidateStatus == "reconsidered") {
      return badRequest(res, "HR Interview already scheduled");
    }
      

    const hr = await employeModel.findById(req.employee.id);
    const toEmails = candidate.emailId;
    const ccEmails = [hr.workEmail, process.env.HR3_EMAIL];
    const company = "Fin Coopers";


    let interviewDetailsHtml = "";
    let meetLink = null;

    if (mode === "online") {
      meetLink = await createGoogleMeetLink(
        interviewDate,
        interviewTime,
        candidate.emailId,
        candidate.name,
        candidate.position,
        company,
        interviewer,
        ccEmails
      );

      interviewDetailsHtml = `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <p style="font-size: 16px; font-weight: bold; color: #333;">Google Meet Link:</p>
          <a href="${meetLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #1a73e8; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Meeting</a>
        </div>
      `;
    } else if (mode === "offline") {
      interviewDetailsHtml = `<strong>Location:</strong> ${location || "Fin Coopers"}<br>`;
    }

    let emailMsg = `
      <table style="width: 100%; max-width: 600px; margin: auto; border-collapse: collapse; background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd;">
        <tr>
          <td style="padding: 20px; text-align: left;">
            <p style="color: #555;">Dear ${candidate.name},</p>
            <p style="color: #555;">We are pleased to inform you that your application has been reconsidered for the ${candidate.position} role at ${company}.</p>
            <p style="color: #555;"><strong>Interview Details:</strong></p>
            <p style="color: #555;">
              <strong>Date:</strong> ${interviewDate}<br>
              <strong>Time:</strong> ${interviewTime}<br>
              ${interviewDetailsHtml}
              <strong>Interviewer:</strong> ${hr.employeName}
            </p>
            <p style="color: #555;">Kindly confirm your availability for the above-mentioned date and time.</p>
            <p style="color: #555;">Best regards,<br>HR Department<br>hr@fincoopers.com</p>
          </td>
        </tr>
      </table>
    `;

    if (mode === "call") {
      emailMsg = `
        <table style="width: 100%; max-width: 600px; margin: auto; border-collapse: collapse; background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd;">
          <tr>
            <td style="padding: 20px; text-align: left;">
              <p>Dear ${candidate.name},</p>
              <p>We are pleased to inform you that your application has been reconsidered for the ${candidate.position} role at ${company}.</p>
              <p>Our HR team will contact you soon via phone for an HR interview round.</p>
              <p>Best regards,<br>HR Department<br>hr@fincoopers.com</p>
            </td>
          </tr>
        </table>
      `;
    }

        // Send email
        
       const reInterviewSchedule = await mailSwitchModel.findOne({organizationId:new mongoose.Types.ObjectId(organizationId)});
              if (reInterviewSchedule?.masterMailStatus && reInterviewSchedule?.hrmsMail.hrmsMail && reInterviewSchedule?.hrmsMail.reInterviewSchedule) {
                console.log('Sending email to HR:')
        await hrmsSendEmail(toEmails, ccEmails, "Invitation: HR Interview Schedule at Fin Coopers", emailMsg, "");
      }
      
        // Save mail record
        await new mailsToCandidatesModel({
      recipient: toEmails,
      subject: "Invitation: HR Interview Schedule at Fin Coopers",
      body: emailMsg,
      jobApplyFormId: jobFormId,
    }).save();



let lastRound = await interviewDetailsModel
.findOne({ jobApplyFormId: jobFormId })
.sort({ createdAt: -1 }); // Or use a `round` field and sort by that

let newRound = lastRound?.interviewRound ? lastRound.interviewRound + 1 : 1


      // Save interview details
      const interviewEntry = await interviewDetailsModel.create({
        interviewDate,
        interviewTime,
        mode,
        location: location || "Fin Coopers",
        googleLink: meetLink,
        interviewerId: req.employee.id,
        jobApplyFormId:req.body.jobFormId,
        availability: "available",
        interviewEventCreated: "created",
        interviewBy: "hr",
        status: "scheduled",
        interviewRound: newRound, 
        interviewer:req.body.interviewer
      });


      
    // Update candidate record
    await jobApplyFormModel.findByIdAndUpdate(
      jobFormId,
      {
        status: status || "active",
        hrInterviewSchedule: "scheduled",
        resumeShortlisted: "shortlisted",
        $push: { InterviewDetailsIds: interviewEntry._id },
        feedbackByHr: "active",
        interviewSchedule: "active",
        feedbackByInterviewer: "active",
        preOffer: "active",
        finCooperOfferLetter: "notgenerated",
        pathofferLetterFinCooper: null,
        approvalPayrollfinOfferLetter: "",
        postOffer: "active",
        candidateStatus: "reconsidered",
      },
    );


    return success(res, "HR interview scheduled successfully", interviewEntry);

    } catch (error) {
      return UnknownError(res , error)
    }

  }


  // Reject candidate List //

  export const getRejectedJobForms = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Default: page 1
      const limit = parseInt(req.query.limit) || 10; // Default: 10 items per page
      const skip = (page - 1) * limit;
  
      const filter = {
        status: { $in: ["hold", "reject"] },
        jobFormType: "request",
      };
  
      const [jobApplications, total] = await Promise.all([
        jobApplyFormModel
          .find(filter)
          .populate("branchId", "_id name status")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        jobApplyFormModel.countDocuments(filter),
      ]);
  
      const totalPages = Math.ceil(total / limit);
  
      return success(res, "Job forms fetched successfully", {
        jobApplications,
        pagination: {
          totalItems: total,
          totalPages,
          currentPage: page,
          pageSize: limit,
        },
      });
    } catch (error) {
      console.error("Error fetching rejected job forms:", error);
      return unknownError(res, error);
    }
  };
  


  // get Reporting Manager api //

  export const getAllReportingManager = async (req, res) => {
    try {
      // Step 1: Get unique reporting manager IDs from enrolled employees
      const managerIds = await employeModel.distinct("reportingManagerId", {
        reportingManagerId: { $ne: null },
        onboardingStatus: "enrolled",
      });
  
      // Step 2: Retrieve manager details
      const managersData = await employeModel.find({
        _id: { $in: managerIds },
      }).select("_id employeName status");
  
      const count = managersData.length;
  
      return success(res, "Successfully retrieved all reporting managers", {
        count,
        managersData,
      });
    } catch (error) {
      return unknownError(res, error);
    }
  };


  export const getAllEmployees = async (req, res) => {
    try {
      const employees = await employeModel.find({
        onboardingStatus: "enrolled",
        status: "active"
      }).select("_id employeName status"); // Select only specific fields
  
      const count = employees.length;
  
      return success(res, "Successfully retrieved all active enrolled employees", {
        count,
        employees,
      });
    } catch (error) {
      return unknownError(res, error);
    }
  };


  // get Employee By Id // 

  export const getEmployeeByid = async(req, res)=>{
    try {
      const {_id}=req.params;
      const findEmployee = await employeModel.findById(_id).select("_id employeName status"); 
      return success(res , "employee fetch successfully" , findEmployee)
      
    } catch (error) {
      return unknownError(res, error);
    }
  }



// send PreOffer Letter //
  export const sendPreOfferCandidate = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const Id = req.body.Id;
      const organizationId = req.employee.organizationId
      const candidate = await jobApplyFormModel.findById(Id);
  
      if (!candidate) {
        return badRequest(res, "Candidate not found.");
      }
  
      // ✅ Only allow if status is inProgress or shortlisted
      if (!["inProgress", "shortlisted"].includes(candidate.status)) {
        return badRequest(
          res,
          "Pre-offer can only be sent to candidates with status 'inProgress' or 'shortlisted'."
        );
      }
  
      const toEmails = candidate.emailId;
      let ccEmails;
  
      if (candidate.jobFormType === "recommended") {
        const recommendBy = await employeModel.findById(candidate.recommendedByID);
        ccEmails = [process.env.HR3_EMAIL, recommendBy?.workEmail];
      } else {
        ccEmails = [process.env.HR3_EMAIL];
      }
  
      const msg = `
        <div class="email-container">
          <h1>Congratulations, ${candidate.name}!</h1>
          <p>We are delighted to inform you that you have been selected for the <strong>${candidate.position}</strong> position at
              <strong>Fin Coopers.</strong> After thoroughly reviewing your interview and application,
              we are confident that you will be a great fit for our team.</p>
          <p>We are excited to offer you this opportunity and look forward to working with you.</p>
          <h2>Next Steps</h2>
          <p>Our HR team will be in touch with you soon to discuss the details of your employment and guide you through the onboarding process.</p>
          <p>If you have any questions or require further information, feel free to reach out to us at <a href="mailto:hr@fincoopers.com">hr@fincoopers.com</a></p>
          <p>For more information, visit our website at <a href="https://fincoopers.com">fincoopers.com</a>.</p>
          <p>We are excited about the possibility of working together and look forward to your response!</p>
          <div class="footer">
            <p>Best regards,<br>
            <strong>Fin Coopers</strong><br>
            </p>
          </div>
        </div>`;
  
      // ✅ Send email
      
        const sendPreOffer = await mailSwitchModel.findOne({organizationId:new mongoose.Types.ObjectId(organizationId)});
    const isMailEnabled =
      sendPreOffer?.masterMailStatus &&
      sendPreOffer?.hrmsMail?.hrmsMail &&
      sendPreOffer?.hrmsMail?.sendPreOfferMail;
    if (isMailEnabled) {
      await hrmsSendEmail(toEmails, ccEmails, "Selection Email", msg, "");
    }
  
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Selection Email",
        body: msg,
        jobApplyFormId: Id,
      });
  
      await mailData.save();
  
         // ✅ Update status and preOffer regardless of current status
    await jobApplyFormModel.findByIdAndUpdate(
      Id,
      { status: "shortlisted", preOffer: "generated" },
      { new: true }
    );
  
    if(isMailEnabled){
      return success(res, "Pre-offer process completed", mailData);
    }else{
      return success(res, "Mail sent to candidate successfully", mailData);
    }

    } catch (error) {
      console.error(error);
      return unknownError(res, error);
    }
  };
  

// calculate package and ctc //
  export const calculateCTCFromLpa = async (req, res) => {
    try {
      const lpa = req.body.package;
      const PF = req.body.PF;
      const ESIC = req.body.ESIC;
  
      const gross = lpa / 12;
      const basic = gross / 2;
  
      const hra = 0.4 * gross;
      const specialAllowance = 0.1 * gross;
      let epf = 0;
      let pfDeduction = 0;
  
      if (PF === "yes") {
        if ((gross - hra) > 15000) {
          epf = Math.round(0.1316 * 15000);
          pfDeduction = Math.round(0.12 * 15000);
        } else {
          epf = Math.round(0.1316 * (gross - hra));
          pfDeduction = Math.round(0.12 * (gross - hra));
        }
      }
  
      let esic = 0;
      let esicDeduction = 0;
  
      if (ESIC === "yes") {
        if (gross < 21000) {
          esicDeduction = Math.round(0.0075 * gross);
          esic = Math.round(0.0325 * gross);
        }
      }
  
      const subtotal = Math.round(epf + esic);
      const costOfCompany = Math.round(gross + subtotal);
  
      success(res, "Cost Of Company", { costOfCompany: costOfCompany * 12 });
    } catch (error) {
      unknownError(res, error);
    }
  };


  // create a offerletter //


  // Offer letter //

  export const createOfferLetterPDF = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const { jobId, package: salaryPackage, dateOfJoining, company, position, PF, ESIC } = req.body;
  
      const candidateDate = await jobApplyFormModel.findById(jobId);
  
      if (!candidateDate) {
        return badRequest(res, "Candidate not found.");
      }
  
      if (candidateDate.preOffer == "active") {
        return badRequest(res, "Cannot generate offer letter without sending selection mail.");
      }
  
      const candidateDetails = await jobApplyFormModel.findOneAndUpdate(
        { _id: jobId },
        {
          salary: salaryPackage,
          joiningDate: dateOfJoining,
          approvalPayrollfinOfferLetter: "",
        },
        { new: true }
      ).populate("branchId");
  
      const pdfPath = await offerLetterPDF(
        candidateDetails,
        position,
        salaryPackage,
        dateOfJoining,
        company,
        PF,
        ESIC
      );
  
      if (!pdfPath) {
     return UnknownError(res , "Failed with pdf generation")
      }
  
      const updatedCandidateDetails = await jobApplyFormModel.findByIdAndUpdate(
        jobId,
        {
          pathofferLetterFinCooper: pdfPath,
          prevofferLetterFinCooper: candidateDate.pathofferLetterFinCooper,
          finCooperOfferLetter: "generated",
        },
        { new: true }
      );
  
      if (!updatedCandidateDetails) {
        // return res.status(404).json({
        //   errorName: "notFound",
        //   message: "Candidate details not found",
        // });

        return badRequest(res , "Candidate details not found")
      }
  
      return success(res, "PDF generated successfully", pdfPath);
    } catch (error) {
      console.error(error);
      return unknownError(res, error);
    }
  };



  // offer-letter-2 //


  export const createOfferlettertwo = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const Id = req.body.Id;
      const salaryPackage = req.body.package;
      const joiningDate = req.body.dateOfJoining;
      const company = req.body.company;
      const position = req.body.position;
  
      const candidateDat = await jobApplyFormModel.findById(Id);
  
      if (candidateDat.preOffer === "active") {
        return badRequest(res, "Cannot generate offer letter without sending selection mail.");
      }
  
      const candidateDetails = await jobApplyFormModel.findOneAndUpdate(
        { _id: Id },
        {
          salary: salaryPackage,
          joiningDate: joiningDate,
          approvalPayrollfinOfferLetter: ""
        },
        { new: true }
      ).populate("branchId");
  
      const pdfPath = await generateOfferLetterPDF(
        candidateDetails,
        position,
        salaryPackage,
        joiningDate,
        company
      );
  
      if (!pdfPath) {
        return res.status(500).json({
          errorName: "pdfGenerationError",
          message: "Error generating the offer letter PDF",
        });
      }
  
      const updatedCandidateDetails = await jobApplyFormModel.findByIdAndUpdate(
        { _id: Id },
        {
          pathofferLetterFinCooper: pdfPath,
          prevofferLetterFinCooper: candidateDat.pathofferLetterFinCooper,
          finCooperOfferLetter: "generated"
        },
        { new: true }
      );
  
      if (!updatedCandidateDetails) {
        return res.status(404).json({
          errorName: "notFound",
          message: "Candidate details not found",
        });
      }
  
      success(res, "PDF generated successfully", pdfPath);
    } catch (error) {
      console.error(error);
      unknownError(res, error);
    }
  };
  

  // offer-letter-3 //
  export const createOfferletter3 = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const Id = req.body.Id;
      const salaryPackage = req.body.package;
      const joiningDate = req.body.dateOfJoining;
      const company = req.body.company;
      const position = req.body.position;
  
      const candidateDat = await jobApplyFormModel.findById(Id);
  
      const candidateDetails = await jobApplyFormModel.findOneAndUpdate(
        { _id: Id },
        {
          salary: salaryPackage,
          joiningDate: joiningDate,
          approvalPayrollfinOfferLetter: ""
        },
        { new: true }
      ).populate("branchId");
  
      const pdfPath = await generateOfferLetterPDF1(
        candidateDetails,
        position,
        salaryPackage,
        joiningDate,
        company
      );
  
      if (!pdfPath) {
        return res.status(500).json({
          errorName: "pdfGenerationError",
          message: "Error generating the offer letter PDF",
        });
      }
  
      success(res, "PDF generated successfully", pdfPath);
    } catch (error) {
      console.error(error);
      unknownError(res, error);
    }
  };



  // Send the Offer Letter //

  export const sendOfferLetterCandidate = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const {
        sendTo,
        Id,
        reportingManagerId,
        userName,
        branchId,
        company,
        constCenterId,
        designationId,
        employeeTypeId,
        employementTypeId,
        joiningDate,
        roleId,
        workLocationId,
      } = req.body;
   const organizationId = req.employee.organizationId
      const validModes = ["candidate", "manager"];
      if (!validModes.includes(sendTo)) {
        return badRequest(res, "Send to must be 'candidate' or 'manager'");
      }
  
      const baseURL = process.env.BASE_URL.replace(/\/$/, "");
      const candidate = await jobApplyFormModel.findById(Id);
  
      if (!candidate) {
        return badRequest(res, "Candidate not found");
      }
  
      let toEmails;
      if (sendTo == "candidate") {
        toEmails = candidate.emailId;
      } else {
        const reportingManager = await employeModel.findById(reportingManagerId);
        toEmails = reportingManager?.workEmail;
      }
  
      const ccEmails = process.env.HR3_EMAIL;
      const offerLetterPDF = candidate.pathofferLetterFinCooper;
  
      if (!offerLetterPDF) {
        return badRequest(res, "Offer letter Not generated. First generate offer letter!");
      }
  
      const existingUser = await employeModel.findOne({ userName });
      if (existingUser) {
        return badRequest(res, "Username Already Exist for this candidate");
      }
  
      if (candidate.emailId) {
        const emailExists = await employeModel.findOne({ email: candidate.emailId });
        if (emailExists) return badRequest(res, "Email Already Exist for this candidate");
      }
  
      if (candidate.mobileNumber) {
        const mobileExists = await employeModel.findOne({ mobileNo: candidate.mobileNumber });
        if (mobileExists) return badRequest(res, "mobileNo Already Exist for this candidate");
      }
  
      const htmlMessage = `
        <div class="container">
          <div class="header">
            <h1>Job Offer Letter</h1>
          </div>
          <div class="content">
            <h2>Dear ${candidate.name},</h2>
            <p>We are pleased to offer you the position of <strong>${candidate.position}</strong> at <strong>Fin Coopers</strong>.</p>
            <p>Attached is your official offer letter. Please review it carefully and let us know if you have any questions.</p>
            <p><a href="${offerLetterPDF}" target="_blank">Download Offer Letter</a></p>
            <p>Please confirm your acceptance. We look forward to welcoming you to our team.</p>
            <p>Visit us at <a href="https://fincoopers.com">fincoopers.com</a></p>
          </div>
          <div class="footer">
            <p>Best regards,<br>HR Team<br>Fin Coopers</p>
          </div>
        </div>`;
  
      if (candidate.status !== "shortlisted") {
        return badRequest(res, "Offer letter cannot be send to a candidate without sending postoffer");
      }
  
            const sendPreOffer = await mailSwitchModel.findOne({organizationId:new mongoose.Types.ObjectId(organizationId)});
    const mailEnabled =
      sendPreOffer?.masterMailStatus &&
      sendPreOffer?.hrmsMail?.hrmsMail &&
      sendPreOffer?.hrmsMail?.sendPreOfferLetterMail;
    if (mailEnabled) {
      await hrmsSendEmail(toEmails, ccEmails, "Offer Letter", htmlMessage, "");
    }
  
      await new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Offer Letter",
        body: htmlMessage,
        jobApplyFormId: Id,
      }).save();
  
      const updatedCandidate = await jobApplyFormModel.findByIdAndUpdate(
        Id,
        { postOffer: "generated" },
        { new: true }
      );
  
      if (!updatedCandidate) {
        return badRequest(res, "Candidate not found");
      }
  
      const objectIdFields = ["departmentId", "subDepartmentId", "secondaryDepartmentId", "seconSubDepartmentId"];
      objectIdFields.forEach(field => {
        if (req.body[field]) {
          req.body[field] = mongoose.Types.ObjectId.isValid(req.body[field])
            ? new mongoose.Types.ObjectId(req.body[field])
            : null;
        } else {
          req.body[field] = null;
        }
      });
  
      // Normalize and prepare data for employeModel
      req.body.userName = updatedCandidate.mobileNumber.toString();
      req.body.password = await bcrypt.hash(req.body.userName, await bcrypt.genSalt(10));
      req.body.joiningDate = updatedCandidate.joiningDate;
      req.body.onboardingStatus = "joining";
      req.body.mobileNo = updatedCandidate.mobileNumber;
      req.body.employeName = updatedCandidate.name;
      req.body.email = updatedCandidate.emailId;
      req.body.location = { type: "Point", coordinates: [0, 0] };
  
      // ✅ Ensure roleId is an array
      if (req.body.roleId && !Array.isArray(req.body.roleId)) {
        req.body.roleId = [req.body.roleId];
      }

  
      await employeModel.create(req.body);
  
      const finexeMessage = `
        <div class="container">
          <div class="header">Welcome to FINEXE 2.0</div>
          <div class="content">
            <h1>Hello ${candidate.name},</h1>
            <p>We are excited to have you on board. Below are your FINEXE 2.0 credentials:</p>
            <p><strong>Username:</strong> ${req.body.userName}</p>
            <p><strong>Password:</strong> ${req.body.userName}</p>
            <p>Login at <a href="https://finexe.fincooper.in/login/" target="_blank">FINEXE 2.0</a>.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>HR Team<br>Fin Coopers</p>
          </div>
        </div>`;
  
              const sendPreOfferLetter = await mailSwitchModel.findOne({organizationId:new mongoose.Types.ObjectId(organizationId)});
    const isMailEnabledFinexe =
      sendPreOfferLetter?.masterMailStatus &&
      sendPreOfferLetter?.hrmsMail?.hrmsMail &&
      sendPreOfferLetter?.hrmsMail?.sendPreOfferLetterFinexe;
    if (isMailEnabledFinexe) {
      await hrmsSendEmail(candidate.emailId, ccEmails, "FINEXE 2.0 Credentials", finexeMessage, "");
    }
  
      await new mailsToCandidatesModel({
        recipient: candidate.emailId,
        subject: "Finexe Mail",
        body: finexeMessage,
        jobApplyFormId: Id,
      }).save();

      await jobApplyFormModel.findByIdAndUpdate(Id,
        { status: "onBoarded" },
        { new: true })
  
        if(mailEnabled || isMailEnabledFinexe){
          return success(res, "Mail sent to candidate successfully");
        }else{
return success(res, "Pre-offer Letter process completed");
        }
  
    } catch (error) {
      console.error(error);
      return unknownError(res, error);
    }
  };
  


// Find the InterviewController //

export const schudeleInterview = async (req, res) => {
  try {
    const { type = "all", status = "no" } = req.query; // Default values
      const currentDate = new Date();
       currentDate.setHours(0, 0, 0, 0); // Set to midnight

    const matchConditions = {};

    // Handle status (interviewTaken)
    if (status !== "all") {
      if (!["yes", "no"].includes(status)) {
        return badRequest(res, "Invalid 'status'. Use 'yes', 'no', or 'all'.");
      }
      matchConditions.interviewTaken = status;
    }

    // Handle type (time filter)
    if (type == "future") {
      matchConditions.interviewDate = { $gt: currentDate };
    } else if (type == "past") {
      matchConditions.interviewDate = { $lt: currentDate };
    } else if (type !== "all") {
      return badRequest(res, "Invalid 'type'. Use 'future', 'past', or 'all'.");
    }


    const interviews = await interviewDetailsModel.aggregate([
            {
        $addFields: {
          interviewDate: {
            $dateFromString: {
              dateString: "$interviewDate",
              format: "%Y-%m-%d"
            }
          }
        }
      },
      { $match: matchConditions },
      {
        $sort: {
          interviewRound: -1,
          interviewDate: 1, // Upcoming interviews appear first
          createdAt: -1
        }
      },
      {
        $group: {
          _id: "$jobApplyFormId",
          latestInterview: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "jobapplyforms",
          localField: "_id",
          foreignField: "_id",
          as: "jobApply"
        }
      },
      {
        $unwind: {
          path: "$jobApply",
          preserveNullAndEmptyArrays: true
        }
      },
    {
  $project: {
    _id: 0,
    jobApplyFormId: "$_id",
    interview: "$latestInterview",
    name: { $ifNull: ["$jobApply.name", null] },
    emailId: { $ifNull: ["$jobApply.emailId", null] }
  }
}

    ]);

    return success(
      res,
      `Fetched ${type} interviews with status '${status}'`,
      interviews
    );
  } catch (error) {
    console.error("Aggregation error:", error);
    return unknownError(res, "Internal Server Error");
  }
};




export const getCandidateDashboard = async (req, res) => {
  try {
    const candidateId = req.user._id;

    if (!candidateId) {
      return badRequest(res, "Candidate not found");
    }

    // Get basic stats about all applications
    const totalApplications = await jobApplyFormModel.countDocuments({
      candidateId,
      status: { $ne: "notActive" }
    });

    const statusBreakdown = await jobApplyFormModel.aggregate([
      {
        $match: {
          candidateId,
          status: { $ne: "notActive" }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    const interviewStatusBreakdown = await jobApplyFormModel.aggregate([
      {
        $match: {
          candidateId,
          status: { $ne: "notActive" }
        }
      },
      {
        $group: {
          _id: "$hrInterviewSchedule",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          interviewStatus: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    const recentApplications = await jobApplyFormModel.aggregate([
      {
        $match: {
          candidateId,
          status: { $ne: "notActive" }
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, name: 1 } }],
          as: "department"
        }
      },
      {
        $unwind: { path: "$department", preserveNullAndEmptyArrays: true }
      },
      
      {
        $project: {
          position: 1,
          department: 1,
          createdAt: 1,
          status: 1,
          hrInterviewSchedule: 1,
          resumeShortlisted: 1
        }
      }
    ]);

    const upcomingInterviews = await jobApplyFormModel.aggregate([
      {
        $match: {
          candidateId,
          status: { $ne: "notActive" },
          hrInterviewSchedule: "scheduled"
        }
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
                    { $in: ["$_id", { $ifNull: ["$$interviewIds", []] }] },
                    { $eq: ["$status", "scheduled"] },
                    { $gte: ["$interviewDate", new Date().toISOString().split("T")[0]] }
                  ]
                }
              }
            },
            { $sort: { interviewDate: 1 } },
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
                      email: 1
                    }
                  }
                ],
                as: "interviewerDetails"
              }
            },
            {
              $unwind: {
                path: "$interviewerDetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: 1,
                interviewDate: 1,
                interviewTime: 1,
                mode: 1,
                location: 1,
                googleLink: 1,
                interviewRound: 1,
                interviewBy: 1,
                interviewer: 1,
                interviewerDetails: 1
              }
            }
          ],
          as: "upcomingInterviews"
        }
      },
      {
        $project: {
          _id: 1,
          position: 1,
          upcomingInterviews: {
            $filter: {
              input: "$upcomingInterviews",
              as: "interview",
              cond: { $ifNull: ["$$interview.interviewDate", false] }
            }
          }
        }
      },
      {
        $match: {
          "upcomingInterviews.0": { $exists: true }
        }
      }
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const applicationTimeline = await jobApplyFormModel.aggregate([
      {
        $match: {
          candidateId,
          status: { $ne: "notActive" },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          _id: 0,
          period: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: {
                  if: { $lt: ["$_id.month", 10] },
                  then: { $concat: ["0", { $toString: "$_id.month" }] },
                  else: { $toString: "$_id.month" }
                }
              }
            ]
          },
          count: 1
        }
      }
    ]);

    const departmentBreakdown = await jobApplyFormModel.aggregate([
      {
        $match: {
          candidateId,
          status: { $ne: "notActive" }
        }
      },
      {
        $lookup: {
          from: "newdepartments",
          localField: "departmentId",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, name: 1 } }],
          as: "departmentInfo"
        }
      },
      {
        $unwind: { path: "$departmentInfo", preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: "$departmentInfo.name",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          department: { $ifNull: ["$_id", "Unspecified"] },
          count: 1,
          _id: 0
        }
      }
    ]);


    const dashboardData = {
      overview: {
        totalApplications,
        statusBreakdown,
        interviewStatusBreakdown,
      },
      recentApplications,
      upcomingInterviews,
      applicationTimeline,
      departmentBreakdown
    };

    return success(res, "Dashboard data fetched successfully", dashboardData);
  } catch (error) {
    console.error("Error in getCandidateDashboard:", error.message);
    return UnknownError(res, error);
  }
};



