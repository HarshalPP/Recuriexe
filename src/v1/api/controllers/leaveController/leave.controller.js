import LeaveType from "../../models/leaveModel/leavetype.model.js"
import Leave from "../../models/leaveModel/leave.model.js"
import employeModel from "../../models/employeemodel/employee.model.js"
import mailsToCandidatesModel from "../../models/mailsendCandidate/sendEmailcandidate.model.js"
  import{hrmsSendEmail} from "../../services/emailservices/email.services.js"
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import mailSwitchModel from "../../models/mailModel/mailSwitch.model.js"

import {
  success,
  unknownError,
  serverValidation,
  badRequest,
} from "../../formatters/globalResponse.js"



// Add Leave Type
export const addLeaveType = async (req, res) => {
    try {
      const updatedata = req.body;
  
      if (!updatedata.leaveTypeName) {
        return serverValidation(res, "Leave Type is required");
      }
  
      const leaveTypeExist = await LeaveType.findOne({ leaveTypeName: updatedata.leaveTypeName });
      if (leaveTypeExist) {
        return badRequest(res, "Leave Type Already Exists");
      }
  
      const leaveTypeData = new LeaveType(updatedata);
  
      await leaveTypeData.save();
      return success(res, "Leave Type Added Successfully", leaveTypeData);
    } catch (error) {
      return unknownError(res, error.message);
    }
  };

// Get All Leave Types
export const getAllLeaveType = async (req, res) => {
  try {
    const leaveTypeData = await LeaveType.find({status:"active"}).sort({ createdAt: -1 });
    return success(res, "Leave Type Data", leaveTypeData);
  } catch (error) {
    return unknownError(res, error.message);
  }
};


// Update Leave type //

export const UpdateLeaveType = async (req, res) => {
    try {
      const { id, ...updateData } = req.body;
  
      if (!id) {
        return badRequest(res, "Please provide the leave type ID");
      }
  
      const updatedLeaveType = await LeaveType.findByIdAndUpdate(
        id,
        updateData,
        { new: true } // return the updated document
      );
  
      if (!updatedLeaveType) {
        return badRequest(res, "Leave Type not found");
      }
  
      return success(res, "Leave Type updated successfully", updatedLeaveType);
    } catch (error) {
      return unknownError(res, error.message);
    }
  };





  // Leave apply form //


  export const addEmployeeLeave = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation(res, "Validation failed", errors.array());
      }
  
      const organizationId = req.employee.organizationId
      req.body.employeeId = req.employee.id;
      if (!req.employee.id || !mongoose.Types.ObjectId.isValid(req.employee.id)) {
        return badRequest(res, "Invalid or missing employee ID");
      }
  
      const { startDate, endDate } = req.body;
  
      if (!startDate || !endDate) {
        return badRequest(res, "Start Date and End Date are required");
      }
  
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      if (isNaN(start) || isNaN(end)) {
        return badRequest(res, "Invalid date format");
      }
  
      const existingLeave = await Leave.findOne({
        employeeId: req.employee.id,
        $or: [
          { startDate: { $lte: start }, endDate: { $gte: end } },
        ],
      });
  
      if (existingLeave) {
        return badRequest(
          res,
          `A leave already exists from ${existingLeave.startDate.toLocaleDateString()} to ${existingLeave.endDate.toLocaleDateString()}`
        );
      }
  
      const employee = await employeModel.findById(req.employee.id);
      req.body.reportingManagerId = employee.reportingManagerId;


          // Retrieve reporting manager here
    const reportingManager = await employeModel.findById(employee.reportingManagerId);

  
      const employeeLeave = await Leave.create(req.body);
      const toEmails = employee.workEmail;
      const ccEmails = process.env.HR3_EMAIL;
  
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

 const leaveMail = await mailSwitchModel.findOne({organizationId:new mongoose.Types.ObjectId(organizationId)});
              if (leaveMail?.masterMailStatus && leaveMail?.hrmsMail.hrmsMail && leaveMail?.hrmsMail.leaveMailToEmployee) {
                await hrmsSendEmail(toEmails, ccEmails, "Leave Application", msg, "");
              }


      await new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Leave Application",
        body: msg,
      }).save();
  
      if (reportingManager) {
         const leaveMail = await mailSwitchModel.findOne({organizationId:new mongoose.Types.ObjectId(organizationId)});
              if (leaveMail?.masterMailStatus && leaveMail?.hrmsMail.hrmsMail && leaveMail?.hrmsMail.leaveMailToManager) {
                
                await hrmsSendEmail(
          reportingManager.workEmail,
          ccEmails,
          "Leave Request Pending Approval",
          reportingMsg,
          ""
        );
      }
        await new mailsToCandidatesModel({
          recipient: reportingManager.workEmail,
          subject: "Leave Request Pending Approval",
          body: reportingMsg,
        }).save();
      }
  
      return success(res, "Leave Added Successfully", employeeLeave);
    } catch (error) {
      console.error(error);
      return unknownError(res, error.message);
    }
  };


  // get all Leave //

  export const getAllLeave = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // default to page 1
      const limit = parseInt(req.query.limit) || 10; // default to 10 items per page
      const skip = (page - 1) * limit;
  
      const [employeeLeave, totalCount] = await Promise.all([
        Leave.find({ status: "active" })
          .populate({ path: "employeeId", select: "_id employeName status" })
          .populate({ path: "reportingManagerId", select: "_id employeName status" })
          .populate({ path: "leaveType", select: "_id leaveTypeName" })
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit),
        Leave.countDocuments({ status: "active" }),
      ]);
  
      return success(res, "Employee Leave data", {
        data: employeeLeave,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      console.error(error);
      return unknownError(res, error.message);
    }
  };
  


  // get leave for employee //


  export const getLeaveForEmployee = async (req, res) => {
    try {
      const employeeId = req.employee.id;
  
      const [employeeLeave, approve, reject] = await Promise.all([
        Leave
          .find({ employeeId })
          .populate({ path: "employeeId", select: "_id employeName status" })
          .populate({ path: "reportingManagerId", select: "_id employeName status" })
          .populate({ path: "leaveType", select: "_id leaveTypeName" }),
  
          Leave.find({ employeeId, approvalByReportingManager: "yes" }),
          Leave.find({ employeeId, approvalByReportingManager: "no" }),
      ]);
  
      const totalLeave = employeeLeave.length;
      const totalApprove = approve.length;
      const totalReject = reject.length;
  
      return success(res, "Employee Leave data", {
        totalLeave,
        totalApprove,
        totalReject,
        employeeLeave,
      });
    } catch (error) {
      console.error(error);
      return unknownError(res, error.message);
    }
  };


