import Template from "../../models/templeteModel/templete.model.js"

import jobPostModel from "../../models/jobPostModel/jobPost.model.js"
import JobDescriptionModel from "../../models/jobdescriptionModel/jobdescription.model.js"
import jobApplyModel from "../../models/jobformModel/jobform.model.js"

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import uploadToSpaces from "../../services/spaceservices/space.service.js"
import mongoose from 'mongoose';
import { ObjectId } from "mongodb";

import Organization from '../../models/organizationModel/organization.model.js';
import Department from '../../models/deparmentModel/deparment.model.js';
import Designation from '../../models/designationModel/designation.model.js';
import WorkLocation from '../../models/worklocationModel/worklocation.model.js';
import Qualification from '../../models/QualificationModel/qualification.model.js'
import { badRequest, notFound, serverValidation, success, unknownError } from "../../formatters/globalResponse.js"



// Helper function to get data for placeholders
async function getPlaceholderData(job, jobDescription) {
  const placeholders = {};


  const jobFields = {
    position: job.position || 'N/A',
    jobPostId: job.jobPostId || 'N/A',
    experience: job.experience || 'N/A',
    noOfPosition: job.noOfPosition?.toString() || 'N/A',
    budget: job.budget ? `${job.budget} ${job.budgetType || ''}` : 'N/A',
    budgetType: job.budgetType || 'N/A',
    package: job.package || 'N/A',
    AI_Screening: job.AI_Screening || 'false',
    AI_Percentage: job.AI_Percentage?.toString() || '0',
    MaxAI_Score: job.MaxAI_Score?.toString() || '0',
    MinAI_Score: job.MinAI_Score?.toString() || '0',
    Qualification: job.Qualification || 'N/A',
    Holdingbuged: job.Holdingbuged?.toString() || '0',
    AgeLimit: job.AgeLimit || 'No Limit',
    gender: job.gender || 'Both',
    InterviewType: job.InterviewType || 'N/A',
    status: job.status || 'active',
    jobPostExpired: job.jobPostExpired?.toString() || 'false',
    numberOfApplicant: job.numberOfApplicant?.toString() || '0',
    totalApplicants: job.totalApplicants?.toString() || '0'
  };

  for (const [field, value] of Object.entries(jobFields)) {
    placeholders[`{{${field}}}`] = value;
  }

  // Referenced fields
  placeholders['{{companyName}}'] = job.organizationId
    ? (await mongoose.model('Organization').findById(job.organizationId))?.name || 'N/A'
    : 'N/A';
  placeholders['{{department}}'] = job.departmentId
    ? (await mongoose.model('newdepartment').findById(job.departmentId))?.name || 'N/A'
    : 'N/A';
  placeholders['{{designation}}'] = job.designationId
    ? (await mongoose.model('newdesignation').findById(job.designationId))?.name || 'N/A'
    : 'N/A';
  placeholders['{{location}}'] = job.Worklocation
    ? (await mongoose.model('newworklocation').findById(job.Worklocation))?.name || 'N/A'
    : 'N/A';


  //   placeholders['{{companyName}}'] = job.organizationId
  //   ? (await Organization.findById(job.organizationId))?.name || 'N/A'
  //   : 'N/A';

  // placeholders['{{department}}'] = job.departmentId
  //   ? (await Department.findById(job.departmentId))?.name || 'N/A'
  //   : 'N/A';

  // placeholders['{{designation}}'] = job.designationId
  //   ? (await Designation.findById(job.designationId))?.name || 'N/A'
  //   : 'N/A';

  // placeholders['{{location}}'] = job.Worklocation
  //   ? (await WorkLocation.findById(job.Worklocation))?.name || 'N/A'
  //   : 'N/A';

  // JobDescription fields
  const jobDescriptionFields = {
    specialSkiils: jobDescription.specialSkiils || 'N/A',
    AgeLimit: jobDescription.AgeLimit || 'N/A',
    Gender: jobDescription.Gender || 'N/A',
    jobSummary: jobDescription.jobDescription?.JobSummary || 'N/A',
    rolesAndResponsibilities: jobDescription.jobDescription?.RolesAndResponsibilities?.join(', ') || 'N/A',
    keySkills: jobDescription.jobDescription?.KeySkills?.join(', ') || 'N/A',
    status: jobDescription.status || 'active'
  };

  for (const [field, value] of Object.entries(jobDescriptionFields)) {
    placeholders[`{{${field}}}`] = value;
  }

  return placeholders;
}

