const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../../globalHelper/response.globalHelper");

const { sendEmail, hrmsSendEmail } = require("../functions.Controller");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const candidateDetailsModule = require("../../model/hrms/candidate.model");
const jobApplyFormModel = require("../../model/hrms/jobApplyForm.model");
const interviewDetailsModel = require("../../model/hrms/interviewDetails.model");
const mailsToCandidatesModel = require("../../model/hrms/mailsToCandidate.model");
const employeModel = require("../../model/adminMaster/employe.model");
const assetModel = require("../../model/hrms/asset.model");
const feedbackInterviewerModel = require("../../model/hrms/feedbackInterviewer.model");
const vacancyRequestModel = require("../../model/hrms/vacancyRequest.model");
const directJoiningModel = require("../../model/hrms/directJoining.model");
const { createGoogleMeetLink } = require("../hrms/googleMeet.controller");
const { offerLetterPDF , generateOfferLetterPDF,generateOfferLetterPDF1 , generateOfferLetter3 } = require("../hrms/offerLetter.controller");
const bcrypt = require("bcrypt");
const cron = require("node-cron");
const moment = require("moment");
const {
  joiningFormGoogleSheet,
} = require("../hrms/hrmsGoogleSheet.controller");
const jwt = require("jsonwebtoken");
const { initESign } = require("../../services/legality.services");

//--------------------------------JRMS HR interview schedule----------------------------------------
async function hrInterviewSchedule(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    if (req.body.mode === "online" || req.body.mode === "offline") {
      const id = req.body.jobFormId;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      const candidate = await jobApplyFormModel.findById({ _id: id });
      if (candidate.hrInterviewSchedule === "scheduled") {
        return badRequest(res, "HR Interview Already Scheduled");
      }
      //get interviewer details through token
      const hrExists = await employeModel.findById(req.Id);
      const toEmails = candidate.emailId;
      const ccEmails = [hrExists.workEmail,process.env.HR3_EMAIL];
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

        interviewDetails = `
  <strong>Google Meet Link:</strong> <br>
  <a href="${meetLink}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #1a73e8; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
    Join Meeting
  </a><br>
`;

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
                    Thank you for your interest in the <strong>${candidate.position}</strong> position at <strong>Fin Coopers</strong>. We are excited to inform you that we have scheduled your HR interview and look forward to discussing how your background can contribute to our team's success.
                </p>
               <p style="color: #555;">
                    <strong>Please find the interview details below:</strong>
                </p>
               
                 <p style="color: #555;">
                    <strong>Date:</strong> ${req.body.interviewDate}<br>
                    <strong>Time:</strong> ${req.body.interviewTime} <br>
                    ${interviewDetails}
                    <strong>Interviewer:</strong> ${hrExists.employeName} 
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
        "Invitation: HR Interview Schedule at Fin Coopers",
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
        jobApplyFormId: req.body.jobFormId,
        availability: "available",
        interviewEventCreated: "created",
        interviewBy:"hr",
      });

      // Log the email in the mailsToCandidatesModel
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject:
          "Invitation: HR Interview Schedule at Fin Coopers",
        body: msg,
        jobApplyFormId: id,
      });
      await mailData.save();
      await jobApplyFormModel.findByIdAndUpdate(
        { _id: id },
        {
          hrInterviewSchedule: "scheduled",
          resumeShortlisted: "shortlisted",
          hrInterviewDetailsId:interviewDetailsData._id,
        },
        { new: true }
      );
      success(res, "Mail send to candidate", interviewDetailsData);
    } else if (req.body.mode === "call") {
      const id = req.body.jobFormId;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      const candidate = await jobApplyFormModel.findById({ _id: id });
      if (candidate.hrInterviewSchedule === "scheduled") {
        return badRequest(res, "HR Interview Already Scheduled");
      }
      //get interviewer details through token
      const hrExists = await employeModel.findById(req.Id);
      const toEmails = candidate.emailId;
      const ccEmails = [hrExists.workEmail,process.env.HR3_EMAIL];
      const baseURL = process.env.BASE_URL;
      const company = "Fin Coopers";

      const msg = `<table style="width: 100%; max-width: 600px; margin: auto; border-collapse: collapse; background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd;">
        <tr>
            <td style="padding: 20px; text-align: left;">
      <div class="container">
    <p>Dear ${candidate.name},</p>
    
    <p>Thank you for your application for the ${candidate.position} role at Fin Coopers. We are pleased to inform you that you have been shortlisted for the next stage in our hiring process.</p>
    
    <p>Our HR team will be reaching out to you soon via a call for an HR interview round. This interview will provide us with an opportunity to get to know you better and discuss how your skills align with the role.</p>
    
    <p>We appreciate your interest in joining our team and look forward to our conversation.</p>
     
    <p >
      Best regards,<br>
      HR Department<br>
      hr@fincoopers.com
    </p>
    </div>
    </td>
    </tr>
    </table>`;

    hrmsSendEmail(
        toEmails,
        ccEmails,
        "Invitation: HR Interview Schedule at Fin Coopers",
        msg,
        ""
      );
      // hrInterviewSchedule
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject:
          "Invitation: HR Interview Schedule at Fin Coopers",
        body: msg,
        jobApplyFormId: id,
      });
      await mailData.save();
      
      //add entry in interview model
      const interviewDetailsData = await interviewDetailsModel.create({
        mode: req.body.mode,
        interviewerId: req.Id,
        jobApplyFormId: req.body.jobFormId, 
        availability: "available",
        interviewEventCreated: "created",
        interviewBy:"hr",
      });

      await jobApplyFormModel.findByIdAndUpdate(
        { _id: id },
        {
          hrInterviewSchedule: "scheduled",
          resumeShortlisted: "shortlisted",
          hrInterviewDetailsId:interviewDetailsData._id,
        },
        { new: true }
      );
      success(res, "Mail send to candidate");
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//--------------------------------JRMS HR interview schedule----------------------------------------
async function rescheduleHrInterview(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    
    // Validate the mode
    const validModes = ["online", "offline", "call"];
    if (!validModes.includes(req.body.mode)) {
      return badRequest(res, "Invalid mode. Mode must be 'online', 'offline', or 'call'");
    }
    if (req.body.mode === "online" || req.body.mode === "offline") {
      const id = req.body.jobFormId;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      const candidate = await jobApplyFormModel.findById({ _id: id });
      // console.log(candidate.hrInterviewSchedule);
      if(!candidate){
        return badRequest(res, "Cannot find candidate");
      }
      if (candidate.hrInterviewSchedule === "scheduled") {
        return badRequest(res, "HR Interview Already Scheduled");
      }
      //get interviewer details through token
      
      const hrExists = await employeModel.findById(req.Id);
      const toEmails = candidate.emailId;
      const ccEmails = [hrExists.workEmail,process.env.HR3_EMAIL];
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

        interviewDetails = ` <div style="font-family: Arial, sans-serif; text-align: center;">
    <p style="font-size: 16px; font-weight: bold; color: #333;">Google Meet Link:</p>
    <a href="${meetLink}" 
       style="display: inline-block; padding: 10px 20px; font-size: 16px; 
              color: #fff; background-color: #1a73e8; text-decoration: none; 
              border-radius: 5px; font-weight: bold;">
      Join Meeting
    </a>
  </div>`;
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
                   We are pleased to inform you that your application has been reconsidered for ${candidate.position} role at Fin Coopers.
                </p>
               <p style="color: #555;">
                    <strong>Please find the interview details below:</strong>
                </p>
               
                 <p style="color: #555;">
                    <strong>Date:</strong> ${req.body.interviewDate}<br>
                    <strong>Time:</strong> ${req.body.interviewTime} <br>
                    ${interviewDetails}
                    <strong>Interviewer:</strong> ${hrExists.employeName} 
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
        "Invitation: HR Interview Schedule at Fin Coopers",
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
        jobApplyFormId: req.body.jobFormId,
        availability: "available",
        interviewEventCreated: "created",
        interviewBy:"hr",
      });

      // Log the email in the mailsToCandidatesModel
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject:
          "Invitation: HR Interview Schedule at Fin Coopers",
        body: msg,
        jobApplyFormId: id,
      });
      await mailData.save();
      await jobApplyFormModel.findByIdAndUpdate(
        { _id: id },
        {
          status:"active",
          hrInterviewSchedule: "scheduled",
          resumeShortlisted: "shortlisted",
          hrInterviewDetailsId:interviewDetailsData._id,
          feedbackByHr:"active",
          interviewSchedule:"active",
          feedbackByInterviewer:"active",
          preOffer:"active",
          finCooperOfferLetter:"notgenerated",
          pathofferLetterFinCooper:null,
          approvalPayrollfinOfferLetter:"",
          postOffer:"active",
          candidateStatus:"reconsidered",
        },
        { new: true }
      );
      success(res, "HR interview scheduled succesfully", interviewDetailsData);
    } else if (req.body.mode === "call") {
      const id = req.body.jobFormId;
      if (!id || id.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequest(res, "Invalid ID");
      }
      const candidate = await jobApplyFormModel.findById({ _id: id });
      if (candidate.candidateStatus ==="reconsidered" && candidate.hrInterviewSchedule === "scheduled") {
        return badRequest(res, "HR Interview Already Scheduled");
      }
      //get interviewer details through token
      const hrExists = await employeModel.findById(req.Id);
      const toEmails = candidate.emailId;
      const ccEmails = [hrExists.workEmail,process.env.HR3_EMAIL];
      const baseURL = process.env.BASE_URL;
      const company = "Fin Coopers";

      const msg = `<table style="width: 100%; max-width: 600px; margin: auto; border-collapse: collapse; background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd;">
        <tr>
            <td style="padding: 20px; text-align: left;">
      <div class="container">
    <p>Dear ${candidate.name},</p>
    
    <p>We are pleased to inform you that your application has been reconsidered for ${candidate.position} role at Fin Coopers.</p>
    
    <p>Our HR team will be reaching out to you soon via a call for an HR interview round. This interview will provide us with an opportunity to get to know you better and discuss how your skills align with the role.</p>
    
    <p>We appreciate your interest in joining our team and look forward to our conversation.</p>
     
    <p >
      Best regards,<br>
      HR Department<br>
      hr@fincoopers.com
    </p>
    </div>
    </td>
    </tr>
    </table>`;

    hrmsSendEmail(
        toEmails,
        ccEmails,
        "Invitation: HR Interview Schedule at Fin Coopers",
        msg,
        ""
      );
      // hrInterviewSchedule
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject:
          "Invitation: HR Interview Schedule at Fin Coopers",
        body: msg,
        jobApplyFormId: id,
      });
      await mailData.save();
      
      //add entry in interview model
      const interviewDetailsData = await interviewDetailsModel.create({
        mode: req.body.mode,
        interviewerId: req.Id,
        jobApplyFormId: req.body.jobFormId, 
        availability: "available",
        interviewEventCreated: "created",
        interviewBy:"hr",
      });

      await jobApplyFormModel.findByIdAndUpdate(
        { _id: id },
        {

          status:"active",
          hrInterviewSchedule: "scheduled",
          resumeShortlisted: "shortlisted",
          hrInterviewDetailsId:interviewDetailsData._id,
          feedbackByHr:"active",
          interviewSchedule:"active",
          feedbackByInterviewer:"active",
          preOffer:"active",
          finCooperOfferLetter:"notgenerated",
          pathofferLetterFinCooper:null,
          approvalPayrollfinOfferLetter:"",
          postOffer:"active",
          candidateStatus:"reconsidered",
        },
        { new: true }
      );
      success(res, "HR interview scheduled succesfully");
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------HRMS  collect candidate data --------------------------------------------------
async function sendPreOfferCandidate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    //get interviewer details through token

    const baseURL = process.env.BASE_URL;
    const Id = req.body.Id;
    const candidate = await jobApplyFormModel.findById(Id);
    
    const dataOfFeedback = await feedbackInterviewerModel.findOne({
      jobApplyFormId: Id,
    });

    if (dataOfFeedback.hireCandidate === "no") {
      return badRequest(
        res,
        "Cannot send selection mail to this candidate as interviewer gave negative feedback"
      );
    }
    let ccEmails ;
    const toEmails = candidate.emailId;
    if(candidate.jobFormType==="recommended"){
      const recommendBy = await employeModel.findById(candidate.recommendedByID);
      ccEmails = [process.env.HR3_EMAIL,recommendBy.workEmail];
    }else{
      // recommendedByID
      ccEmails = [process.env.HR3_EMAIL];
    }
    let msg = `<div class="email-container">
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
    if (candidate.status === "inProgress") {
      await hrmsSendEmail(toEmails, ccEmails, "Selection Email", msg, "");

      // Log the email in the mailsToCandidatesModel
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Selection Email",
        body: msg,
        jobApplyFormId: Id,
      });

      await mailData.save();

      const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
        { _id: Id },
        { status: "shortlisted", preOffer: "generated" },
        { new: true }
      );

      success(res, "Mail send to candidate succesfully", mailData);
    } else if(candidate.status === "shortlisted"){
      await hrmsSendEmail(toEmails, ccEmails, "Selection Email", msg, "");

      // Log the email in the mailsToCandidatesModel
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Selection Email",
        body: msg,
        jobApplyFormId: Id,
      });

      await mailData.save();
      success(res, "Mail send to candidate succesfully", mailData);
    }else {
      return badRequest(
        res,
        "Preoffer cannot be send to a candidate without interview or cannot send preoffer twice"
      );
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------HRMS  collect candidate data ---------------------------------------
async function sendPostOfferCandidate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    //get interviewer details through token

    const baseURL = process.env.BASE_URL;
    const Id = req.body.Id;
    const candidate = await jobApplyFormModel.findById(Id);
    // let formlink = `finexe.com/somting/form?jobApplyFormId=${}&token=${}`
    const toEmails = candidate.emailId;
    const ccEmails = process.env.HR3_EMAIL;
    const payload = {
      Id: null,
      roleName: "guest",
      // vendorType: vendorRoleDetail.vendorType,
    };
    const token = jwt.sign(payload, "FIN-COOPER");
    let path = process.env.FINEXE_URL;
// console.log(path)
    const formLink = `${path}hrms/talantAquisition/emailForm?jobApplyFormId=${Id}&token=${token}
