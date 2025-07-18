import { created, success, badRequest, unknownError } from '../../formatters/globalResponse.js';
import mongoose from "mongoose"
import { ObjectId } from 'mongodb';
import mailContentModel from '../../models/mailModel/mailContent.model.js'
import { formatMailContent } from '../../formatters/mail.formatter.js';
import { returnFormatter } from '../../formatters/common.formatter.js';
import jobPostModel from "../../models/jobPostModel/jobPost.model.js"
import { extractPlaceholdersFromSchema } from "../../controllers/templeteController/templete.controller.js"
import JobDescriptionModel from "../../models/jobdescriptionModel/jobdescription.model.js"
import jobApplyModel from "../../models/jobformModel/jobform.model.js"
import InterviewModel from '../../models/InterviewDetailsModel/interviewdetails.model.js';

export async function newMailContent(requestObject) {
  try {
    const {
      senderId,
      toMail,
      subject,
      body,
      modelType,
      name,
      file,
    } = requestObject.body;

    const { organizationId } = requestObject.employee
    if (!organizationId) {
      return returnFormatter(false, "OrganizationId Is Required");
    }
    // Required field validation
    // if (!senderId) return returnFormatter(false, "sender is required");
    // if (!toMail) return returnFormatter(false, "toMail is required");
    if (!subject) return returnFormatter(false, "subject is required");
    if (!body) return returnFormatter(false, "body is required");
    if (!name) return returnFormatter(false, "name is required");

    const existing = await mailContentModel.findOne({
      organizationId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") }
    });

    if (existing) {
      return returnFormatter(false, "Name Already Exists");
    }
    requestObject.body.organizationId = organizationId
    // Format data
    const formattedData = formatMailContent(requestObject);

    // Save
    const created = await mailContentModel.create(formattedData);
    return returnFormatter(true, "Mail content added successfully", created);

  } catch (error) {
    console.log('error', error)
    return returnFormatter(false, "error", error);
  }
}


export async function updateMailContentById(requestObject) {
  try {
    const {
      senderId,
      toMail,
      subject,
      body,
      modelType,
      name,
      id,
      file
    } = requestObject.body;

    const { organizationId } = requestObject.employee;
    if (!organizationId) {
      return returnFormatter(false, "OrganizationId is required");
    }

    // Validation
    if (!id) return returnFormatter(false, "Mail content ID is required");
    if (!subject) return returnFormatter(false, "Subject is required");
    if (!body) return returnFormatter(false, "Body is required");
    if (!name) return returnFormatter(false, "Name is required");

    // Check if the mail content exists
    const existingMail = await mailContentModel.findOne({
      _id: id,
      organizationId
    });

    if (!existingMail) {
      return returnFormatter(false, "Mail content not found");
    }

    // Check if another mail with the same name exists (excluding current id)
    const duplicateName = await mailContentModel.findOne({
      _id: { $ne: id },
      organizationId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") }
    });

    if (duplicateName) {
      return returnFormatter(false, "Another mail with this name already exists");
    }

    // Prepare update object
    const updateObject = {
      senderId,
      toMail,
      subject,
      body,
      modelType,
      name: name.trim(),
      organizationId,
      file,
    };

    const updated = await mailContentModel.findByIdAndUpdate(id, updateObject, {
      new: true
    });

    return returnFormatter(true, "Mail content updated successfully", updated);

  } catch (error) {
    console.log('Error in updateMailContentById:', error);
    return returnFormatter(false, "Internal server error", error);
  }
}