// async function getPlaceholderDataTest(job, jobDescription = null) {
//   const placeholders = {};
//   const isJobApply = !!job.candidateUniqueId;
//   console.log('7')
//   if (isJobApply) {
// console.log('7.5')
//     const jobApplyFields = {
//       name: job.name || 'N/A',
//       emailId: job.emailId || 'N/A',
//       mobileNumber: job.mobileNumber || 'N/A',
//       highestQualification: job.highestQualification || 'N/A',
//       candidateUniqueId: job.candidateUniqueId || 'N/A',
//       position: job.position || 'N/A',
//       skills: job.skills || 'N/A',
//       currentDesignation: job.currentDesignation || 'N/A',
//       totalExperience: job.totalExperience?.toString() || 'N/A',
//       currentLocation: job.currentLocation || 'N/A',
//       preferredLocation: job.preferredLocation || 'N/A',
//       expectedCTC: job.expectedCTC || 'N/A',
//       currentCTC: job.currentCTC || 'N/A',
//       university: job.university || 'N/A',
//       graduationYear: job.graduationYear || 'N/A',
//       cgpa: job.cgpa || 'N/A',
//       address: job.address || 'N/A',
//       state: job.state || 'N/A',
//       city: job.city || 'N/A',
//       pincode: job.pincode || 'N/A',
//       internalReferenceName: job.internalReferenceName || 'N/A',
//       preferedInterviewMode: job.preferedInterviewMode || 'N/A',
//       knewaboutJobPostFrom: job.knewaboutJobPostFrom || 'N/A',
//       lastOrganization: job.lastOrganization?.join(', ') || 'N/A',
//       startDate: job.startDate ? new Date(job.startDate).toLocaleDateString() : 'N/A',
//       endDate: job.endDate ? new Date(job.endDate).toLocaleDateString() : 'N/A',
//       reasonLeaving: job.reasonLeaving || 'N/A',
//       gapIfAny: job.gapIfAny || 'N/A',
//       summary: job.summary || 'N/A',
//       remark: job.Remark || 'N/A',
//       immediatejoiner: job.immediatejoiner ? 'Yes' : 'No',
//       agreePrivacyPolicy: job.agreePrivacyPolicy ? 'Yes' : 'No',
//       jobType: job.JobType || 'N/A',
//       salary: job.salary?.toString() || 'N/A',
//       joiningDate: job.joiningDate ? new Date(job.joiningDate).toLocaleDateString() : 'N/A',
//       candidateStatus: job.candidateStatus || 'N/A',
//       matchPercentage: job.matchPercentage?.toString() || 'N/A',
//       aiResult: job.AI_Result || 'N/A',
//       aiScreeningResult: job.AI_Screeing_Result || 'N/A',
//       aiScreeningStatus: job.AI_Screeing_Status || 'N/A',
//       aiScore: job.AI_Score?.toString() || 'N/A',
//       aiConfidence: job.AI_Confidence?.toString() || 'N/A',
//       sendOfferLetterToCandidate: job.sendOfferLetterToCandidate || 'N/A',
//       sendZohoCredentials: job.sendZohoCredentials || 'N/A'
//     };

//     console.log('8')
//     for (const [field, value] of Object.entries(jobApplyFields)) {
//       placeholders[`{{${field}}}`] = value;
//     }

//     // Populate department and location if referenced
//     placeholders['{{department}}'] = job.departmentId
//       ? (await Department.findById(job.departmentId))?.name || 'N/A'
//       : 'N/A';

//     placeholders['{{location}}'] = job.workLocationId
//       ? (await WorkLocation.findById(job.workLocationId))?.name || 'N/A'
//       : 'N/A';

//       // console.log('job.jobPostId',job.jobPostId)
//     // Also check jobPostId for org name etc.
//     if (job.jobPostId) {
//       const jobPost = await jobPostModel.findById(job.jobPostId)
//         .populate('designationId')
//         .populate('departmentId')
//         .populate('Worklocation');

//       placeholders['{{companyName}}'] = jobPost?.organizationId
//         ? (await Organization.findById(jobPost.organizationId))?.name || 'N/A'
//         : 'N/A';

//       if (Array.isArray(jobPost?.qualificationId) && jobPost.qualificationId.length > 0) {
//         const qualifications = await Qualification.find({
//           _id: { $in: jobPost.qualificationId }
//         }).select("name");

//         placeholders['{{Qualification}}'] = qualifications.length
//           ? qualifications.map(q => q.name).join(", ")
//           : 'N/A';
//       } else {
//         placeholders['{{Qualification}}'] = 'N/A';
//       }

//       placeholders['{{designation}}'] = jobPost?.designationId?.name || 'N/A';
//     }

//   } else {
//     // Handle jobPostModel
//     console.log('8')
//     const jobFields = {
//       position: job.position || 'N/A',
//       jobPostId: job.jobPostId || 'N/A',
//       experience: job.experience || 'N/A',
//       noOfPosition: job.noOfPosition?.toString() || 'N/A',
//       budget: job.budget ? `${job.budget} ${job.budgetType || ''}` : 'N/A',
//       budgetType: job.budgetType || 'N/A',
//       package: job.package || 'N/A',
//       AI_Screening: job.AI_Screening || 'false',
//       AI_Percentage: job.AI_Percentage?.toString() || '0',
//       MaxAI_Score: job.MaxAI_Score?.toString() || '0',
//       MinAI_Score: job.MinAI_Score?.toString() || '0',
//       // Qualification: job.Qualification || 'N/A',
//       Holdingbuged: job.Holdingbuged?.toString() || '0',
//       AgeLimit: job.AgeLimit || 'No Limit',
//       gender: job.gender || 'Both',
//       InterviewType: job.InterviewType || 'N/A',
//       status: job.status || 'active',
//       jobPostExpired: job.jobPostExpired?.toString() || 'false',
//       numberOfApplicant: job.numberOfApplicant?.toString() || '0',
//       totalApplicants: job.totalApplicants?.toString() || '0'
//     };