`;
    let msg = `<div class="email-container">
    <h1>Welcome to Fin Coopers!</h1>
    
    <p>Dear ${candidate.name},</p>

    <p>We are excited to have you join our team at <strong>Fin Coopers</strong>. As part of the onboarding process, we require a few additional documents and details from you. Kindly submit the required information by filling out the form linked below.</p>

    <p>Click on the button below to fill out the form and upload the necessary documents:</p>

    <a href="${formLink}" class="btn">Submit Documents & Details</a>

    <p>Once you have successfully filled out the form and submitted all required documents, we will begin the verification process. Upon successful verification, you will receive your official offer letter.</p>

    <p>If you have any questions or need assistance, feel free to reach out to our HR department at <a href="mailto:hr@fincoopers.com">hr@fincoopers.com</a>.</p>

    <p>For more information, visit our website at <a href="https://fincoopers.com">fincoopers.com</a>.</p>

    <p>We are looking forward to welcoming you on board!</p>

    <div class="footer">
        <p>Best regards,<br>
        HR Team<br>
        Fin Coopers<br>
        </p>
    </div>
</div>
`;
    if (candidate.status === "shortlisted") {
      hrmsSendEmail(toEmails, ccEmails, "Document Submission Request", msg, "");
      const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
        { _id: Id },
        { postOffer: "inprogress" },
        { new: true }
      );
      // Log the email in the mailsToCandidatesModel
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Document Submission Request",
        body: msg,
        jobApplyFormId: Id,
      });

      await mailData.save();
      success(res, "Mail send to candidate succesfully", mailData);
    } else {
      return badRequest(
        res,
        "Post offer cannot be send to a candidate without sendind preoffer or cannot send post offer twice"
      );
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------HRMS  collect candidate data ---------------------------------------

// async function addCandidateDocument(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return serverValidation({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     // Validate jobApplyFormId received from frontend
//     const jobApplyFormId = req.body.jobApplyFormId;

//     // Check if jobApplyFormId is a valid ObjectId
//     // if (!mongoose.Types.ObjectId.isValid(jobApplyFormId)) {
//     //   return badRequest(res, "Invalid jobApplyFormId format");
//     // }
//     // console.log("Request Body:", req.body);

//     // Proceed with processing if the ID is valid
//     const candidateDetails = await candidateDetailsModule.create(req.body);

//     const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
//       new mongoose.Types.ObjectId(jobApplyFormId), // Use 'new' to create ObjectId
//       { docVerification: "inprogress" },
//       { new: true }
//     );

//     success(res, "Candidate Details Added Successfully", candidateDetails);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }
async function addCandidateDocument(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    // const jobApplyFormData = await jobApplyFormModel.findById(req.body.Id);

    // if (jobApplyFormData.status === "shortlisted") {
    const candidateDetails = await candidateDetailsModule.create(req.body);
    // const jobApplyFormData = await jobApplyFormModel.findById(jobApplyFormId);
    const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
      { _id: req.body.jobApplyFormId },
      { docVerification: "inprogress" },
      { new: true }
    );
    success(res, "Candidate Details Added Successfully", candidateDetails);
    // } else {
    //   return badRequest(res, "Cannot add data");
    // }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------HRMS  get candidate data ---------------------------------------

// async function getCandidateDocument(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return serverValidation({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     const jobApplyFormDetails = await jobApplyFormModel.findById(req.body.Id);
//     const candidateDetails = await candidateDetailsModule.find({
//       jobApplyFormId: req.body.Id,
//     });
//     const interviewData = await interviewDetailsModel.find({
//       jobApplyFormId: req.body.Id,
//     });
//     success(res, "Candidate Details ", {
//       jobApplyFormDetails,
//       candidateDetails,
//       interviewData,
//     });
//   } catch (error) {
//     // console.log(error);
//     unknownError(res, error);
//   }
// }

async function getCandidateDetails(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const Id = new mongoose.Types.ObjectId(req.query.Id);

    // Aggregate pipeline to find one document in jobApplyFormModel
    let jobApplyFormDetails = await jobApplyFormModel.aggregate([
      {
        $match: { _id: Id }, // Match specific jobApplyFormId
      },
      {
        $lookup: {
          from: "newdepartments", // Collection name for departments
          localField: "departmentId", // Field in jobPostModel
          foreignField: "_id", // Field in departments collection
          as: "department", // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: "$department", // Unwind the department array
        },
      },
      {
        $lookup: {
          from: "employees", // Collection name for employees (managers)
          localField: "managerID", // Field in jobPostModel
          foreignField: "_id", // Field in employees collection
          as: "manager", // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: "$manager", // Unwind the manager array
          preserveNullAndEmptyArrays: true, // Allow null values if no match is found
        },
      },
      {
        $lookup: {
          from: "newbranches", // Collection name for branches
          localField: "branchId", // Field in jobPostModel
          foreignField: "_id", // Field in branches collection
          as: "branches", // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: "$branches", // Unwind the branches array
          preserveNullAndEmptyArrays: true, // Allow null values if no match is found
        },
      },
      {
        $lookup: {
          from: "jobposts", // Collection name for job posts
          localField: "jobPostId", // Field in jobPostModel
          foreignField: "_id", // Field in branches collection
          as: "jobPost", // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: "$jobPost", // Unwind the branches array
          preserveNullAndEmptyArrays: true, // Allow null values if no match is found
        },
      },
      // Lookup to resolve addedBy in remarkFinCooperOfferLetter
      {
        $lookup: {
          from: "employees",
          localField: "remarkFinCooperOfferLetter.addedBy", // Path in remarkFinCooperOfferLetter
          foreignField: "_id",
          as: "remarkAddedByDetails",
          pipeline: [
            {
              $project: {
                _id: 1,
                employeName: 1, // Include only the `employeName` field
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          candidateUniqueId: 1,
          name: {
            $concat: [
              { $toUpper: { $substr: ["$name", 0, 1] } }, // First letter capitalized
              { $substr: ["$name", 1, { $strLenCP: "$name" }] }, // Rest of the name in lowercase
            ],
          },
          mobileNumber: 1,
          vacancyRequestId:1,
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
          jobFormType:1,
          resume: 1,
          finCooperOfferLetter: 1,
          pathofferLetterFinCooper: 1,
          remarkFinCooperOfferLetter: {
            $map: {
              input: "$remarkFinCooperOfferLetter",
              as: "remark",
              in: {
                remark: "$$remark.remark",
                addedBy: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$remarkAddedByDetails",
                        as: "emp",
                        cond: { $eq: ["$$emp._id", "$$remark.addedBy"] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
          approvalPayrollfinOfferLetter: 1,
          preferedInterviewMode: 1,
          position: 1,
          knewaboutJobPostFrom: 1,
          currentDesignation: 1,
          startDate: 1,
          endDate: 1,
          reasonLeaving: 1,
          totalExperience: 1,
          currentCTC: 1,
          salary: 1,
          joiningDate: 1,
          currentLocation: 1,
          gapIfAny: 1,
          status: 1,
          resumeShortlisted: 1,
          docVerification: 1,
          interviewSchedule: 1,
          sendOfferLetterToCandidate: 1,
          sendZohoCredentials: 1,
          postOffer: 1,
          preOffer: 1,
          department: { _id: 1, name: 1 },
          manager: { _id: 1, employeName: 1, employeUniqueId: 1} ,
          branches: { _id: 1, name: 1 },
          jobPost: 1,
        },
      },
    ]);

  
    const vacancyPackage = await jobApplyFormModel
    .findById(Id)
    .populate({
      path: "vacancyRequestId",
      select: "package",
    })
    .exec();
  
  const packageValue = vacancyPackage?.vacancyRequestId?.package || null;
  const packagetype = vacancyPackage?.vacancyRequestId?.packageType || null;
  
  // console.log("Package:", packageValue);

  

    // Other related lookups for additional data
    const candidateDetails = await employeModel.findOne({
      userName: jobApplyFormDetails[0].mobileNumber,
      onboardingStatus: { $in: ["joining", "onboarded"] }, // Match either "joining" or "onboarded"
    });

    // const newvacationDetails = await vacancyRequestModel.findOne({
    //   _id: jobApplyFormDetails.vacancyRequestId,
    // }).select('package')

    const vacancyData = await vacancyRequestModel
      .findOne({ jobPostId: jobApplyFormDetails.jobPostId })
      .populate({
        path: "createdByManagerId",
        select: "_id employeName status",
      });

    const interviewData = await interviewDetailsModel.findOne({
      jobApplyFormId: Id,
    });

    const feedbackInterviewer = await feedbackInterviewerModel
      .find({ jobApplyFormId: Id })
      .populate({
        path: "interviewerId",
        select: "_id employeName status",
      });


    // Sending the aggregated data back as a success response
    success(res, "Candidate Details", {
      jobApplyFormDetails: jobApplyFormDetails[0], // Since aggregate returns an array
      candidateDetails,
      interviewData,
      vacancyData,
      feedbackInterviewer,
      package:packageValue || "",
      packageType:packagetype || "",
    });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


// ------------------HRMS  collect candidate data ---------------------------------------

async function updateCandidateDocument(req, res) {
  try {
    // Validate incoming request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    console.log(req.body.candidateId);

    const candidateDetails = await candidateDetailsModule.findById(
      req.body.candidateId
    );
    // console.log(candidateDetails);
    if (!candidateDetails) {
      return badRequest(res, "Candidate Details Not Found");
    }
    // console.log(candidateDetails.jobApplyFormId);
    const updatedCandidateDetails =
      await candidateDetailsModule.findByIdAndUpdate(
        req.body.candidateId,
        { $set: req.body },
        { new: true, runValidators: true }
      );
    // const jobApplyFormData = await jobApplyFormModel.findById(jobApplyFormId);
    const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
      { _id: candidateDetails.jobApplyFormId },
      { docVerification: "verified", status: "joined" },
      { new: true }
    );

    await joiningFormGoogleSheet(updatedCandidateDetails);

    success(
      res,
      "Candidate Details Updated Successfully",
      updatedCandidateDetails
    );
  } catch (error) {
    // Handle any unexpected errors
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------HRMS send mail to reupload documents candidate data ---------------------------------------
async function sendupadteFormMailCandidate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    //get interviewer details through token

    const baseURL = process.env.BASE_URL;
    const Id = req.body.Id;
    const candidate = await jobApplyFormModel.findById(Id);
    const toEmails = candidate.emailId;
    const ccEmails = process.env.HR3_EMAIL;

    let msg = ` <div class="email-container">
        <h1>Action Required: Update Your Form Submission</h1>

        <p>Dear ${candidate.name},</p>

        <p>Thank you for submitting your form as part of the onboarding process at <strong>Fin Coopers</strong>. However, after reviewing your submission, we have identified that some fields in the form are incorrect or incomplete, and a few documents may need to be re-uploaded.</p>

        <p>To ensure a smooth process, we kindly ask you to update the form and re-upload the necessary documents. Please use the link below to access your form and make the required changes:</p>

        <a href="[Form_Link]" class="btn">Update Your Form & Documents</a>

        <p>Once the form is updated and the documents are re-submitted, we will review your submission again. If everything is in order, you will proceed to the next steps of the onboarding process.</p>

        <p>If you have any questions or need further clarification, please feel free to contact us at <a href="mailto:hr@fincoopers.com">hr@fincoopers.com</a>.</p>

        <p>Thank you for your prompt attention to this matter.</p>

        <p>For more information, visit our website at <a href="https://fincoopers.com">fincoopers.com</a>.</p>

        <div class="footer">
            <p>Best regards,<br>
            HR Team<br>
            Fin Coopers<br>
            </p>
        </div>
    </div>
