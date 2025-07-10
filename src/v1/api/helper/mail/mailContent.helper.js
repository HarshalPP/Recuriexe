import { created, success ,  badRequest, unknownError  } from '../../formatters/globalResponse.js';
import mongoose from "mongoose"
import mailContentModel from '../../models/mailModel/mailContent.model.js'
import { formatMailContent } from '../../formatters/mail.formatter.js';
import { returnFormatter } from '../../formatters/common.formatter.js';
import jobPostModel from "../../models/jobPostModel/jobPost.model.js"
import {extractPlaceholdersFromSchema} from "../../controllers/templeteController/templete.controller.js"
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
        } = requestObject.body;

        const {organizationId} = requestObject.employee
        if(!organizationId){
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
        console.log('error',error)
        return returnFormatter(false,"error", error);
    }
}

export async function mailContentDetail(requestObject) {
    try {
        const { id } = requestObject.query
        if(!id){
            return returnFormatter(false, "ID is required");
        }
        const mailContentDetail = await mailContentModel.create(requestObject.query);
        return returnFormatter(true, "Mail content Detail", mailContentDetail);
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
        ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status', 'budgetType','jobPostApproveRemark'],
        customFields: {
          companyName: 'companyName',
          department: 'department',
          designation: 'designation',
          location: 'location',
          employmentType: 'employmentType',
          employeeType: 'employeeType',
          subDepartment: 'subDepartment',
          branch: 'branch',
          // jobPostVacancyRequest: 'jobPostVacancyRequest',
        }
      });

      // Extract jobDescription fields, nested under jobDescription
      placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
        ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId','jobDescription.JobSummary'],
        // prefix: 'jobDescription', // To produce jobDescription.jobSummary format
        customFields: {
          jobSummary: 'jobSummary',
          rolesAndResponsibilities: 'rolesAndResponsibilities',
          keySkills: 'keySkills'
        }
      });
    } else if (!modelName || modelName === "jobApply") {
      placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
        ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner','password','reasonLeaving','managerRevertReason','sendOfferLetterToCandidate',
          'sendZohoCredentials','candidateStatus','isEligible','Joining_Status'],
          customFields: {
          workLocationId: 'workLocationName',
          branchId: 'branchName',
          departmentId: 'departmentName',
          orgainizationId:'orgainizationName',
        }
      });
    } else if (!modelName || modelName === "jobPostAndApply") {
      placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
        ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status', 'budgetType'],
        customFields: {
          companyName: 'companyName',
          department: 'department',
          designation: 'designation',
          location: 'location',
          employmentType: 'employmentType',
          employeeType: 'employeeType',
          subDepartment: 'subDepartment',
          branch: 'branch',
          // jobPostVacancyRequest: 'jobPostVacancyRequest',
        }
      });

      // Extract jobDescription fields, nested under jobDescription
      placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
        ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId','jobDescription.JobSummary'],
        // prefix: 'jobDescription', // To produce jobDescription.jobSummary format
        customFields: {
          jobSummary: 'jobSummary',
          rolesAndResponsibilities: 'rolesAndResponsibilities',
          keySkills: 'keySkills'
        }
      });

      placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
        ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner'],
        customFields: {
          jobApplyworkLocation: 'jobApplyworkLocation',
          // jobApplyvacancyRequest: 'jobApplyvacancyRequest',
          jobApplyBranch: 'jobApplyBranch',
        }
      });
    } else if(!modelName || modelName === "candidateInterview") {
     placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
        ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner','password','reasonLeaving','managerRevertReason','sendOfferLetterToCandidate',
          'sendZohoCredentials','candidateStatus','isEligible','Joining_Status'],
          customFields: {
          workLocationId: 'workLocationName',
          branchId: 'branchName',
          departmentId: 'departmentName',
          orgainizationId:'orgainizationName',
          interviewerName: 'interviewerName',
          interviewerEmail: 'interviewerEmail',
          interviewerNumber: 'interviewerNumber',
          scheduleLink: 'scheduleLink',
          interviewType: 'interviewType',
          scheduleDate: 'scheduleDate',
          durationMinutes: 'durationMinutes',
          roundNumber: 'intervieRoundNumber',
          interviewStatus: 'interviewStatus',
          interviewFeedback: 'interviewFeedback',
          interviewfeedbackStatus: 'interviewfeedbackStatus',
          roundName: 'intervieRoundName',
        }
      });
    }else{
      return badRequest(res, "Model Type Invalid")
    }
     
    return success(res, "Model keys fetched", placeholders);
  } catch (err) {
    return unknownError(res, "Error fetching model keys", err);
  }
}