//     for (const [field, value] of Object.entries(jobFields)) {
//       placeholders[`{{${field}}}`] = value;
//     }
// console.log('8.6')
//       if (Array.isArray(job?.qualificationId) && job.qualificationId.length > 0) {
//         const qualifications = await Qualification.find({
//           _id: { $in: job.qualificationId }
//         }).select("name");

//         placeholders['{{Qualification}}'] = qualifications.length
//           ? qualifications.map(q => q.name).join(", ")
//           : 'N/A';
//       } else {
//         placeholders['{{Qualification}}'] = 'N/A';
//       }


//     placeholders['{{companyName}}'] = job.organizationId
//       ? (await Organization.findById(job.organizationId))?.name || 'N/A'
//       : 'N/A';

//     placeholders['{{department}}'] = job.departmentId
//       ? (await Department.findById(job.departmentId))?.name || 'N/A'
//       : 'N/A';

//     placeholders['{{designation}}'] = job.designationId
//       ? (await Designation.findById(job.designationId))?.name || 'N/A'
//       : 'N/A';

//     placeholders['{{location}}'] = job.Worklocation
//       ? (await WorkLocation.findById(job.Worklocation))?.name || 'N/A'
//       : 'N/A';
//   }
// console.log('10')
//   // Handle Job Description fields only if available
//   if (jobDescription) {
//     const jobDescriptionFields = {
//       specialSkiils: jobDescription.specialSkiils || 'N/A',
//       AgeLimit: jobDescription.AgeLimit || 'N/A',
//       Gender: jobDescription.Gender || 'N/A',
//       jobSummary: jobDescription.jobDescription?.JobSummary || 'N/A',
//       rolesAndResponsibilities: jobDescription.jobDescription?.RolesAndResponsibilities?.join(', ') || 'N/A',
//       keySkills: jobDescription.jobDescription?.KeySkills?.join(', ') || 'N/A',
//       status: jobDescription.status || 'active'
//     };
// console.log('11')
//     for (const [field, value] of Object.entries(jobDescriptionFields)) {
//       placeholders[`{{${field}}}`] = value;
//     }
//   }

//   return placeholders;
// }