`;
    if (candidate.status === "shortlisted") {
      hrmsSendEmail(
        toEmails,
        ccEmails,
        "Action Required: Form Update and Document Re-upload",
        msg,
        ""
      );
      const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
        { _id: Id },
        { postOffer: "inprogress" },
        { new: true }
      );
      // Log the email in the mailsToCandidatesModel
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Action Required: Form Update and Document Re-upload",
        body: msg,
        jobApplyFormId: Id,
      });
      await mailData.save();

      success(res, "Mail send to candidate succesfully", mailData);
    } else {
      return badRequest(
        res,
        "Post offer cannot be send to a candidate without sendind preoffer or cannot send post offer twice"
      );
    }
  } catch (error) {
    // console.log(error);
    unknownError(res, error);
  }
}

// ------------------HRMS  create offer letter pdf ---------------------------------------

async function createOfferLetterPDF(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // //add salary and joining date
    const Id = req.body.Id;
    const package = req.body.package;
    const joiningDate = req.body.dateOfJoining;
    const company = req.body.company;
    const position = req.body.position;
    const candidateDat = await jobApplyFormModel.findById(Id);
    // console.log(candidateDat);
    // if(candidateDat.approvalPayrollfinOfferLetter ==="approved"){
      // return badRequest(res, "After approval from payroll cannot regenrate offer letter.");
    // }
    if(candidateDat.preOffer==="active"){
      return badRequest(res, "Cannot generate offer letter without sending selection mail.");
    }
    const candidateDetails = await jobApplyFormModel.findOneAndUpdate(
      { _id: Id }, // Your query
      { salary: package, joiningDate: joiningDate,approvalPayrollfinOfferLetter:"" }, // Fields to update
      { new: true } // Option to return the updated document
    ).populate("branchId");

    // console.log(candidateDetails);
    // console.log(req.body.dateOfJoining);
    // const candidateDetails = await jobApplyFormModel.findById(Id);
    // .populate("workLocationId");

    const pdfPath = await offerLetterPDF(
      candidateDetails,
      position,
      package,
      joiningDate,
      company,
      req.body.PF,
      req.body.ESIC
    );
    // console.log("pdfPath", pdfPath);
    // console.log("http://localhost:5500" + pdfPath);
    // const esignResult = await initESign({ fileName: doc.fileName });

    if (!pdfPath) {
      return res.status(500).json({
        errorName: "pdfGenerationError",
        message: "Error generating the offer letter PDF",
      });
    }

    // Update the candidateDetails document with the generated PDF path in finCooperOfferLetter
    const updatedCandidateDetails = await jobApplyFormModel.findByIdAndUpdate(
      { _id: Id },
      { pathofferLetterFinCooper: pdfPath,prevofferLetterFinCooper: candidateDat.pathofferLetterFinCooper,finCooperOfferLetter:"generated" },
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
    console.log(error);
    unknownError(res, error);
  }
}

async function createOfferlettertwo(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // //add salary and joining date
    const Id = req.body.Id;
    const package = req.body.package;
    const joiningDate = req.body.dateOfJoining;
    const company = req.body.company;
    const position = req.body.position;
    const candidateDat = await jobApplyFormModel.findById(Id);
    // console.log(candidateDat);
    // if(candidateDat.approvalPayrollfinOfferLetter ==="approved"){
      // return badRequest(res, "After approval from payroll cannot regenrate offer letter.");
    // }
    if(candidateDat.preOffer==="active"){
      return badRequest(res, "Cannot generate offer letter without sending selection mail.");
    }
    const candidateDetails = await jobApplyFormModel.findOneAndUpdate(
      { _id: Id }, // Your query
      { salary: package, joiningDate: joiningDate,approvalPayrollfinOfferLetter:"" }, // Fields to update
      { new: true } // Option to return the updated document
    ).populate("branchId");

    // console.log(candidateDetails);
    // console.log(req.body.dateOfJoining);
    // const candidateDetails = await jobApplyFormModel.findById(Id);
    // .populate("workLocationId");

    const pdfPath = await generateOfferLetterPDF(
      candidateDetails,
      position,
      package,
      joiningDate,
      company
    );
    // console.log("pdfPath", pdfPath);
    // console.log("http://localhost:5500" + pdfPath);
    // const esignResult = await initESign({ fileName: doc.fileName });

    if (!pdfPath) {
      return res.status(500).json({
        errorName: "pdfGenerationError",
        message: "Error generating the offer letter PDF",
      });
    }

    // Update the candidateDetails document with the generated PDF path in finCooperOfferLetter
    const updatedCandidateDetails = await jobApplyFormModel.findByIdAndUpdate(
      { _id: Id },
      { pathofferLetterFinCooper: pdfPath,prevofferLetterFinCooper: candidateDat.pathofferLetterFinCooper,finCooperOfferLetter:"generated" },
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
    console.log(error);
    unknownError(res, error);
  }
}


async function createOfferletterthree(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // //add salary and joining date
    const Id = req.body.Id;
    const package = req.body.package;
    const joiningDate = req.body.dateOfJoining;
    const company = req.body.company;
    const position = req.body.position;
    const candidateDat = await jobApplyFormModel.findById(Id);
    // console.log(candidateDat);
    // if(candidateDat.approvalPayrollfinOfferLetter ==="approved"){
      // return badRequest(res, "After approval from payroll cannot regenrate offer letter.");
    // }
    if(candidateDat.preOffer==="active"){
      return badRequest(res, "Cannot generate offer letter without sending selection mail.");
    }
    const candidateDetails = await jobApplyFormModel.findOneAndUpdate(
      { _id: Id }, // Your query
      { salary: package, joiningDate: joiningDate,approvalPayrollfinOfferLetter:"" }, // Fields to update
      { new: true } // Option to return the updated document
    ).populate("branchId");

    // console.log(candidateDetails);
    // console.log(req.body.dateOfJoining);
    // const candidateDetails = await jobApplyFormModel.findById(Id);
    // .populate("workLocationId");

    const pdfPath = await generateOfferLetter3(
      candidateDetails,
      position,
      package,
      joiningDate,
      company
    );
    // console.log("pdfPath", pdfPath);
    // console.log("http://localhost:5500" + pdfPath);
    // const esignResult = await initESign({ fileName: doc.fileName });

    if (!pdfPath) {
      return res.status(500).json({
        errorName: "pdfGenerationError",
        message: "Error generating the offer letter PDF",
      });
    }

    // Update the candidateDetails document with the generated PDF path in finCooperOfferLetter
    const updatedCandidateDetails = await jobApplyFormModel.findByIdAndUpdate(
      { _id: Id },
      { pathofferLetterFinCooper: pdfPath,prevofferLetterFinCooper: candidateDat.pathofferLetterFinCooper,finCooperOfferLetter:"generated" },
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
    console.log(error);
    unknownError(res, error);
  }
}

async function createOfferletter3(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // //add salary and joining date
    const Id = req.body.Id;
    const package = req.body.package;
    const joiningDate = req.body.dateOfJoining;
    const company = req.body.company;
    const position = req.body.position;
    const candidateDat = await jobApplyFormModel.findById(Id);
    console.log(candidateDat);
    // if(candidateDat.approvalPayrollfinOfferLetter ==="approved"){
      // return badRequest(res, "After approval from payroll cannot regenrate offer letter.");
    // }
    // if(candidateDat.preOffer==="active"){
    //   return badRequest(res, "Cannot generate offer letter without sending selection mail.");
    // }
    const candidateDetails = await jobApplyFormModel.findOneAndUpdate(
      { _id: Id }, // Your query
      { salary: package, joiningDate: joiningDate,approvalPayrollfinOfferLetter:"" }, // Fields to update
      { new: true } // Option to return the updated document
    ).populate("branchId");

    // console.log(candidateDetails);
    // console.log(req.body.dateOfJoining);
    // const candidateDetails = await jobApplyFormModel.findById(Id);
    // .populate("workLocationId");

    const pdfPath = await generateOfferLetterPDF1(
      candidateDetails,
      position,
      package,
      joiningDate,
      company
    );
    // console.log("pdfPath", pdfPath);
    // console.log("http://localhost:5500" + pdfPath);
    // const esignResult = await initESign({ fileName: doc.fileName });

    if (!pdfPath) {
      return res.status(500).json({
        errorName: "pdfGenerationError",
        message: "Error generating the offer letter PDF",
      });
    }

    // Update the candidateDetails document with the generated PDF path in finCooperOfferLetter
    // const updatedCandidateDetails = await jobApplyFormModel.findByIdAndUpdate(
    //   { _id: Id },
    //   { pathofferLetterFinCooper: pdfPath,prevofferLetterFinCooper: candidateDat.pathofferLetterFinCooper,finCooperOfferLetter:"generated" },
    //   { new: true }
    // );

    // if (!updatedCandidateDetails) {
    //   return res.status(404).json({
    //     errorName: "notFound",
    //     message: "Candidate details not found",
    //   });
    // }

    success(res, "PDF generated successfully", pdfPath);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


//  ------------ create another offer letter pdf -------------------

async function createAnotherOfferLetterPDF(req, res) {
  try{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    // Add salary and joining date //

    const Id = req.body.Id;
    const package = req.body.package;
    const joiningDate = req.body.dateOfJoining;
    const company = req.body.company;
    const position = req.body.position;

    const candidateDat = await jobApplyFormModel.findById(Id);
    if(candidateDat.preOffer==="active"){
      return badRequest(res, "Cannot generate offer letter without sending selection mail.");
    }

    const candidateDetails = await jobApplyFormModel.findOneAndUpdate(
      { _id: Id },
      { salary: package, joiningDate: joiningDate,approvalPayrollfinOfferLetter:"" },
      { new: true }
    ).populate("branchId");




  }catch(error){
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------HRMS  add esign  in offer letter ---------------------------------------

async function offerLetterEsignPDF(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const Id = req.body.Id;
    const salary = req.body.salary;
    const joiningDate = req.body.joiningDate;
    const candidateDetails = await jobApplyFormModel.findById(Id);
    // .populate("workLocationId");
    const candidateMoreDetails = await candidateDetailsModule.findOneAndUpdate(
      { jobApplyFormId: Id }, // Your query
      { salary: salary, joiningDate: joiningDate }, // Fields to update
      { new: true } // Option to return the updated document
    );
    // console.log(candidateMoreDetails);
    const pdfPath = await offerLetterPDF(
      candidateDetails,
      candidateMoreDetails,
      salary,
      joiningDate,
    );
    // console.log("pdfPath", pdfPath);
    success(res, "PDF generated successfully", pdfPath);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------HRMS send mail to reupload documents candidate data ---------------------------------------
async function sendOfferLetterCandidate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const validModes = ["candidate", "manager"];
    if (!validModes.includes(req.body.sendTo)) {
      return badRequest(res, "Send to must be 'candidate' or 'manager'");
    }
    //get interviewer details through token

    const baseURL = process.env.BASE_URL.replace(/\/$/, ""); 
    const Id = req.body.Id;
    const candidate = await jobApplyFormModel.findById(Id);
    // console.log(candidate);
    let toEmails;

    if(req.body.sendTo==="candidate"){
       toEmails = candidate.emailId;
    } else{
      const reportingManger = await employeModel.findById(req.body.reportingManagerId);
      toEmails = reportingManger.workEmail;
    }

    const ccEmails = process.env.HR3_EMAIL;
    const offerLetterPDF = candidate.pathofferLetterFinCooper;
    // const offerLetterPDF = baseURL+candidate.pathofferLetterFinCooper;
    // console.log(offerLetterPDF);
    if (!offerLetterPDF) {
      return badRequest(
        res,
        "Offer letter Not generated. First generate offer letter!"
      );
    }
    if (candidate.approvalPayrollfinOfferLetter ==="") {
      return badRequest(
        res,
        "Need approval from payroll on this offer letter"
      );
    }
    const userNameDetail = await employeModel.findOne({
      userName: req.body.userName,
    });
    if (userNameDetail) {
      return badRequest(res, "Username Already Exist for this candidate");
    }
    if (candidate.emailId) {
      const emailDetail = await employeModel.findOne({
        email: candidate.emailId,
      });
      if (emailDetail) {
        return badRequest(res, "Email Already Exist for this candidate");
      }
    }
    if (candidate.mobileNumber) {
      const mobileNoDetail = await employeModel.findOne({
        mobileNo: candidate.mobileNumber,
      });
      if (mobileNoDetail) {
        return badRequest(res, "mobileNo Already Exist for this candidate");
      }
    }
    let msg = `  <div class="container">
        <div class="header">
            <h1>Job Offer Letter</h1>
        </div>
        <div class="content">
            <h2>Dear ${candidate.name},</h2>
            <p>
                We are pleased to offer you the position of <strong>${candidate.position}</strong> at <strong>Fin Coopers</strong>. 
                We believe that your skills and experience will be a valuable addition to our team.
            </p>
            <p>
                Attached is your official offer letter. Please review it carefully and let us know if you have any questions.
            </p>
            <p>
                To view and download your offer letter, click the link below:
            </p>
            <p>
                <a href="${offerLetterPDF}" target="_blank">Download Offer Letter</a>
            </p>
            <p>
                We look forward to welcoming you to our team. Please confirm your acceptance.
            </p>
            <p>Thank you for considering this opportunity with us!</p>
            <p>For more information, visit our website at <a href="https://fincoopers.com">fincoopers.com</a>.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>
            HR Team<br>
            Fin Coopers<br>
            </p>
        </div>
    </div>
    `;
    if (candidate.status === "shortlisted") {

      hrmsSendEmail(toEmails, ccEmails, "Offer Letter", msg, "");
      
      // Log the email in the mailsToCandidatesModel
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Offer Letter",
        body: msg,
        jobApplyFormId: Id,
      });
      await mailData.save();
      
      const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
        { _id: Id },
        { postOffer: "generated" },
        { new: true }
      );
      
      const objectIdFields = [
        "secondaryDepartmentId",
        "seconSubDepartmentId",
        "subDepartmentId",
      ];

      objectIdFields.forEach((field) => {
        if (req.body[field]) {
          // Correct usage of isValid to check if it's a valid ObjectId string
          if (mongoose.Types.ObjectId.isValid(req.body[field])) {
            req.body[field] = new mongoose.Types.ObjectId(
              req.body[field]
            );
          } else {
            // Assign null if the value is invalid
            req.body[field] = null;
          }
        } else {
          // Assign null if the field is not provided
          req.body[field] = null;
        }
      });
      req.body.userName = jobApplyFormStatus.mobileNumber;
      const salt = await bcrypt.genSalt(10);
      const password = req.body.userName.toString()
      // console.log(password);
      req.body.password = await bcrypt.hash(password, salt);
      req.body.joiningDate = jobApplyFormModel.joiningDate;
      req.body.onboardingStatus = "joining";
      req.body.mobileNo = jobApplyFormStatus.mobileNumber;
      req.body.employeName = jobApplyFormStatus.name;
      req.body.email = jobApplyFormStatus.emailId;
      req.body.location = {
        type: "Point",
        coordinates: [0, 0], // Set to [0, 0] if latitude and longitude are not provided
      };

      const employeeData = await employeModel.create(req.body);
      
    //   let zohoMail =`<div class="container">
    // <div class="header">
    //   Welcome to Zoho Mail
    // </div>
    // <div class="content">
    //   <h1>Hello ${candidate.name},</h1>
    //   <p>
    //     Congratulations on joining Fin Coopers! We are excited to have you on board. As part of your onboarding process, we have created a Zoho Mail account for you. Below are your login credentials:
    //   </p>
    //   <div class="credentials">
    //     <p><strong>Email:</strong> ${req.body.workEmail}</p>
    //     <p><strong>Password:</strong> ${req.body.zohoPassword}</p>
    //   </div>
    //   <p>
    //     To access your Zoho Mail account, please log in at <a href="https://mail.zoho.com" target="_blank">mail.zoho.com</a>. For your security, we recommend changing your password after your first login.
    //   </p>
    //   <p>
    //     If you have any questions or face any issues, please feel free to reach out to us.
    //   </p>
    //    <p>Thank you for considering this opportunity with us!</p>
    //    <p>For more information, visit our website at <a href="https://fincoopers.com">fincoopers.com</a>.</p>
    // </div>
    //  <div class="footer">
    //         <p>Best regards,<br>
    //         HR Team<br>
    //         Fin Coopers<br>
    //         </p>
    //     </div>
    //   </div>`;
    //   hrmsSendEmail(toEmails, ccEmails, "ZOHO Credentials", zohoMail, "");

      let finexeMail =`<div class="container">
      <div class="header">
         Welcome to FINEXE 2.0
      </div>
      <div class="content">
      <h1>Hello ${candidate.name},</h1>
      <p>
        Congratulations on joining Fin Coopers! We are excited to have you on board. As part of your onboarding process, we have created a FINEXE 2.0 account for you. Below are your login credentials:
      </p>
      <div class="credentials">
        <p><strong>Username:</strong> ${req.body.userName}</p>
        <p><strong>Password:</strong> ${req.body.userName}</p>
      </div>
      <p>
        To access your FINEXE 2.0 account, please log in at <a href="https://finexe.fincooper.in/login/" target="_blank">FINEXE 2.0</a>.
      </p>
      <p>
        If you have any questions or face any issues, please feel free to reach out to us.
      </p>
       <p>Thank you for considering this opportunity with us!</p>
       <p>For more information, visit our website at <a href="https://fincoopers.com">fincoopers.com</a>.</p>
     </div>
     <div class="footer">
            <p>Best regards,<br>
            HR Team<br>
            Fin Coopers<br>
            </p>
        </div>
      </div>`;
  
      toEmails = candidate.emailId;
      hrmsSendEmail(toEmails, ccEmails, "FINEXE 2.0 Credentials", finexeMail, "");

      // const mailZohoData = new mailsToCandidatesModel({
      //   recipient: toEmails,
      //   subject: "ZOHO Mail",
      //   body: zohoMail,
      //   jobApplyFormId: Id,
      // });
      // await mailData.save();
      const mailFinexeData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Finexe Mail",
        body: finexeMail,
        jobApplyFormId: Id,
      });
      await mailData.save();


      success(res, "Mail send to candidate succesfully", );
    } else {
      return badRequest(
        res,
        "Offer letter cannot be send to a candidate without sending postoffer"
      );
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------HRMS send mail to reupload documents candidate data ---------------------------------------
async function resendOfferLetterCandidate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const validModes = ["candidate", "manager"];
    if (!validModes.includes(req.body.sendTo)) {
      return badRequest(res, "Send to must be 'candidate' or 'manager'");
    }
    //get interviewer details through token

    const baseURL = process.env.BASE_URL.replace(/\/$/, ""); 
    const Id = req.body.Id;
    const candidate = await jobApplyFormModel.findById(Id);
    // console.log("data",candidate);
    let toEmails;

    if(req.body.sendTo==="candidate"){
       toEmails = candidate.emailId;
    } else{
      const candEmployee = await employeModel.findOne({
        userName: candidate.mobileNumber,
      });
      const reportingManger = await employeModel.findById(candEmployee.reportingManagerId);
      // console.log(reportingManger.workEmail)
      toEmails = reportingManger.workEmail;
    }

    const ccEmails = process.env.HR3_EMAIL;
    const offerLetterPDF = candidate.pathofferLetterFinCooper;
    // const offerLetterPDF = baseURL+candidate.pathofferLetterFinCooper;
    // console.log(offerLetterPDF);
    if (!offerLetterPDF) {
      return badRequest(
        res,
        "Offer letter Not generated. First generate offer letter!"
      );
    }
    if (candidate.approvalPayrollfinOfferLetter ==="") {
      return badRequest(
        res,
        "Need approval from payroll on this offer letter"
      );
    }
    
    let msg = `  <div class="container">
        <div class="header">
            <h1>Job Offer Letter</h1>
        </div>
        <div class="content">
            <h2>Dear ${candidate.name},</h2>
            <p>
                We are pleased to offer you the position of <strong>${candidate.position}</strong> at <strong>Fin Coopers</strong>. 
            </p>
            <p>
                Attached is your official revised offer letter. Please review it carefully and let us know if you have any questions.
            </p>
            <p>
                To view and download your offer letter, click the link below:
            </p>
            <p>
                <a href="${offerLetterPDF}" target="_blank">Download Offer Letter</a>
            </p>
            <p>
                We look forward to welcoming you to our team. Please confirm your acceptance.
            </p>
            <p>Thank you for considering this opportunity with us!</p>
            <p>For more information, visit our website at <a href="https://fincoopers.com">fincoopers.com</a>.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>
            HR Team<br>
            Fin Coopers<br>
            </p>
        </div>
    </div>
    `;


    if (candidate.status === "shortlisted") {

      hrmsSendEmail(toEmails, ccEmails, "Offer Letter", msg, "");
      
      // Log the email in the mailsToCandidatesModel
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Offer Letter",
        body: msg,
        jobApplyFormId: Id,
      });
      await mailData.save();
      
      const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
        { _id: Id },
        { postOffer: "generated" },
        { new: true }
      );
      
      success(res, "Mail send to candidate succesfully", );
    } else {
      return badRequest(
        res,
        "Offer letter cannot be send to a candidate without sending postoffer"
      );
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------HRMS send mail to reupload documents candidate data ---------------------------------------
async function sendZohoCredentialsCandidate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    
    if(!req.body.zohoEmail|| !req.body.zohoPassword ){
      return badRequest(res, "Zoho mail and password are required");
    }
    
    const Id = req.body.Id;
    if (!Id) {
      return badRequest(res, "ID is required and cannot be empty");
    }
    if (!mongoose.Types.ObjectId.isValid(Id)) {
      return badRequest(res, "Invalid ID");
    }
    const candidate = await jobApplyFormModel.findById(Id);
    if (!candidate) {
      return badRequest(res, "Candidate not found");
    }
    if(candidate.sendZohoCredentials && candidate.sendZohoCredentials==="yes"){
      return badRequest(res, "Zoho credentials mail already send to candidate");
    }
    // console.log(candidate);
    const toEmails = candidate.emailId;
    const ccEmails = process.env.HR3_EMAIL;

      
    let zohoMail =`<div class="container">
        <div class="header">
           Welcome to Zoho Mail
        </div>
        <div class="content">
          <h1>Hello ${candidate.name},</h1>
          <p>
            Congratulations on joining Fin Coopers! We are excited to have you on board. As part of your onboarding process, we have created a Zoho Mail account for you. Below are your login credentials:
          </p>
          <div class="credentials">
            <p><strong>Email:</strong> ${req.body.zohoEmail}</p>
            <p><strong>Password:</strong> ${req.body.zohoPassword}</p>
          </div>
          <p>
            To access your Zoho Mail account, please log in at <a href="https://mail.zoho.com" target="_blank">mail.zoho.com</a>. For your security, we recommend changing your password after your first login.
          </p>
          <p>
            If you have any questions or face any issues, please feel free to reach out to us.
          </p>
          <p>Thank you for considering this opportunity with us!</p>
          <p>For more information, visit our website at <a href="https://fincoopers.com">fincoopers.com</a>.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>
            HR Team<br>
            Fin Coopers<br>
            </p>
        </div>
      </div>`;
      hrmsSendEmail(toEmails, ccEmails, "ZOHO Credentials", zohoMail, "");

      const jobApplyFormStatus = await jobApplyFormModel.findByIdAndUpdate(
        { _id: Id },
        {
          sendZohoCredentials: "yes"
        },
        { new: true }
      );
      // Log the email in the mailsToCandidatesModel
     
    
      const mailZohoData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "ZOHO Mail",
        body: zohoMail,
        jobApplyFormId: Id,
      });
      await mailZohoData.save();
      success(res, "Mail send to candidate succesfully", );
    
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------HRMS send mail to reupload documents candidate data ---------------------------------------
async function sendJoiningMailCandidate(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    //get interviewer details through token

    const baseURL = process.env.BASE_URL;
    const Id = req.body.Id;
    const candidate = await jobApplyFormModel.findById(Id);
    const candidateDetails = await candidateDetailsModule.findOne({
      jobApplyFormId: Id,
    });
    const toEmails = candidate.emailId;
    const ccEmails = process.env.HR3_EMAIL;
    // const userName = req.body.userName;${link}
    // const password = req.body.password;
    const link = `https://finexe-stage.fincooper.in/hrms/talantAquisition/joiningForm?candidateId=${candidateDetails._id}`;
    if (!candidate) {
      return badRequest(res, "Candidate not found!");
    }
    let msg = ` <div class="container">
        <div class="header">
            <h1>Welcome to Fin Coopers!</h1>
        </div>
        <div class="content">
            <p>Dear ${candidate.name},</p>
            <p>We are thrilled to welcome you to the Fin Coopers! As part of the onboarding process, please complete your joining form to help us set up your profile.</p>
            <p>Click the link below to access the form and fill in the required details:</p>
            <a href="${link}" class="button">Fill Out Joining Form</a>
            <p>We’re here to support you every step of the way as you begin this exciting journey with us. If you have any questions, feel free to reach out to our HR team.</p>
            <p>Looking forward to your first day!</p>

        </div>
     <div class="footer">
        <p>Best regards,<br>
        HR Team<br>
        Fin Coopers<br>
        </p>
    </div>
    </div>
`;
    if (candidate.status === "shortlisted") {
      hrmsSendEmail(toEmails, ccEmails, "Join Form Invitation", msg, "");

      // Log the email in the mailsToCandidatesModel
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Join Form Invitation",
        body: msg,
        jobApplyFormId: Id,
      });
      await mailData.save();

      success(res, "Mail send to candidate succesfully", mailData);
    } else {
      return badRequest(
        res,
        "Joining cannot be send twice or to this candidate"
      );
    }
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//------------------------------------Asset assigned to employee add -----------------------------------------------------
async function addAsset(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const assetDetails = await assetModel.create(req.body);

    success(res, "Asset Details Added Successfully", assetDetails);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//------------------------------------Assign employee to asset -----------------------------------------------------
async function addEmployeeToAsset(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const assetDetails = await assetModel.findByIdAndUpdate(
      { _id: req.body.Id },
      { employeeAssignedId: req.body.employeeAssignedId },
      { new: true }
    );

    success(res, "Asset Details Updated Successfully", assetDetails);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//------------------------------------Assign employee to asset -----------------------------------------------------
async function getEmployeeAsset(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const assetDetails = await assetModel
      .find({ status: "active" })
      .populate("employeeAssignedId");

    success(res, "Asset Details", assetDetails);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
// ------------------HRMS jobApplyForm manager review show data ---------------------------------------

async function getCandidateById(req, res) {
  try {
    let candidateId = await candidateDetailsModule
      .findById(req.params.candidateId)
      .populate("jobApplyFormId");
    let vacancyData = await vacancyRequestModel
      .find({ jobPostId: candidateId.jobApplyFormId.jobPostId })
      .populate({
        path: "createdByManagerId",
        select: "_id employeName status",
      });

    candidateId = candidateId.toObject();
    candidateId.vacancyData = vacancyData;

    success(res, "Candidate data", candidateId);
  } catch (error) {
    // console.log(error);
    unknownError(res, error);
  }
}

// -------------------------------PayROLL---------------------------------------

async function getOfferLetterPayRoll(req, res) {
  try {
    let payRollData = await jobApplyFormModel
      .find({ pathofferLetterFinCooper: { $ne: null } })
      .populate({
        path: "remarkFinCooperOfferLetter.addedBy",
        select: " employeName",
      });

    success(res, "Candidate data", payRollData);
  } catch (error) {
    // Handle error response
    unknownError(res, error);
  }
}
// -------------------------------PayROLL---------------------------------------

async function addReviewOfferLetterPayRoll(req, res) {
  try {
    const Id = req.body.jobFormId;
    const remark = req.body.remark;

    const payRollData = await jobApplyFormModel.findOneAndUpdate(
      { _id: Id },
      {
        $push: {
          remarkFinCooperOfferLetter: {
            remark: remark,
            addedBy: req.Id,
          },
        },
        approvalPayrollfinOfferLetter: req.body.status,
      },
      { new: true }
    );

    success(res, "Remark Added Successfully",payRollData);
  } catch (error) {
    // Handle error response
    unknownError(res, error);
  }
}
//-----------------------------------------------------------------------------
// async function addHRFeedback(req, res) {
//   try {
//     // Validate incoming request data
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return serverValidation({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }
//     // console.log(req.body.jobFormId);
//     const jobFormId = req.body.jobFormId;
//     const hrId = req.Id; 
//     let status = req.body.furtherProcessProfile === "no" ? "hold" : "inProgress";
//      // Check if feedback from this HR already exists
//      const existingFeedback = await jobApplyFormModel.findOne({
//       _id: jobFormId,
//       "feedbackByHR.hrId": hrId,
//     });

//     if (existingFeedback) {
//       return badRequest(res, "Feedback already exists for this candidate.");
//     }
//     const updatedJobForm = await jobApplyFormModel.findByIdAndUpdate(
//       jobFormId,
//       {
//         $push: {
//           feedbackByHR: {
//             hrId: req.Id,
//             furtherProcessProfile: req.body.furtherProcessProfile,
//             remark: req.body.remark , 
//           },
//         },
//         status:status
//       },
//       { new: true } 
//     );
//     if(req.body.furtherProcessProfile==="no"){
//       const data = await interviewDetailsModel.findOneAndUpdate(
//         { jobApplyFormId: jobFormId },
//         { interviewStatus: "cancelled", reasonCancel: req.body.remark },
//         { new: true }
//       );
//     }
    
//     success(
//       res,
//       "Feedback added Successfully",
//       updatedJobForm
//     );
//   } catch (error) {
//     // Handle any unexpected errors
//     console.log(error);
//     unknownError(res, error);
//   }
// }
async function addHRFeedback(req, res) {
  try {
    // Validate incoming request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    // console.log(req.body.jobFormId);
    const jobFormId = req.body.jobFormId;
    const hrId = req.Id; 
    let status;
    const existingFeedback = await jobApplyFormModel.findOne({
      _id: jobFormId
    });
    let interviewTaken = "yes";

    if(existingFeedback.jobFormType === "recommended"){
      status = req.body.furtherProcessProfile === "no" ? "reject" : "inProgress";
      // interviewTaken = req.body.furtherProcessProfile === "no" ? "no" : "yes";

    }else{
      status = req.body.furtherProcessProfile === "no" ? "reject" : "active";
      // interviewTaken = "yes"
    }
    console.log(status);
     // Check if feedback from this HR already  exists
     

    if (existingFeedback.feedbackByHr==="added") {
      return badRequest(res, "Feedback already exists for this candidate.");
    }
    const updatedJobForm = await jobApplyFormModel.findByIdAndUpdate(
      jobFormId,
      {
        status:status,
        feedbackByHr:"added",
        hrInterviewSchedule:"done",
      },
      { new: true } 
    );
    // let interviewTaken;
    // if(req.body.furtherProcessProfile==="no"){
    //   interviewTaken ="no"
    // }else{
    //   interviewTaken ="yes"
    // }
    const feedbackData = {
      ...req.body,
      interviewerId: hrId,
      interviewTaken:interviewTaken,
      feedbackBy :"HR",
      jobApplyFormId:jobFormId
    };

    const feedbackInterviewer = await feedbackInterviewerModel.create(
      feedbackData
    );

    if(req.body.furtherProcessProfile==="no"){
      const data = await interviewDetailsModel.findOneAndUpdate(
        { jobApplyFormId: jobFormId },
        { interviewStatus: "cancelled", reasonCancel: req.body.remark },
        { new: true }
      );
    }
    
    success(
      res,
      "HR Feedback added Successfully",
      updatedJobForm
    );
  } catch (error) {
    // Handle any unexpected errors
    console.log(error);
    unknownError(res, error);
  }
}
//------------------recommended get rejected candidate that HR rejected---------------------------------------------
async function getRecommendedHrRejected(req, res) {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    const statuses = ["reject"];

    const jobApplyForms = await jobApplyFormModel.find({
      status: { $in: statuses },
      jobFormType:"recommended",
      
    })
    .populate({ path: "recommendedByID", select: "_id employeName" })
    .populate("hrInterviewDetailsId")
    .populate("vacancyRequestId")
    .populate("departmentId")
    .populate("hrInterviewDetailsId")
    ;
console.log(jobApplyForms.length)
    success(res, "Jobform data", jobApplyForms);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//---------------------------------------add api for website joining form--------------------------------------------
async function addDirectJoining(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
  
    req.body.onboardingStatus="notOnboarded";

    const alreadyDirectJoining = await directJoiningModel.findOne({
      mobileNumber: req.body.mobileNumber 
    });
    
    if(alreadyDirectJoining){
      return badRequest(res, "Form already submitted");
    }

    // check candidate exists in the system //

    const candidate = await employeModel.findOne({ mobileNo: req.body.mobileNumber });

    if(candidate){
      return badRequest(res, "Candidate already exists in the system");
    }
    const directJoining = await directJoiningModel.create(req.body);
    
    success(res, "Joining form submitted successfully", directJoining);
   
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//--------------------------------------------------------------------------------------------------------------
async function getDirectJoining(req, res) {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const directJoining = await directJoiningModel
      .find({ status: "active" })
      .sort({ createdAt: -1 });

    success(res, "Direct Joining Data", directJoining);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//-----------------------------------------------------------------------

async function getJoiningById(req, res) {
  try {
    id = req.params.joiningId;
    if (!id || id.trim() === "") {
      return badRequest(res, "ID is required and cannot be empty");
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, "Invalid ID");
    }

    let directJoining = await directJoiningModel
      .findById(id);

    success(res, "Direct Joining by id ", {candidateDetails: directJoining});
  } catch (error) {
    // console.log(error);
    unknownError(res, error);
  }
}

//-----------------------------------CTC from gross LPA---------------------------
async function calculateCTCFromLpa(req, res) {
  try {
    const lpa = req.body.package;
    const PF = req.body.PF;
    const ESIC = req.body.ESIC;
    const gross = lpa / 12; // Monthly gross salary
    const basic = gross / 2; // Basic salary (50% of gross)
  
    const hra = 0.4 * gross; // 40% of gross
    const specialAllowance = 0.1 * gross; // 10% of gross
    let epf = 0;
    let pfDeduction = 0;
  
    if (PF === "yes") {
      if ((gross - hra) > 15000) {
        epf = Math.round(0.1316 * 15000); // 13.61% of 15000, rounded to nearest integer
        pfDeduction = Math.round(0.12 * 15000); // 12% of 15000, rounded to nearest integer
      } else {
        epf = Math.round(0.1316 * (gross - hra)); // 13.61% of (gross - HRA), rounded to nearest integer
        pfDeduction = Math.round(0.12 * (gross - hra)); // 12% of (gross - HRA), rounded to nearest integer
      }
    } else if (PF === "no") {
      epf = 0;
      pfDeduction = 0;
    }
    // const epf = (0.1316 * (gross - hra)).toFixed(2); // 13.61% of (gross - HRA)
  
    // Calculate ESIC based on gross
    // console.log(ESIC);
    let esic = 0;
    let esicDeduction = 0;
    if (ESIC === "yes") {
      // console.log(gross);
      if (gross < 21000) {
        // console.log("gross");
        esicDeduction = Math.round(0.0075 * gross);
        // console.log(esicDeduction);
        esic = Math.round(0.0325 * gross); // 3.25% of (gross - HRA)
      } else {
        esicDeduction = 0;
        esic = 0; // No ESIC if gross is 21000 or more
      }
    }
  
    const subtotal = Math.round(parseFloat(epf) + parseFloat(esic)); // Subtotal
    const costOfCompany = Math.round(parseFloat(gross) + parseFloat(subtotal)); // Cost to company
    
    success(res, "Cost Of Company", {costOfCompany:costOfCompany*12});
  } catch (error) {
    // console.log(error);
    unknownError(res, error);
  }
}



async function sendOnlineInterviewReminder() {
  try {
    const currentTime = new Date();
    const threeHoursLater = moment(currentTime).add(3, "hours").toDate();

    // Find upcoming online interviews within the next 3 hours where ReminderStatus is false
    const upcomingInterviews = await interviewDetailsModel.find({
      mode: "online",
      interviewStatus: "active", // Only active interviews
      ReminderStatus: "false", // Only send reminders if not already sent
      interviewDate: moment(currentTime).format("YYYY-MM-DD"),
      interviewTime: {
        $gte: moment(currentTime).format("HH:mm"),
        $lte: moment(threeHoursLater).format("HH:mm"),
      },
    }).populate("jobApplyFormId interviewerId");

    if (!upcomingInterviews.length) {
      console.log("No upcoming online interviews within 3 hours.");
      return;
    }

    console.log(`Sending reminder emails to ${upcomingInterviews.length} candidates.`);

    for (const interview of upcomingInterviews) {
      const candidate = interview.jobApplyFormId;
      const interviewer = interview.interviewerId;
      if (!candidate || !interviewer || !candidate.emailId) continue;

      // const toEmails = candidate.emailId; // Candidate's email

      const reminderMsg = `<table style="width: 100%; max-width: 600px; margin: auto; border-collapse: collapse; background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd;">
      <tr>
          <td style="padding: 20px; text-align: left;">
              <p style="color: #555;">Dear ${interviewer.name},</p>
              <p style="color: #555;">
                  This is a reminder that you have a scheduled **online interview**.
              </p>
              <p style="color: #555;">
                  <strong>Candidate Name:</strong> ${candidate.name} <br>
                  <strong>Position Applied:</strong> ${candidate.position} <br>
                  <strong>Interview Date:</strong> ${moment(interview.interviewDate).format("DD-MM-YYYY")} <br>
                  <strong>Interview Time:</strong> ${interview.interviewTime} <br>
                  <strong>Meeting Link:</strong> <a href="${interview.googleLink}">Join Meeting</a>
              </p>
              <p style="color: #555;">
                  Please ensure that you are available on time for the interview. If you have any concerns, feel free to reach out to HR.
              </p>
              <p style="color: #555;">
                  Best regards,<br>
                  HR Department<br>
                  hr@fincoopers.com
              </p>
          </td>
      </tr>
  </table>`;

      // Send email reminder
      await hrmsSendEmail(process.env.HRMS_EMAIL_USER, [], "Reminder: Online HR Interview in 3 Hours", reminderMsg, "");

      // Update ReminderStatus to true
      await interviewDetailsModel.updateOne(
        { _id: interview._id },
        { $set: { ReminderStatus: "true" } }
      );

      console.log(`Reminder sent to ${candidate.emailId} and ReminderStatus updated.`);
    }
  } catch (error) {
    console.error("Error sending interview reminders:", error);
  }
}




// // Schedule this function to run every 15 minutes
// cron.schedule("*/1 * * * *", () => {
//   console.log("Checking for upcoming online interviews...");
//   sendOnlineInterviewReminder();
// })




module.exports = {
  sendPreOfferCandidate,
  sendPostOfferCandidate,
  addCandidateDocument,
  getCandidateDetails,
  updateCandidateDocument,
  sendupadteFormMailCandidate,
  createOfferLetterPDF,
  offerLetterEsignPDF,
  sendOfferLetterCandidate,
  sendZohoCredentialsCandidate,
  sendJoiningMailCandidate,
  addAsset,
  addEmployeeToAsset,
  getEmployeeAsset,
  getCandidateById,
  getOfferLetterPayRoll,
  addReviewOfferLetterPayRoll,
  hrInterviewSchedule,
  rescheduleHrInterview,
  addHRFeedback,
  getRecommendedHrRejected,
  addDirectJoining,
  getDirectJoining,
  getJoiningById,
  calculateCTCFromLpa,
  resendOfferLetterCandidate,
  createOfferlettertwo,
  createOfferletter3,
  createOfferletterthree
};