export async function mailContentDetail(requestObject) {
  try {
    const { id } = requestObject.query
    const { organizationId } = requestObject.employee

    if (!id) {
      return returnFormatter(false, "Id is required");
    }
    if (!organizationId) {
      return returnFormatter(false, "OrganizationId is required");
    }
    const  mailContentDetail = await mailContentModel.findById(id).lean();
    if (!mailContentDetail) {
      return returnFormatter(false, "Mail Content Not Found");
    }

    return returnFormatter(true, "Mail Content Detail", mailContentDetail);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

export async function mailContentList(requestObject) {
  try {
    const { organizationId } = requestObject.employee
   const  mailContentDetail = await mailContentModel.find({organizationId : new ObjectId(organizationId)}).lean();

    return returnFormatter(true, "Mail Content List", mailContentDetail);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

export async function getEmailPlaceholders(req, res) {
  try {
    const { modelName } = req.query;
    let placeholders = {};
    if (!modelName) {
      return badRequest(res, "Model Name Required");
    }

    if (!modelName || modelName === "jobPost") {
      placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
        ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status', 'budgetType', 'jobPostApproveRemark'],
        customFields: {
          jobPostbranchId: 'jobPostbranchName',
          jobPostorganizationId: 'orgainizationName',
          jobPostsubDepartmentId: 'jobPostsubDepartmentName',
          jobPostdepartmentId: 'jobPostdepartmentName',
          jobPostemployeeTypeId: 'jobPostemployeeTypeName',
          jobPostemploymentTypeId: 'jobPostemploymentTypeName',
        }
      });

      placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
        ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId', 'jobDescription.JobSummary'],
        customFields: {
          JDposition: 'JDposition',
          specialSkiils: 'specialSkiils',
          JDAgeLimit: 'JDAgeLimit',
          JDGender: 'JDGender',
          'jobDescription.JobSummary': 'jobSummary',
          'jobDescription.RolesAndResponsibilities': 'rolesAndResponsibilities',
          'jobDescription.KeySkills': 'keySkills'
        }
      });
    } else if (!modelName || modelName === "jobApply") {
      placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
        ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner', 'password', 'reasonLeaving', 'managerRevertReason', 'sendOfferLetterToCandidate',
          'sendZohoCredentials', 'candidateStatus', 'isEligible', 'Joining_Status'],
        customFields: {
          workLocationId: 'workLocationName',
          branchId: 'branchName',
          departmentId: 'departmentName',
          orgainizationId: 'orgainizationName',
          uploadDoucmentLink: "uploadDoucmentLink",
        }
      });
    } else if (!modelName || modelName === "jobPostAndApply") {
      placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
        ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status', 'budgetType', 'jobPostApproveRemark'],
        customFields: {
          jobPostbranchId: 'jobPostbranchName',
          jobPostsubDepartmentId: 'jobPostsubDepartmentName',
          jobPostdepartmentId: 'jobPostdepartmentName',
          jobPostemployeeTypeId: 'jobPostemployeeTypeName',
          jobPostemploymentTypeId: 'jobPostemploymentTypeName',
        }
      });

      placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
        ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId'],
        customFields: {
          JDposition: 'JDposition',
          specialSkiils: 'specialSkiils',
          JDAgeLimit: 'JDAgeLimit',
          JDGender: 'JDGender',
          'jobDescription.JobSummary': 'jobSummary',
          'jobDescription.RolesAndResponsibilities': 'rolesAndResponsibilities',
          'jobDescription.KeySkills': 'keySkills'
        }
      });

      placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
        ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner', 'password', 'reasonLeaving', 'managerRevertReason', 'sendOfferLetterToCandidate',
          'sendZohoCredentials', 'candidateStatus', 'isEligible', 'Joining_Status'],
        customFields: {
          workLocationId: 'workLocationName',
          branchId: 'branchName',
          departmentId: 'departmentName',
          orgainizationId: 'orgainizationName',
          uploadDoucmentLink: "uploadDoucmentLink",
        }
      });
    } else if (!modelName || modelName === "candidateInterview") {
      placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
        ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner', 'password', 'reasonLeaving', 'managerRevertReason', 'sendOfferLetterToCandidate',
          'sendZohoCredentials', 'candidateStatus', 'isEligible', 'Joining_Status'],
        customFields: {
          workLocationId: 'workLocationName',
          branchId: 'branchName',
          departmentId: 'departmentName',
          orgainizationId: 'orgainizationName',
          interviewerName: 'interviewerName',
          interviewerEmail: 'interviewerEmail',
          interviewerNumber: 'interviewerNumber',
          scheduleLink: 'scheduleLink',
          interviewType: 'interviewType',
          scheduleDate: 'scheduleDate',
          durationMinutes: 'durationMinutes',
          intervieRoundNumber: 'intervieRoundNumber',
          interviewStatus: 'interviewStatus',
          interviewFeedback: 'interviewFeedback',
          interviewfeedbackStatus: 'interviewfeedbackStatus',
          intervieRoundName: 'intervieRoundName',
          scheduleHrName: 'scheduleHrName',
          scheduleHrEmail: 'scheduleHrEmail',
          scheduleHrNumber: 'scheduleHrNumber',
          AiInterviewLink: 'AiInterviewLink',
          uploadDoucmentLink: "uploadDoucmentLink",
        }
      });
    } else {
      return badRequest(res, "Model Type Invalid")
    }

    return success(res, "Model keys fetched", placeholders);
  } catch (err) {
    return unknownError(res, "Error fetching model keys", err);
  }
}