async function getPlaceholderDataTest(job, jobDescription = null) {
  console.log('job-/-/-', job.jobPostIdRef)
  const placeholders = {};
  const isJobApply = !!job.candidateUniqueId;

  // ----------- JOB APPLY SECTION --------------
  if (isJobApply) {
    const jobApplyFields = {
      name: job.name || 'N/A',
      emailId: job.emailId || 'N/A',
      mobileNumber: job.mobileNumber || 'N/A',
      highestQualification: job.highestQualification || 'N/A',
      candidateUniqueId: job.candidateUniqueId || 'N/A',
      position: job.position || 'N/A',
      skills: job.skills || 'N/A',
      currentDesignation: job.currentDesignation || 'N/A',
      totalExperience: job.totalExperience?.toString() || 'N/A',
      currentLocation: job.currentLocation || 'N/A',
      preferredLocation: job.preferredLocation || 'N/A',
      expectedCTC: job.expectedCTC || 'N/A',
      currentCTC: job.currentCTC || 'N/A',
      university: job.university || 'N/A',
      graduationYear: job.graduationYear || 'N/A',
      cgpa: job.cgpa || 'N/A',
      address: job.address || 'N/A',
      state: job.state || 'N/A',
      city: job.city || 'N/A',
      pincode: job.pincode || 'N/A',
      internalReferenceName: job.internalReferenceName || 'N/A',
      preferedInterviewMode: job.preferedInterviewMode || 'N/A',
      knewaboutJobPostFrom: job.knewaboutJobPostFrom || 'N/A',
      lastOrganization: job.lastOrganization?.join(', ') || 'N/A',
      startDate: job.startDate ? new Date(job.startDate).toLocaleDateString() : 'N/A',
      endDate: job.endDate ? new Date(job.endDate).toLocaleDateString() : 'N/A',
      reasonLeaving: job.reasonLeaving || 'N/A',
      gapIfAny: job.gapIfAny || 'N/A',
      summary: job.summary || 'N/A',
      remark: job.Remark || 'N/A',
      immediatejoiner: job.immediatejoiner ? 'Yes' : 'No',
      agreePrivacyPolicy: job.agreePrivacyPolicy ? 'Yes' : 'No',
      jobType: job.JobType || 'N/A',
      salary: job.salary?.toString() || 'N/A',
      joiningDate: job.joiningDate ? new Date(job.joiningDate).toLocaleDateString() : 'N/A',
      candidateStatus: job.candidateStatus || 'N/A',
      matchPercentage: job.matchPercentage?.toString() || 'N/A',
      aiResult: job.AI_Result || 'N/A',
      aiScreeningResult: job.AI_Screeing_Result || 'N/A',
      aiScreeningStatus: job.AI_Screeing_Status || 'N/A',
      aiScore: job.AI_Score?.toString() || 'N/A',
      aiConfidence: job.AI_Confidence?.toString() || 'N/A',
      sendOfferLetterToCandidate: job.sendOfferLetterToCandidate || 'N/A',
      sendZohoCredentials: job.sendZohoCredentials || 'N/A'
    };

    for (const [field, value] of Object.entries(jobApplyFields)) {
      placeholders[`{{${field}}}`] = value;
    }

    // department & location from jobApply
    placeholders['{{department}}'] = job.departmentId
      ? (await Department.findById(job.departmentId))?.name || 'N/A'
      : 'N/A';

    placeholders['{{location}}'] = job.workLocationId
      ? (await WorkLocation.findById(job.workLocationId))?.name || 'N/A'
      : 'N/A';

    // ----------- JOB POST (FROM job.jobPostId) --------------
    // let jobPost = null;
    // console.log('job.jobPostId--',job.jobPostIdRef)
    // if (job.jobPostIdRef) {
    //   jobPost = await jobPostModel.findById(job.jobPostIdRef)
    //     .populate('qualificationId')
    //     .populate('designationId')
    //     .populate('departmentId')
    //     .populate('employmentTypeId')
    //     .populate('employeeTypeId')
    //     .populate('Worklocation');

    //   placeholders['{{companyName}}'] = jobPost?.organizationId
    //     ? (await Organization.findById(jobPost.organizationId))?.name || 'N/A'
    //     : 'N/A';

    //   placeholders['{{Qualification}}'] = Array.isArray(jobPost.qualificationId)
    //     ? jobPost.qualificationId.map(q => q?.name || '').filter(Boolean).join(', ')
    //     : jobPost.qualificationId?.name || 'N/A';

    //   placeholders['{{employmentType}}'] = jobPost.employmentTypeId?.name || 'N/A';
    //   placeholders['{{employeeType}}'] = jobPost.employeeTypeId?.name || 'N/A';
    //   placeholders['{{departmentFromPost}}'] = jobPost.departmentId?.name || 'N/A';
    //   placeholders['{{designation}}'] = jobPost.designationId?.name || 'N/A';
    //   placeholders['{{locationFromPost}}'] = jobPost.Worklocation?.name || 'N/A';
    // }

    const jobPost = job.jobPostData;
    if (jobPost) {
      placeholders['{{companyName}}'] = jobPost?.organizationId
        ? (await Organization.findById(jobPost.organizationId))?.name || 'N/A'
        : 'N/A';

      placeholders['{{Qualification}}'] = Array.isArray(jobPost.qualificationId)
        ? jobPost.qualificationId.map(q => q?.name || '').filter(Boolean).join(', ')
        : jobPost.qualificationId?.name || 'N/A';

      placeholders['{{employmentType}}'] = jobPost.employmentTypeId?.name || 'N/A';
      placeholders['{{employeeType}}'] = jobPost.employeeTypeId?.name || 'N/A';
      placeholders['{{department}}'] = jobPost.departmentId?.name || 'N/A';
      placeholders['{{designation}}'] = jobPost.designationId?.name || 'N/A';
      placeholders['{{location}}'] = jobPost.Worklocation?.name || 'N/A';
      placeholders['{{jobPostId}}'] = jobPost.jobPostId || 'N/A';
      placeholders['{{position}}'] = jobPost.position || 'N/A';
      placeholders['{{JobType}}'] = jobPost.JobType || 'N/A';
      placeholders['{{InterviewType}}'] = jobPost.InterviewType || 'N/A';
      placeholders['{{AgeLimit}}'] = jobPost.AgeLimit || 'No Limit';
      placeholders['{{gender}}'] = jobPost.gender || 'Both';
      placeholders['{{budget}}'] = jobPost.budget || 'N/A';
      placeholders['{{budgetType}}'] = jobPost.budgetType || 'N/A';
      placeholders['{{experience}}'] = jobPost.experience || 'N/A';
    }

  } else {
    // ----------- PURE JOB POST SECTION --------------
    const jobFields = {
      position: job.position || 'N/A',
      jobPostId: job.jobPostId || 'N/A',
      experience: job.experience || 'N/A',
      noOfPosition: job.noOfPosition?.toString() || 'N/A',
      budget: job.budget ? `${job.budget} ${job.budgetType || ''}` : 'N/A',
      budgetType: job.budgetType || 'N/A',
      package: job.package || 'N/A',
      AI_Screening: job.AI_Screening || 'false',
      AI_Percentage: job.AI_Percentage?.toString() || '0',
      MaxAI_Score: job.MaxAI_Score?.toString() || '0',
      MinAI_Score: job.MinAI_Score?.toString() || '0',
      Holdingbuged: job.Holdingbuged?.toString() || '0',
      AgeLimit: job.AgeLimit || 'No Limit',
      gender: job.gender || 'Both',
      InterviewType: job.InterviewType || 'N/A',
      status: job.status || 'active',
      jobPostExpired: job.jobPostExpired?.toString() || 'false',
      numberOfApplicant: job.numberOfApplicant?.toString() || '0',
      totalApplicants: job.totalApplicants?.toString() || '0'
    };

    for (const [field, value] of Object.entries(jobFields)) {
      placeholders[`{{${field}}}`] = value;
    }

    placeholders['{{Qualification}}'] = Array.isArray(job?.qualificationId)
      ? (await Qualification.find({ _id: { $in: job.qualificationId } }))
        .map(q => q?.name || '').filter(Boolean).join(', ')
      : 'N/A';

    placeholders['{{companyName}}'] = job.organizationId
      ? (await Organization.findById(job.organizationId))?.name || 'N/A'
      : 'N/A';

    placeholders['{{department}}'] = job.departmentId
      ? (await Department.findById(job.departmentId))?.name || 'N/A'
      : 'N/A';

    placeholders['{{designation}}'] = job.designationId
      ? (await Designation.findById(job.designationId))?.name || 'N/A'
      : 'N/A';

    placeholders['{{location}}'] = job.Worklocation
      ? (await WorkLocation.findById(job.Worklocation))?.name || 'N/A'
      : 'N/A';
  }

  // ----------- JOB DESCRIPTION SECTION --------------
  if (jobDescription) {
    const jobDescriptionFields = {
      specialSkiils: jobDescription.specialSkiils || 'N/A',
      AgeLimit: jobDescription.AgeLimit || 'N/A',
      Gender: jobDescription.Gender || 'N/A',
      jobSummary: jobDescription.jobDescription?.JobSummary || 'N/A',
      rolesAndResponsibilities: jobDescription.jobDescription?.RolesAndResponsibilities?.join(', ') || 'N/A',
      keySkills: jobDescription.jobDescription?.KeySkills?.join(', ') || 'N/A',
      status: jobDescription.status || 'active'
    };

    for (const [field, value] of Object.entries(jobDescriptionFields)) {
      placeholders[`{{${field}}}`] = value;
    }
  }

  return placeholders;
}


