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
const employeeModel = require("../../model/adminMaster/employe.model");
const employeeLeaveModel = require("../../model/hrms/employeeLeave.model");
const { sendEmail, hrmsSendEmail } = require("../functions.Controller");
const mailsToCandidatesModel = require("../../model/hrms/mailsToCandidate.model");
//-------------------------------Add leave employee want to take leave ----------------------------------------------
async function addEmployeeLeave(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    req.body.employeeId = req.Id;
    if (!req.Id) {
      return badRequest(res, "ID is required and cannot be empty");
    }
    if (!mongoose.Types.ObjectId.isValid(req.Id)) {
      return badRequest(res, "Invalid ID");
    }

    const { startDate, endDate } = req.body;

    // Ensure dates are valid and parse them
    if (!startDate || !endDate) {
      return badRequest(res, "Start Date and End Date are required");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return badRequest(res, "Invalid date format");
    }

    // Check for overlapping leave periods
    const existingLeave = await employeeLeaveModel.findOne({
      employeeId: req.Id,
      $or: [
        { startDate: { $lte: start }, endDate: { $gte: end } }, // Overlap condition
      ],
    });

    if (existingLeave) {
      return badRequest(
        res,
        `A leave request already exists for the employee from ${new Date(
          existingLeave.startDate
        ).toLocaleDateString()} to ${new Date(
          existingLeave.endDate
        ).toLocaleDateString()}`
      );
    }
    const employee = await employeeModel.findById(req.Id);
    req.body.reportingManagerId = employee.reportingManagerId;
    // console.log(employee.reportingManagerId)
    const reportingManager = await employeeModel.findById(
      employee.reportingManagerId
    );
    const employeeLeave = await employeeLeaveModel.create(req.body);
    const toEmails = employee.workEmail;
    const ccEmails = process.env.HR3_EMAIL;
    // ${candidate.name}
    const msg = `
    <div style="font-family: Arial, sans-serif; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; max-width: 700px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
  <div style="text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 15px;">
    <h1 style="color: #007bff; font-size: 28px; margin: 0;">Leave Application</h1>
    <p style="color: #555; font-size: 14px; margin-top: 5px;">Your leave request details</p>
  </div>
  
  <div style="padding: 20px; color: #333;">
    <p style="font-size: 16px; line-height: 1.6;">Dear <b>${
      employee.employeName
    }</b>,</p>
    <p style="font-size: 16px; line-height: 1.6;">Your leave request has been submitted successfully. Below are the details:</p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
      <tr style="background-color: #f7f9fc;">
        <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">Employee Name</th>
        <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${
          employee.employeName
        }</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">Start Date</th>
        <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${new Date(
          employeeLeave.startDate
        ).toLocaleDateString()}</td>
      </tr>
      <tr style="background-color: #f7f9fc;">
        <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">End Date</th>
        <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${new Date(
          employeeLeave.endDate
        ).toLocaleDateString()}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">Reason</th>
        <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${
          employeeLeave.reasonForLeave
        }</td>
      </tr>
    </table>

    <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
      The leave request has been sent to your reporting manager, <b>${
        reportingManager?.employeName
      }</b> for approval.
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
      Best regards,<br>
      <b>Fin Coopers</b>
    </p>
  </div>

  <div style="border-top: 1px solid #e0e0e0; padding-top: 10px; text-align: center; color: #777; font-size: 12px; margin-top: 20px;">
    <p>This is an automated message. Please do not reply.</p>
  </div>
</div>

`;

    hrmsSendEmail(toEmails, ccEmails, "Leave Application", msg, "");
    // Log the email in the mailsToCandidatesModel
    const mailData = new mailsToCandidatesModel({
      recipient: toEmails,
      subject: "Leave Application",
      body: msg,
    });
    await mailData.save();

    if (reportingManager) {
      const reportingMsg = `
    <div style="font-family: Arial, sans-serif; margin: 20px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; max-width: 700px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
  <div style="text-align: center; border-bottom: 1px solid #e0e0e0; padding-bottom: 15px;">
    <h1 style="color: #2d89ef; font-size: 24px; margin: 0;">Leave Request Approval</h1>
    <p style="color: #6c757d; font-size: 14px; margin: 5px 0;">An action is required from you</p>
  </div>
  
  <div style="padding: 20px;">
    <p style="font-size: 16px; color: #333; line-height: 1.6;">
      Dear <b>${reportingManager.employeName}</b>,
    </p>
    <p style="font-size: 16px; color: #333; line-height: 1.6;">
      You have received a leave request from your team member, <b>${
        employee.employeName
      }</b>. Below are the details of the leave application:
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; color: #333;">
      <tr style="background-color: #f8f9fa;">
        <th style="text-align: left; padding: 10px; border: 1px solid #e0e0e0;">Employee Name</th>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${
          employee.employeName
        }</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 10px; border: 1px solid #e0e0e0;">Start Date</th>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${new Date(
          employeeLeave.startDate
        ).toLocaleDateString()}</td>
      </tr>
      <tr style="background-color: #f8f9fa;">
        <th style="text-align: left; padding: 10px; border: 1px solid #e0e0e0;">End Date</th>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${new Date(
          employeeLeave.endDate
        ).toLocaleDateString()}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 10px; border: 1px solid #e0e0e0;">Reason</th>
        <td style="padding: 10px; border: 1px solid #e0e0e0;">${
          employeeLeave.reasonForLeave
        }</td>
      </tr>
    </table>

    <p style="font-size: 16px; color: #333; line-height: 1.6;">
      Please review this request and take the necessary action.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://finexe.fincooper.in/employesetup/leaveSection/approveLeave/" style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
        Review and Approve
      </a>
    </div>

    <p style="font-size: 14px; color: #6c757d; line-height: 1.6; margin-top: 20px;">
      Best regards,<br>
      <b>Fin Coopers</b>
    </p>
  </div>

  <div style="border-top: 1px solid #e0e0e0; padding-top: 10px; text-align: center; color: #6c757d; font


`;

      hrmsSendEmail(
        reportingManager.workEmail,
        ccEmails,
        "Leave Request Pending Approval",
        reportingMsg,
        ""
      );
      // Log the email in the mailsToCandidatesModel
      const mailDatareporting = new mailsToCandidatesModel({
        recipient: reportingManager.workEmail,
        subject: "Leave Request Pending Approval",
        body: reportingMsg,
      });
      await mailDatareporting.save();
    }

    success(res, "Leave Added Successfully", employeeLeave);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//----------------------------------get all employee leave data---------------------------------------

async function getAllLeave(req, res) {
  try {
    let employeeLeave = await employeeLeaveModel
      .find({
        status: "active",
      })
      .populate({ path: "employeeId", select: "_id employeName status" })
      .populate({
        path: "reportingManagerId",
        select: "_id employeName status",
      }).populate({ path: "leaveType", select: "_id leaveTypeName" })
      .sort({ updatedAt: -1 });

    success(res, "Employee Leave data", employeeLeave);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//-------------------------------------------get api to show leave employee added for his view----------------------------------------------------
async function getLeaveForEmployee(req, res) {
  try {
    let employeeLeave = await employeeLeaveModel
      .find({
        employeeId: req.Id,
      })
      .populate({ path: "employeeId", select: "_id employeName status" })
      .populate({
        path: "reportingManagerId",
        select: "_id employeName status",
      })
      .populate({ path: "leaveType", select: "_id leaveTypeName" });
    let approve = await employeeLeaveModel.find({
      employeeId: req.Id,
      approvalByReportingManager: "yes",
    });
    let reject = await employeeLeaveModel.find({
      employeeId: req.Id,
      approvalByReportingManager: "no",
    });
    const totalLeave = employeeLeave.length;
    const totalApprove = approve.length;
    const totalReject = reject.length;
    success(res, "Employee Leave data", {
      totalLeave,
      totalApprove,
      totalReject,
      employeeLeave,
    });
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

//----------------------------------get employee leave data for reporting manager---------------------------------------

async function getLeavereportingmanager(req, res) {
  try {
    let employeeLeave = await employeeLeaveModel
      .find({
        reportingManagerId: req.Id,
      })
      .populate({ path: "employeeId", select: "_id employeName status" })
      .populate({
        path: "reportingManagerId",
        select: "_id employeName status",
      });

    success(res, "Employee Leave data", employeeLeave);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
//-------------------------------get approval reporting Manager ----------------------------------------------
async function approvalEmployeeLeave(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }
    if (!req.body.employeeLeaveId || req.body.employeeLeaveId.trim() === "") {
      return badRequest(res, "ID is required and cannot be empty");
    }
    if (!mongoose.Types.ObjectId.isValid(req.body.employeeLeaveId)) {
      return badRequest(res, "Invalid ID");
    }

    const employeeLeave = await employeeLeaveModel.findByIdAndUpdate(
      { _id: req.body.employeeLeaveId },
      {
        approvalByReportingManager: req.body.approval,
        reasonByReportingManager: req.body.reason,
      },
      { new: true }
    );
    const employee = await employeeModel.findById(employeeLeave.employeeId);
    const reportingManager = await employeeModel.findById(
      employeeLeave.reportingManagerId
    );
    const toEmails = employee.workEmail;
    const ccEmails = [reportingManager.workEmail, process.env.HR3_EMAIL];
    // ${candidate.name}
    let approvalStatus;
    if (employeeLeave.approvalByReportingManager === "yes") {
      approvalStatus = "Approved";
    } else {
      approvalStatus = "Not Approved";
    }
    const msg = `
    <div style="font-family: Arial, sans-serif; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; max-width: 700px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
  <div style="text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 15px;">
    <h1 style="color: #007bff; font-size: 28px; margin: 0;">Leave Application Update</h1>
    <p style="color: #555; font-size: 14px; margin-top: 5px;">Status of your leave request</p>
  </div>
  
  <div style="padding: 20px; color: #333;">
    <p style="font-size: 16px; line-height: 1.6;">Dear <b>${
      employee.employeName
    }</b>,</p>
    <p style="font-size: 16px; line-height: 1.6;">Your leave application has been updated. Below are the details:</p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
      <tr style="background-color: #f7f9fc;">
        <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">Employee Name</th>
        <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${
          employee.employeName
        }</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">Start Date</th>
        <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${new Date(
          employeeLeave.startDate
        ).toLocaleDateString()}</td>
      </tr>
      <tr style="background-color: #f7f9fc;">
        <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">End Date</th>
        <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${new Date(
          employeeLeave.endDate
        ).toLocaleDateString()}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">Reason</th>
        <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${
          employeeLeave.reasonForLeave
        }</td>
      </tr>
      <tr style="background-color: #f7f9fc;">
        <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">Action Performed</th>
        <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${approvalStatus}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">Comments</th>
        <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${
          employeeLeave.reasonByReportingManager
        }</td>
      </tr>
    </table>

    <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
      If you have any questions, please contact your reporting manager or the HR department.
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
      Best regards,<br>
      <b>Fin Coopers</b>
    </p>
  </div>

  <div style="border-top: 1px solid #e0e0e0; padding-top: 10px; text-align: center; color: #777; font-size: 12px; margin-top: 20px;">
    <p>This is an automated message. Please do not reply.</p>
  </div>
</div>

`;

    hrmsSendEmail(toEmails, ccEmails, "Leave Application", msg, "");
    // Log the email in the mailsToCandidatesModel
    const mailData = new mailsToCandidatesModel({
      recipient: toEmails,
      subject: "Leave Application",
      body: msg,
    });
    await mailData.save();

    success(res, "Leave Application Update", employeeLeave);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}
module.exports = {
  addEmployeeLeave,
  getAllLeave,
  getLeavereportingmanager,
  approvalEmployeeLeave,
  getLeaveForEmployee,
};