// Reporting Manager // 

  export const getLeaveReportingManager = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
  
      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      const [employeeLeave, total] = await Promise.all([
        Leave
          .find({ reportingManagerId: req.employee.id })
          .populate({ path: "employeeId", select: "_id employeName status" })
          .populate({ path: "reportingManagerId", select: "_id employeName status" })
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
          Leave.countDocuments({ reportingManagerId: req.Id }),
      ]);
  
      return success(res, "Employee Leave data", {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        data: employeeLeave,
      });
    } catch (error) {
      console.error(error);
      return unknownError(res, error.message);
    }
  };


  // Approval Reporting Manager //

  export const approvalEmployeeLeave = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const { employeeLeaveId, approval, reason } = req.body;
   const organizationId = req.employee.organizationId
      if (!employeeLeaveId || employeeLeaveId.trim() === "") {
        return badRequest(res, "ID is required and cannot be empty");
      }
  
      if (!mongoose.Types.ObjectId.isValid(employeeLeaveId)) {
        return badRequest(res, "Invalid ID");
      }
  
      const employeeLeave = await Leave.findByIdAndUpdate(
        { _id: employeeLeaveId },
        {
          approvalByReportingManager: approval,
          reasonByReportingManager: reason,
        },
        { new: true }
      );
  
      if (!employeeLeave) {
        return badRequest(res, "Leave application not found");
      }
  
      const employee = await employeModel.findById(employeeLeave.employeeId);
      const reportingManager = await employeModel.findById(employeeLeave.reportingManagerId);
  
      const toEmails = employee.workEmail;
      const ccEmails = [reportingManager.workEmail, process.env.HR3_EMAIL];
  
      const approvalStatus = employeeLeave.approvalByReportingManager === "yes" ? "Approved" : "Not Approved";
  
      const msg = `
      <div style="font-family: Arial, sans-serif; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; max-width: 700px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 15px;">
          <h1 style="color: #007bff; font-size: 28px; margin: 0;">Leave Application Update</h1>
          <p style="color: #555; font-size: 14px; margin-top: 5px;">Status of your leave request</p>
        </div>
        <div style="padding: 20px; color: #333;">
          <p style="font-size: 16px; line-height: 1.6;">Dear <b>${employee.employeName}</b>,</p>
          <p style="font-size: 16px; line-height: 1.6;">Your leave application has been updated. Below are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
            <tr style="background-color: #f7f9fc;">
              <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">Employee Name</th>
              <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${employee.employeName}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">Start Date</th>
              <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${new Date(employeeLeave.startDate).toLocaleDateString()}</td>
            </tr>
            <tr style="background-color: #f7f9fc;">
              <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">End Date</th>
              <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${new Date(employeeLeave.endDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">Reason</th>
              <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${employeeLeave.reasonForLeave}</td>
            </tr>
            <tr style="background-color: #f7f9fc;">
              <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">Action Performed</th>
              <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${approvalStatus}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 12px; border: 1px solid #ddd; color: #555;">Comments</th>
              <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${employeeLeave.reasonByReportingManager}</td>
            </tr>
          </table>
          <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
            If you have any questions, please contact your reporting manager or the HR department.
          </p>
          <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Best regards,<br><b>Fin Coopers</b>
          </p>
        </div>
        <div style="border-top: 1px solid #e0e0e0; padding-top: 10px; text-align: center; color: #777; font-size: 12px; margin-top: 20px;">
          <p>This is an automated message. Please do not reply.</p>
        </div>
      </div>`;
  
      const leaveApprove = await mailSwitchModel.findOne({organizationId:new mongoose.Types.ObjectId(organizationId)});
              if (leaveApprove?.masterMailStatus && leaveApprove?.hrmsMail.hrmsMail && leaveApprove?.hrmsMail.leaveApprovelMail) {
      await hrmsSendEmail(toEmails, ccEmails, "Leave Application", msg, "");
              }
              
      const mailData = new mailsToCandidatesModel({
        recipient: toEmails,
        subject: "Leave Application",
        body: msg,
      });
      await mailData.save();
  
      return success(res, "Leave Application Update", employeeLeave);
    } catch (error) {
      console.error(error);
      return unknownError(res, error.message);
    }
  };