function getSchemaPlaceholders() {
  const placeholders = {
    jobPost: {},
    jobDescription: {}
  };

  const jobPostPaths = jobPostModel.schema.paths;
  for (const [field, path] of Object.entries(jobPostPaths)) {

    if (
      ['String', 'Number', 'Boolean'].includes(path.instance) &&
      !['_id', '__v', 'createdByHrId'].includes(field)
    ) {
      placeholders.jobPost[field] = `{{${field}}}`;
    }
  }


  placeholders.jobPost.companyName = '{{companyName}}';
  placeholders.jobPost.department = '{{department}}';
  placeholders.jobPost.designation = '{{designation}}';
  placeholders.jobPost.location = '{{location}}';


  const jobDescriptionPaths = JobDescriptionModel.schema.paths;
  for (const [field, path] of Object.entries(jobDescriptionPaths)) {
    if (
      ['String', 'Number', 'Boolean'].includes(path.instance) &&
      !['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId'].includes(field)
    ) {
      placeholders.jobDescription[field] = `{{${field}}}`;
    }
  }

  // Handle nested jobDescription fields
  placeholders.jobDescription.jobSummary = '{{jobSummary}}';
  placeholders.jobDescription.rolesAndResponsibilities = '{{rolesAndResponsibilities}}';
  placeholders.jobDescription.keySkills = '{{keySkills}}';

  return placeholders;
}


// Helper function to validate placeholders
function validateTemplateContent(content, placeholders) {
  console.log("placeHoler----", placeholders)
  const validPlaceholders = [
    ...Object.values(placeholders.jobPost),
    ...Object.values(placeholders.jobDescription)
  ];
  const foundPlaceholders = content.match(/{{[a-zA-Z]+}}/g) || [];
  const invalidPlaceholders = foundPlaceholders.filter(placeholder => !validPlaceholders.includes(placeholder));
  return invalidPlaceholders.length === 0 ? null : invalidPlaceholders;
}


function validateTemplateContentTest(content, placeholders) {
  if (!placeholders || typeof placeholders !== 'object') return ['Placeholders object is missing'];

  console.log('3')
  const validPlaceholders = Object.values(placeholders || {})
    .flatMap(group => Object.values(group || {}));
  console.log('4')
  const foundPlaceholders = content.match(/{{[a-zA-Z0-9._]+}}/g) || [];
  const invalidPlaceholders = foundPlaceholders.filter(ph => !validPlaceholders.includes(ph));
  console.log('4.5')
  return invalidPlaceholders.length === 0 ? null : invalidPlaceholders;
}



export async function createTemplate(req, res) {
  try {
    const { title, content } = req.body;
    const orgainizationId = req.employee.organizationId;
    if (!title || !content) {
      return badRequest(res, "Please provide the title and content")
    }

    const titleSearch = title.trim();
    const existingTemplate = await Template.findOne({
      title: { $eq: titleSearch },
      organizationId: new ObjectId(orgainizationId)
    }).collation({ locale: 'en', strength: 2 });

    if (existingTemplate) {
      return badRequest(res, "Templalte Name Already Exists");
    }

    const placeholders = getSchemaPlaceholders();
    const invalidPlaceholders = validateTemplateContent(content, placeholders);
    if (invalidPlaceholders) {
      return badRequest(res, `Invalid placeholders found: ${invalidPlaceholders.join(', ')}`);
    }



    const template = new Template({
      title,
      content: content,
      createdBy: req.employee.id,
      organizationId: req.employee.organizationId
    });

    await template.save();
    return success(res, "Templete Create Successfully", template)
  } catch (error) {
    return unknownError(res, error)
  }
}



// ✅ List all templates for a user
export async function listTemplates(req, res) {
  const orgainizationId = req.employee.organizationId;
  try {
    const templates = await Template.find({ organizationId: new ObjectId(orgainizationId) }).sort({ createdAt: -1 });
    return success(res, "Templates retrieved successfully", templates);
  } catch (error) {
    console.error("Template list error:", error);
    return unknownError(res, error);
  }
}



// ✅ Retrieve a template by ID
export async function getTemplate(req, res) {
  try {
    const { templateId } = req.params;
    const template = await Template.findById(templateId);

    if (!template) {
      return badRequest(res, "Template not found");
    }

    return success(res, "Template retrieved successfully", template);
  } catch (error) {
    console.error("Template retrieval error:", error);
    return unknownError(res, error);
  }
}



export async function updateTemplate(req, res) {
  try {
    // const { templateId } = req.params;
    const { title, content , type , templateId} = req.body;

    if (!title && !content) {
      return badRequest(res, "Please provide the title and/or content to update");
    }

    if(!templateId){
      return badRequest(res, "Template Id Required");
    }
    const template = await Template.findById(templateId);
    if (!template) {
      return notFound(res, "Template Not Found");
    }

       if (title) {
       const existingTemplate = await Template.findOne({
        _id: { $ne: templateId },
        title: { $eq: title.trim() },
      }).collation({ locale: 'en', strength: 2 });

      if (existingTemplate) {
        return badRequest(res, "Template title already exists");
      }

      template.title = title;
    }
    // if (template.createdBy.toString() !== req.employee._id) {
    //   return badRequest(res, "Unauthorized to update this template");
    // }

    // if (content) {
    //   const placeholders = getSchemaPlaceholders();
    //   const invalidPlaceholders = validateTemplateContent(content, placeholders);
    //   if (invalidPlaceholders.length > 0) {
    //     return badRequest(res, `Invalid placeholders found: ${invalidPlaceholders.join(', ')}`);
    //   }
    // }
if (content) {
  let placeholders = {};

  // 🧠 Use template.modelType to generate placeholders
  if (template.modelType === "jobPost") {
    placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
      ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status'],
      customFields: {
        companyName: 'companyName',
        department: 'department',
        designation: 'designation',
        location: 'location'
      }
    });

    placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
      ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId'],
      customFields: {
        jobSummary: 'jobSummary',
        rolesAndResponsibilities: 'rolesAndResponsibilities',
        keySkills: 'keySkills'
      }
    });

  } else if (template.modelType === "jobApply") {
    placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
      ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner']
    });

  } else if (template.modelType === "jobPostAndApply") {
    placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
      ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status'],
      customFields: {
        companyName: 'companyName',
        department: 'department',
        designation: 'designation',
        location: 'location'
      }
    });

    placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
      ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId'],
      customFields: {
        jobSummary: 'jobSummary',
        rolesAndResponsibilities: 'rolesAndResponsibilities',
        keySkills: 'keySkills'
      }
    });

    placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
      ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner']
    });
  }

  const invalidPlaceholders = validateTemplateContentTest(content, placeholders);

  // ✅ Fix: Safely check length
  if (invalidPlaceholders && invalidPlaceholders.length > 0) {
    return badRequest(res, `Invalid placeholders found: ${invalidPlaceholders.join(', ')}`);
  }

  template.content = content;
}

 
    if(type){
      template.modelType = type
    }
    template.updatedAt = Date.now();
    await template.save();

    return success(res, "Template updated successfully", template);
  } catch (error) {
    console.error("Template update error:", error);
    return unknownError(res, error);
  }
}




function extractPlaceholdersFromSchema(model, options = {}) {
  const {
    ignoreFields = [],
    prefix = '', // Optional prefix for nested naming
    customFields = {}
  } = options;

  const placeholders = {};
  const schemaPaths = model.schema.paths;

  for (const [field, path] of Object.entries(schemaPaths)) {
    if (
      ['String', 'Number', 'Boolean'].includes(path.instance) &&
      !ignoreFields.includes(field)
    ) {
      const key = prefix ? `${prefix}.${field}` : field;
      placeholders[field] = `{{${key}}}`;
    }
  }

  return {
    ...placeholders,
    ...Object.entries(customFields).reduce((acc, [field, key]) => {
      acc[field] = `{{${prefix ? `${prefix}.${key}` : key}}}`;
      return acc;
    }, {})
  };
}

export async function getAvailablePlaceholders(req, res) {
  try {
    const { type } = req.query;
    let placeholders = {};

    if (!type) {
      return badRequest(res, "Model Type Required")
    }

    if (!type || type === "jobPost") {
      placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
        ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status', 'budgetType'],
        customFields: {
          companyName: 'companyName',
          department: 'department',
          designation: 'designation',
          location: 'location'
        }
      });

      // Extract jobDescription fields, nested under jobDescription
      placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
        ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId'],
        // prefix: 'jobDescription', // To produce jobDescription.jobSummary format
        customFields: {
          jobSummary: 'jobSummary',
          rolesAndResponsibilities: 'rolesAndResponsibilities',
          keySkills: 'keySkills'
        }
      });
    } else if (!type || type === "jobApply") {
      placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
        ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner']
      });
    } else if (!type || type === "jobPostAndApply") {
      placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
        ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status', 'budgetType'],
        customFields: {
          companyName: 'companyName',
          department: 'department',
          designation: 'designation',
          location: 'location'
        }
      });

      // Extract jobDescription fields, nested under jobDescription
      placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
        ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId'],
        // prefix: 'jobDescription', // To produce jobDescription.jobSummary format
        customFields: {
          jobSummary: 'jobSummary',
          rolesAndResponsibilities: 'rolesAndResponsibilities',
          keySkills: 'keySkills'
        }
      });

      placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
        ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner']
      });
    } else {
      return badRequest(res, "Model Type Invalid")
    }

    return success(res, 'Available placeholders retrieved successfully', placeholders);
  } catch (error) {
    console.error('Placeholder retrieval error:', error);
    return unknownError(res, error);
  }
}

export async function generateLinkedInPostAndPdf(req, res) {
  try {
    const { templateId, jobId, generatePdf = false } = req.body;

    if (!templateId) {
      return badRequest(res, "Please select the templete")
    }

    if (!jobId) {
      return badRequest(res, "Please provide the JobId")
    }

    const template = await Template.findById(templateId);
    if (!template) return badRequest(res, "Template not found");

    const job = await jobPostModel.findById(jobId)
      .populate('jobDescriptionId')
      .populate('designationId')
      .populate('departmentId')
      .populate('Worklocation');

    if (!job) return badRequest(res, "Job not found");

    const jobDescription = await JobDescriptionModel.findOne(job.jobDescriptionId);
    if (!jobDescription) return badRequest(res, 'Job description not found');

    const placeholders = await getPlaceholderData(job, jobDescription);
    // console.log("placeholders" , placeholders)

    let postContent = template.content;
    for (const [placeholder, value] of Object.entries(placeholders)) {
      const processedValue = typeof value == 'string'
        ? value.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
        : value;
      postContent = postContent.replace(
        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        processedValue
      );
    }

    const responseData = {
      userId: req.employee.id,
      //   htmlContent: postContent,
      timestamp: new Date()
    };

    if (generatePdf) {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(postContent, { waitUntil: 'networkidle0' });

      // Generate PDF in memory (no file saved)
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
      });

      await browser.close();

      const fileName = `${Date.now()}_job_post.pdf`;
      const filePathInBucket = `${process.env.PATH_BUCKET}/HRMS/PDF/${fileName}`;
      console.log("filePathInBucket", filePathInBucket)

      const pdfUrl = await uploadToSpaces(
        'finexe',
        filePathInBucket,
        pdfBuffer,
        'public-read',
        'application/pdf'
      );

      responseData.pdfUrl = pdfUrl;
    }

    return success(res, "Generated successfully", responseData);

  } catch (error) {
    console.error('LinkedIn post and PDF generation error:', error);
    return unknownError(res, error);
  }
}


async function getPlaceholderDataDynamic({ jobId, type }) {
  if (!type || type === 'jobPost') {
    const job = await jobPostModel.findById(jobId)
      .populate('jobDescriptionId')
      .populate('designationId')
      .populate('departmentId')
      .populate('Worklocation');
    if (!job) throw new Error("Job not found");
    const jobDescription = await JobDescriptionModel.findById(job.jobDescriptionId);
    if (!jobDescription) throw new Error("Job Description not found");
    return await getPlaceholderDataTest(job, jobDescription);
  }

  if (type === 'jobApply') {
    const jobApply = await jobApplyModel.findById(jobId)
      .populate('jobPostId')
      .populate('departmentId')
      .populate('workLocationId')
    // .select('jobPostId');
    if (!jobApply) throw new Error("Job Application not found");
    return await getPlaceholderDataTest(jobApply, null);
  }

  if (type === 'jobPostAndApply') {
    const jobApply = await jobApplyModel.findById(jobId)
      .populate('jobPostId')
      .populate('departmentId')
      .populate('workLocationId');
    if (!jobApply) throw new Error("Job Application not found");
    const job = await jobPostModel.findById(jobApply.jobPostId._id)
      .populate('jobDescriptionId')
      .populate('designationId')
      .populate('departmentId')
      .populate('Worklocation')
      .populate('employmentTypeId')
      .populate('employeeTypeId')
      .populate('qualificationId')
    if (!job) throw new Error("Job Post not found for application");

    const jobDescription = await JobDescriptionModel.findById(job.jobDescriptionId);
    if (!jobDescription) throw new Error("Job Description not found");
    console.log('5')
    return await getPlaceholderDataTest({
      ...jobApply.toObject(), jobPostIdRef: job._id,
      jobPostData: job.toObject(),
    }, jobDescription);
  }
}

// Step 3: Modify generateLinkedInPostAndPdf
export async function generateLinkedInPostAndPdfDynamic(req, res) {
  try {
    const { templateId, jobId, generatePdf = false } = req.body;

    if (!templateId) return badRequest(res, "Please select the template");
    if (!jobId) return badRequest(res, "Please provide the JobId");

    const template = await Template.findById(templateId);
    if (!template) return badRequest(res, "Template not found");
    const type = template.modelType

    const placeholders = await getPlaceholderDataDynamic({ jobId, type });

    let postContent = template.content;
    for (const [placeholder, value] of Object.entries(placeholders)) {
      const processedValue = typeof value == 'string'
        ? value.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
        : value;
      postContent = postContent.replace(
        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        processedValue
      );
    }

    const responseData = {
      userId: req.employee.id,
      timestamp: new Date()
    };

    if (generatePdf) {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(postContent, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4', printBackground: true,
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
      });
      await browser.close();

      const fileName = `${Date.now()}_job_post.pdf`;
      const filePathInBucket = `${process.env.PATH_BUCKET}/HRMS/PDF/${fileName}`;

      const pdfUrl = await uploadToSpaces(
        'finexe',
        filePathInBucket,
        pdfBuffer,
        'public-read',
        'application/pdf'
      );
      responseData.pdfUrl = pdfUrl;
    }

    return success(res, "Generated successfully", responseData);
  } catch (error) {
    console.error('LinkedIn post and PDF generation error:', error);
    return unknownError(res, error);
  }
}


// cretae pdf template 

export async function createTemplateTest(req, res) {
  try {
    const { title, content, type } = req.body;
    const organizationId = req.employee.organizationId;

    if (!title || !content || !type) {
      return badRequest(res, "Please provide title, content, and type");
    }

    // Check for duplicate title (case-insensitive)
    const titleSearch = title.trim();
    const existingTemplate = await Template.findOne({
      title: { $eq: titleSearch },
      organizationId: new ObjectId(organizationId)
    }).collation({ locale: 'en', strength: 2 });

    if (existingTemplate) {
      return badRequest(res, "Template Name Already Exists");
    }

    // Dynamically build placeholders based on type
    const placeholders = {};
    if (type === "jobPost") {
      placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
        ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status'],
        customFields: {
          companyName: 'companyName',
          department: 'department',
          designation: 'designation',
          location: 'location'
        }
      });

      placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
        ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId'],
        customFields: {
          jobSummary: 'jobSummary',
          rolesAndResponsibilities: 'rolesAndResponsibilities',
          keySkills: 'keySkills'
        }
      });

    } else if (type === "jobApply") {
      console.log('1')
      placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
        ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner']
      });

    } else if (type === "jobPostAndApply") {
      placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
        ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status'],
        customFields: {
          companyName: 'companyName',
          department: 'department',
          designation: 'designation',
          location: 'location'
        }
      });

      placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
        ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId'],
        customFields: {
          jobSummary: 'jobSummary',
          rolesAndResponsibilities: 'rolesAndResponsibilities',
          keySkills: 'keySkills'
        }
      });

      placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
        ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner']
      });
    } else {
      return badRequest(res, "Invalid type");
    }

    // Validate template content
    console.log('2')
    const invalidPlaceholders = validateTemplateContentTest(content, placeholders);
    if (invalidPlaceholders) {
      console.log('6')
      return badRequest(res, `Invalid placeholders found: ${invalidPlaceholders.join(', ')}`);
    }

    // Save template
    const template = new Template({
      title,
      content,
      modelType: type,
      createdBy: req.employee.id,
      organizationId
    });

    await template.save();
    return success(res, "Template created successfully", template);
  } catch (error) {
    console.error("Create template error:", error);
    return unknownError(res, error);
  }
}
