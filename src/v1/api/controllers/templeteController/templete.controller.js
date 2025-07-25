import Template from "../../models/templeteModel/templete.model.js"
import { resolveDynamicFields } from "./utilsresolveDynamicFields.js"
import jobPostModel from "../../models/jobPostModel/jobPost.model.js"
import JobDescriptionModel from "../../models/jobdescriptionModel/jobdescription.model.js"
import jobApplyModel from "../../models/jobformModel/jobform.model.js"
import OrganizationModel from "../../models/organizationModel/organization.model.js"
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import uploadToSpaces from "../../services/spaceservices/space.service.js"
import mongoose from 'mongoose';
import { ObjectId } from "mongodb";
import branchModel from "../../models/branchModel/branch.model.js"
import Organization from '../../models/organizationModel/organization.model.js';
import Department from '../../models/deparmentModel/deparment.model.js';
import Designation from '../../models/designationModel/designation.model.js';
import WorkLocation from '../../models/worklocationModel/worklocation.model.js';
import Qualification from '../../models/QualificationModel/qualification.model.js'
import employmentTypeModel from "../../models/employeementTypemodel/employeementtype.model.js"
import employeeTypeModel from "../../models/employeeType/employeeType.model.js"
import EmployeeModel from "../../models/employeemodel/employee.model.js"
import { badRequest, notFound, serverValidation, success, unknownError } from "../../formatters/globalResponse.js"
import jobApply from "../../models/jobformModel/jobform.model.js"
import StageModel from "../../models/StageModel/stage.model.js";
import { createUserCase } from "../../controllers/verificationsuitController/caseinit.controller.js"
import { sendMailHelper } from "../../controllers/gmailController/gmailController.js"
import Emailuser from "../../models/UserEmail/user.js";


import BranchModel from "../../models/branchModel/branch.model.js";
import WorkLocationModel from "../../models/worklocationModel/worklocation.model.js";
import departmentModel from "../../models/deparmentModel/deparment.model.js";
import roleModel from "../../models/RoleModel/role.model.js";
import employementTypeModel from "../../models/employeementTypemodel/employeementtype.model.js";
import designationModel from "../../models/designationModel/designation.model.js";
import InterviewDetail from '../../models/InterviewDetailsModel/interviewdetails.model.js';
import EmailuserModel from "../../models/UserEmail/user.js"
import qualificationModel from '../../models/QualificationModel/qualification.model.js';


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
  // console.log('job-/-/-', job.jobPostIdRef)
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

    placeholders['{{organizationId}}'] = job.organizationId
      ? (await OrganizationModel.findById(job.organizationId))?.name || 'N/A'
      : 'N/A';

    placeholders['{{jobApplyworkLocation}}'] = job.workLocationId
      ? (await WorkLocation.findById(job.workLocationId))?.name || 'N/A'
      : 'N/A';
    placeholders['{{jobApplyBranch}}'] = Array.isArray(job?.branchId)
      ? (await branchModel.find({ _id: { $in: job.branchId } }))
        .map(q => q?.name || '').filter(Boolean).join(', ')
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

      placeholders['{{organizationId}}'] = jobPost.organizationId
        ? (await OrganizationModel.findById(jobPost.organizationId))?.name || 'N/A'
        : 'N/A';

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

    placeholders['{{branch}}'] = Array.isArray(job?.branchId)
      ? (await branchModel.find({ _id: { $in: job.branchId } }))
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

    const department = await Department.findById(job.departmentId);

    let subDepartmentName = 'N/A';

    if (department) {
      const subDept = department.subDepartments.id(job.subDepartmentId);
      if (subDept) subDepartmentName = subDept.name;
    }
    placeholders['{{subDepartment}}'] = subDepartmentName;

    //  placeholders['{{subDepartment}}'] = job.subDepartmentId
    // ? (await Department.findById(job.subDepartmentId))?.name || 'N/A'
    // : 'N/A';

    placeholders['{{employeeType}}'] = job.employeeTypeId
      ? (await employeeTypeModel.findById(job.employeeTypeId))?.title || 'N/A'
      : 'N/A';

    placeholders['{{employmentType}}'] = job.employmentTypeId
      ? (await employmentTypeModel.findById(job.employmentTypeId))?.title || 'N/A'
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
  placeholders.jobSummary = '{{jobSummary}}';
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
  const validPlaceholders = Object.values(placeholders || {})
    .flatMap(group => Object.values(group || {}));
  const foundPlaceholders = content.match(/{{[a-zA-Z0-9._]+}}/g) || [];
  const invalidPlaceholders = foundPlaceholders.filter(ph => !validPlaceholders.includes(ph));
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
    // if (invalidPlaceholders) {
    //   return badRequest(res, `Invalid placeholders found: ${invalidPlaceholders.join(', ')}`);
    // }



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


export async function deleteTemplate(req, res) {
  try {
    const { templateId } = req.query;
    const template = await Template.findById(templateId);

    if (!template) {
      return badRequest(res, "Template not found");
    }

    await Template.findByIdAndDelete(templateId)

    return success(res, "Template Delete successfully");
  } catch (error) {
    console.error("Template retrieval error:", error);
    return unknownError(res, error);
  }
}



export async function updateTemplate(req, res) {
  try {
    // const { templateId } = req.params;
    const { title, content, type, templateId } = req.body;
    const organizationId = req.employee.organizationId;

    if (!title && !content) {
      return badRequest(res, "Please provide the title and/or content to update");
    }

    if (!templateId) {
      return badRequest(res, "Template Id Required");
    }
    const template = await Template.findById(templateId);
    if (!template) {
      return notFound(res, "Template Not Found");
    }

    if (title) {
      const existingTemplate = await Template.findOne({
        _id: { $ne: templateId },
        organizationId: new ObjectId(organizationId),
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
      // if (template.modelType === "jobPost") {
      //   placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
      //     ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status'],
      //     customFields: {
      //       companyName: 'companyName',
      //       department: 'department',
      //       designation: 'designation',
      //       location: 'location'
      //     }
      //   });

      //   placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
      //     ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId'],
      //     customFields: {
      //       jobSummary: 'jobSummary',
      //       rolesAndResponsibilities: 'rolesAndResponsibilities',
      //       keySkills: 'keySkills'
      //     }
      //   });

      // } else if (template.modelType === "jobApply") {
      //   placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
      //     ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner']
      //   });

      // } else if (template.modelType === "jobPostAndApply") {
      //   placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
      //     ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status'],
      //     customFields: {
      //       companyName: 'companyName',
      //       department: 'department',
      //       designation: 'designation',
      //       location: 'location'
      //     }
      //   });

      //   placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
      //     ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId'],
      //     customFields: {
      //       jobSummary: 'jobSummary',
      //       rolesAndResponsibilities: 'rolesAndResponsibilities',
      //       keySkills: 'keySkills'
      //     }
      //   });

      //   placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
      //     ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner']
      //   });
      // }

      if (template.modelType === "jobPost") {
        placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
          ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status'],
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

        placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
          ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId'],
          customFields: {
            jobSummary: 'jobSummary',
            rolesAndResponsibilities: 'rolesAndResponsibilities',
            keySkills: 'keySkills'
          }
        });

      } else if (template.modelType === "jobApply") {
        console.log('1')
        placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
          ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner'],
          customFields: {
            jobApplyworkLocation: 'jobApplyworkLocation',
            // jobApplyvacancyRequest: 'jobApplyvacancyRequest',
            jobApplyBranch: 'jobApplyBranch',
          }
        });

      } else if (template.modelType === "jobPostAndApply") {
        placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
          ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status'],
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

        placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
          ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId'],
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
      } else {
        return badRequest(res, "Invalid type");
      }

      const invalidPlaceholders = validateTemplateContentTest(content, placeholders);

      // ✅ Fix: Safely check length
      if (invalidPlaceholders && invalidPlaceholders.length > 0) {
        // return badRequest(res, `Invalid placeholders found: ${invalidPlaceholders.join(', ')}`);
      }

      template.content = content;
    }


    if (type) {
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




export function extractPlaceholdersFromSchema(model, options = {}) {
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

// export async function getAvailablePlaceholders(req, res) {
//   try {
//     const { type } = req.query;
//     let placeholders = {};

//     if (!type) {
//       return badRequest(res, "Model Type Required")
//     }

//     if (!type || type === "jobPost") {
//       placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
//         ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status', 'budgetType','jobPostApproveRemark'],
//         customFields: {
//           companyName: 'companyName',
//           department: 'department',
//           designation: 'designation',
//           location: 'location',
//           employmentType: 'employmentType',
//           employeeType: 'employeeType',
//           subDepartment: 'subDepartment',
//           branch: 'branch',
//         }
//       });

//       // Extract jobDescription fields, nested under jobDescription
//       placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
//         ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId','jobDescription.JobSummary'],
//         customFields: {
//           jobSummary: 'jobSummary',
//           rolesAndResponsibilities: 'rolesAndResponsibilities',
//           keySkills: 'keySkills'
//         }
//       });
//     } else if (!type || type === "jobApply") {
//       placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
//         ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner','AI_Confidence','Joining_Status','AI_Result',
//           'AI_Score','password','positionWebsite','internalReferenceData','currentDesignation','knewaboutJobPostFrom','preferedInterviewMode',
//           'bankAccountProof','salarySlip','approvalPayrollfinOfferLetter','pathofferLetterFinCooper','prevofferLetterFinCooper','pathofferLetterFinCooper',
//           'finCooperOfferLetter','positionWebsite',''],
//           customFields: {
//           jobApplyworkLocation: 'jobApplyworkLocation',
//           orgainizationId: 'orgainizationName',
//           jobApplyBranch: 'jobApplyBranch',
//         }
//       });
//     } else if (!type || type === "jobPostAndApply") {
//       placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
//         ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status', 'budgetType','Joining_Status'],
//         customFields: {
//           companyName: 'companyName',
//           department: 'department',
//           designation: 'designation',
//           location: 'location',
//           employmentType: 'employmentType',
//           employeeType: 'employeeType',
//           subDepartment: 'subDepartment',
//           branch: 'branch',
//           // jobPostVacancyRequest: 'jobPostVacancyRequest',
//         }
//       });

//       // Extract jobDescription fields, nested under jobDescription
//       placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
//         ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId','jobDescription.JobSummary'],
//         // prefix: 'jobDescription', // To produce jobDescription.jobSummary format
//         customFields: {
//           jobSummary: 'jobSummary',
//           rolesAndResponsibilities: 'rolesAndResponsibilities',
//           keySkills: 'keySkills'
//         }
//       });

//       placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
//         ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner','Joining_Status','AI_Confidence','AI_Result','AI_Score'],
//         customFields: {
//           jobApplyworkLocation: 'jobApplyworkLocation',
//           // jobApplyvacancyRequest: 'jobApplyvacancyRequest',
//           jobApplyBranch: 'jobApplyBranch',
//         }
//       });
//     } else {
//       return badRequest(res, "Model Type Invalid")
//     }

//     return success(res, 'Available placeholders retrieved successfully', placeholders);
//   } catch (error) {
//     console.error('Placeholder retrieval error:', error);
//     return unknownError(res, error);
//   }
// }



export async function getAvailablePlaceholders(req, res) {
  try {
    const { type } = req.query;
    let placeholders = {};

    if (!type) {
      return badRequest(res, "Model Type Required")
    }


    if (!type || type === "jobPost") {
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
    } else if (!type || type === "jobApply") {
      placeholders.jobApplyForm = extractPlaceholdersFromSchema(jobApplyModel, {
        ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner', 'password', 'reasonLeaving', 'managerRevertReason', 'sendOfferLetterToCandidate',
          'sendZohoCredentials', 'candidateStatus', 'isEligible', 'Joining_Status'],
        customFields: {
          workLocationId: 'workLocationName',
          branchId: 'branchName',
          departmentId: 'departmentName',
          orgainizationId: 'orgainizationName',
        }
      });
    } else if (!type || type === "jobPostAndApply") {
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
        }
      });
    } else if (!type || type === "candidateInterview") {
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
        }
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
      .populate('organizationId')
      .populate('designationId')
      .populate('departmentId')
      .populate('branchId')
      .populate('employmentTypeId')
      .populate('employeeTypeId')
      .populate('Worklocation');
    if (!job) throw new Error("Job not found");
    const jobDescription = await JobDescriptionModel.findById(job.jobDescriptionId);
    if (!jobDescription) throw new Error("Job Description not found");
    return await getPlaceholderDataTest(job, jobDescription);
  }

  if (type === 'jobApply') {
    const jobApply = await jobApplyModel.findById(jobId)
      .populate('jobPostId')
      .populate('orgainizationId')
      .populate('departmentId')
      .populate('workLocationId')
    // .select('jobPostId');
    if (!jobApply) throw new Error("Job Application not found");
    return await getPlaceholderDataTest(jobApply, null);
  }

  if (type === 'jobPostAndApply') {
    const jobApply = await jobApplyModel.findById(jobId)
      .populate('jobPostId')
      .populate('orgainizationId')
      .populate('departmentId')
      .populate('workLocationId');
    if (!jobApply) throw new Error("Job Application not found");
    const job = await jobPostModel.findById(jobApply.jobPostId._id)
      .populate('jobDescriptionId')
      .populate('designationId')
      .populate('departmentId')
      .populate('branchId')
      .populate('organizationId')
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
// export async function generateLinkedInPostAndPdfDynamic(req, res) {
//   try {
//     const { templateId, jobId, generatePdf = false } = req.body;

//     if (!templateId) return badRequest(res, "Please select the template");
//     if (!jobId) return badRequest(res, "Please provide the JobId");

//     const template = await Template.findById(templateId);
//     if (!template) return badRequest(res, "Template not found");
//     const type = template.modelType

//     let modelDetail
//     let ModelType ;
//     if(template){
//       modelDetail = await jobApplyModel.findById(jobId).lean();
//       if (modelDetail) {
//         ModelType = 'jobApply'
//     } else{
//       modelDetail = await EmployeeModel.findById(jobId).lean();
//       if (modelDetail) {
//         ModelType = 'employee'
//       }else{
//          return badRequest(res, "Model data not found for the given jobId");
//       }
//     }
//   }
//     const placeholders = await resolveDynamicFields(modelDetail, template.content , ModelType);
//      let postContent = template.content;
//     for (const [key, value] of Object.entries(placeholders)) {
//   postContent = postContent.replace(
//     new RegExp(`{{${key}}}`, 'g'),
//     value?.toString?.() || 'N/A'
//   );
// }
//     const responseData = {
//       userId: req.employee.id,
//       timestamp: new Date()
//     };

//     if (generatePdf) {
//       const browser = await puppeteer.launch({ headless: true });
//       const page = await browser.newPage();
//       await page.setContent(postContent, { waitUntil: 'networkidle0' });
//       const pdfBuffer = await page.pdf({
//         format: 'A4', printBackground: true,
//         margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
//       });
//       await browser.close();

//       const fileName = `${Date.now()}_job_post.pdf`;
//       const filePathInBucket = `${process.env.PATH_BUCKET}/HRMS/PDF/${fileName}`;

//       const pdfUrl = await uploadToSpaces(
//         'finexe',
//         filePathInBucket,
//         pdfBuffer,
//         'public-read',
//         'application/pdf'
//       );
//       responseData.pdfUrl = pdfUrl;
//     }

//     return success(res, "Generated successfully", responseData);
//   } catch (error) {
//     console.error('LinkedIn post and PDF generation error:', error);
//     return unknownError(res, error);
//   }
// }


function replaceTemplatePlaceholders(template, dataObject) {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = dataObject?.[key.trim()];
    if (Array.isArray(value)) return value.join(', ');
    return value !== undefined && value !== null ? value : 'N/A';
  });
}



async function enrichModelDetail(modelId) {
  let modelDetail = await jobApplyModel.findById(modelId).lean();
  let modelType = 'jobApply';

  if (modelDetail) {
    if (Array.isArray(modelDetail.branchId) && modelDetail.branchId.length) {
      const branches = await BranchModel.find({
        _id: { $in: modelDetail.branchId }
      }).lean();
      modelDetail.branchId = branches.map(branch => branch.name).filter(Boolean);
    }

    if (modelDetail.orgainizationId) {
      const org = await OrganizationModel.findById(modelDetail.orgainizationId).lean();
      if (org?.name) modelDetail.orgainizationId = org.name;
    }

    if (modelDetail.departmentId) {
      const deprt = await departmentModel.findById(modelDetail.departmentId).lean();
      if (deprt?.name) modelDetail.departmentId = deprt.name;
    }

    if (modelDetail.workLocationId) {
      const loc = await WorkLocationModel.findById(modelDetail.workLocationId).lean();
      if (loc?.name) modelDetail.workLocationId = loc.name;
    }

    if (modelDetail) {
      const interview = await InterviewDetail.findOne({ candidateId: modelId }).populate('interviewerId', 'email mobileNo employeName').populate('hrId', 'email mobileNo employeName').sort({ createdAt: -1 }).lean();
      // console.log('interview', interview);
      if (interview?.interviewerId) {
        modelDetail.interviewerName = interview.interviewerId.employeName || "";
        modelDetail.interviewerEmail = interview.interviewerId.email || "";
        modelDetail.interviewerNumber = interview.interviewerId.mobileNo || "";
      }

      if (interview?.hrId) {

        modelDetail.scheduleHrName = interview.hrId.employeName || "";
        modelDetail.scheduleHrEmail = interview.hrId.email || "";
        modelDetail.scheduleHrNumber = interview.hrId.mobileNo || "";
      }
      const interviewFieldMap = {
        scheduleLink: 'scheduleLink',
        interviewType: 'interviewType',
        scheduleDate: 'scheduleDate',
        durationMinutes: 'durationMinutes',
        roundNumber: 'intervieRoundNumber',
        status: 'interviewStatus',
        feedback: 'interviewFeedback',
        interviewfeedbackStatus: 'interviewfeedbackStatus',
        roundName: 'intervieRoundName',
      };
      if (interview) {
        for (const [interviewKey, modelKey] of Object.entries(interviewFieldMap)) {
          if (interview[interviewKey] !== undefined) {
            modelDetail[modelKey] = interview[interviewKey];
          }
        }
      }
    }

    // console.log('modelDetail.jobPostId',modelDetail.jobPostId)
    if (modelDetail.jobPostId) {
      const jobPostDetail = await jobPostModel.findById(modelDetail.jobPostId).lean();


      if (jobPostDetail.employeeTypeId) {
        const employeeType = await employeeTypeModel.findById(jobPostDetail.employeeTypeId).lean();
        if (employeeType?.title) modelDetail.jobPostemployeeTypeId = employeeType.title;
      }

      if (jobPostDetail.employmentTypeId) {
        const employement = await employementTypeModel.findById(jobPostDetail.employmentTypeId).lean();
        if (employement?.title) modelDetail.jobPostemploymentTypeId = employement.title;
      }

      if (jobPostDetail.departmentId) {
        const deprt = await departmentModel.findById(jobPostDetail.departmentId).lean();
        if (deprt?.name) modelDetail.jobPostdepartmentId = deprt.name;
      }

      const department = await departmentModel.findById(jobPostDetail?.departmentId);

      if (department) {
        const subDept = department.subDepartments.id(jobPostDetail.subDepartmentId);
        if (subDept) modelDetail.jobPostsubDepartmentId = subDept.name;
      }


      if (Array.isArray(jobPostDetail.branchId) && jobPostDetail.branchId.length) {
        const branches = await BranchModel.find({
          _id: { $in: jobPostDetail.branchId }
        }).lean();
        modelDetail.jobPostbranchId = branches.map(branch => branch.name).filter(Boolean);
      }

      if (jobPostDetail.organizationId) {
        const org = await OrganizationModel.findById(jobPostDetail.organizationId).lean();
        if (org?.name) modelDetail.jobPostorganizationId = org.name;
      }

      if (Array.isArray(jobPostDetail.qualificationId) && jobPostDetail.qualificationId.length) {
        const qualifications = await qualificationModel.find({
          _id: { $in: jobPostDetail.qualificationId }
        }).lean();
        jobPostDetail.jobPostqualificationId = qualifications.map(branch => branch.name).filter(Boolean);
      }

      if (jobPostDetail.Worklocation) {
        const workLoc = await WorkLocationModel.findById(jobPostDetail.Worklocation).lean();
        // console.log('workLoc', workLoc.name)
        if (workLoc?.name) modelDetail.jobPostWorklocation = workLoc.name;
      }


      if (jobPostDetail.jobDescriptionId) {
        const jobDescription = await JobDescriptionModel.findById(jobPostDetail.jobDescriptionId).lean();

        if (jobDescription) {
          // Flat fields
          modelDetail.JDposition = jobDescription.position || '';
          modelDetail.specialSkiils = jobDescription.specialSkiils || '';
          modelDetail.JDAgeLimit = jobDescription.AgeLimit || '';
          modelDetail.JDGender = jobDescription.Gender || '';

          // Nested jobDescription fields
          if (jobDescription.jobDescription) {
            modelDetail.JobSummary = jobDescription.jobDescription.JobSummary || '';
            modelDetail.rolesAndResponsibilities = jobDescription.jobDescription.RolesAndResponsibilities || [];
            modelDetail.keySkills = jobDescription.jobDescription.KeySkills || [];
          }
        }
      }

    }
  } else {
    modelDetail = await EmployeeModel.findById(modelId).lean();
    modelType = 'employee';

    if (modelDetail) {
      if (modelDetail) {

        if (Array.isArray(modelDetail.roleId) && modelDetail.roleId.length) {
          const roles = await roleModel.find({
            _id: { $in: modelDetail.roleId }
          }).lean();
          modelDetail.roleId = roles.map(role => role.roleName).filter(Boolean);
        }

        if (Array.isArray(modelDetail.branchId) && modelDetail.branchId.length) {
          const branches = await BranchModel.find({
            _id: { $in: modelDetail.branchId }
          }).lean();
          modelDetail.branchId = branches.map(branch => branch.name).filter(Boolean);
        }

        if (modelDetail.organizationId) {
          const org = await OrganizationModel.findById(modelDetail.organizationId).lean();
          if (org?.name) modelDetail.organizationId = org.name;
        }

        if (modelDetail.departmentId) {
          const deprt = await departmentModel.findById(modelDetail.departmentId).lean();
          if (deprt?.name) modelDetail.departmentId = deprt.name;
        }


        const department = await departmentModel.findById(modelDetail?.departmentId);

        let subDepartmentId = 'N/A';

        if (department) {
          const subDept = department.subDepartments.id(modelDetail.subDepartmentId).lean();
          if (subDept) modelDetail.subDepartmentId = subDept.name;
        }


        if (modelDetail.workLocationId) {
          const loc = await WorkLocationModel.findById(modelDetail.workLocationId).lean();
          if (loc?.name) modelDetail.workLocationId = loc.name;
        }
        if (modelDetail.employeeTypeId) {
          const employeeType = await employeeTypeModel.findById(modelDetail.employeeTypeId).lean();
          if (employeeType?.title) modelDetail.employeeTypeId = employeeType.title;
        }

        if (modelDetail.employementTypeId) {
          const employement = await employementTypeModel.findById(modelDetail.employementTypeId).lean();
          if (employement?.title) modelDetail.employementTypeId = employement.title;
        }

        if (modelDetail.designationId) {
          const desig = await designationModel.findById(modelDetail.designationId).lean();
          if (desig?.name) modelDetail.designationId = desig.name;
        }

        if (modelDetail.designationId) {
          const desig = await designationModel.findById(modelDetail.designationId).lean();
          if (desig?.name) modelDetail.designationId = desig.name;
        }


        if (modelDetail.email) {
          toMail = [modelDetail.email];
        } else {
          return badRequest(res, "Employee Email Not Found")
        }
      }
    } else {
      throw new Error("Model data not found for the given jobId");
    }
  }

  return { modelDetail, modelType };
}




export async function generateLinkedInPostAndPdfDynamic(req, res) {
  try {
    const { templateName, jobId, generatePdf = false } = req.body;
    const organizationId = req.employee.organizationId;
    if (!organizationId) {
      return badRequest(res, "Organization ID is required");
    }
    if (!templateName) return badRequest(res, "Template Name Is Required");
    if (!jobId) return badRequest(res, "Please provide the JobId");

    const template = await Template.findOne({ title: templateName, organizationId: new ObjectId(organizationId) });

    if (!template) return badRequest(res, "Template not found");

    const { modelDetail, modelType } = await enrichModelDetail(jobId); // your extended logic

    // ➤ Replace template placeholders with actual values
    const postContent = replaceTemplatePlaceholders(template.content, modelDetail);

    const responseData = {
      userId: req.employee.id,
      timestamp: new Date()
    };

    if (generatePdf) {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(postContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
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


    if (responseData.pdfUrl) {
      const Update = await jobApplyModel.findByIdAndUpdate(jobId, {
        $set: {
          offerLetter: responseData.pdfUrl,
          OfferLetterStatus: 'generated'
        }
      }, { new: true });
    }

    success(res, "Generated successfully", responseData);
   // Send offer letter + document verification if PDF was generated
    if (responseData.pdfUrl) {
      console.log("1")
      const stage = await StageModel.findOne({
        organizationId,
        stageName: "Offer Letter",
        status: "active",
      });


      if (!stage) {
        throw new Error("Stage not found for Offer Letter");
      }

      const defaultEmailUser = await Emailuser.findOne({
        organizationId,
        isDefault: true,
      }).lean();

      const findOrg = await OrganizationModel.findById(organizationId).lean();

      // Fetch candidate info based on jobApplyForm or your logic
      const candidate = await jobApplyModel.findOne({ _id: jobId }).lean(); // or use candidateId if available

      if (candidate && defaultEmailUser) {
        // Send Document Verification Email
        const mailData = {
          to: candidate.emailId,
          subject: "Document Verification Required - Action Needed",
          message: `
            <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333;">
              Dear <strong>${candidate.name}</strong>,
            </p>

            <p>
              To proceed with the next steps in our hiring process, please complete your 
              <strong>Document Verification</strong> by uploading the required documents using the secure link below:
            </p>

            <p style="text-align: center; margin: 20px 0;">
              <a href="${process.env.INTERVIEW_URL}/CandidateVerification?reportId=${candidate.ReportId}&candidateId=${candidate._id}" 
                 style="background-color: #0a66c2; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                🔗 Complete Document Verification
              </a>
            </p>

            <p style="color: #d9534f;">
              ⚠️ Ensure that your documents are clear, valid, and authentic to avoid any delays.
            </p>

            <p>
              If you have already submitted your documents, you may kindly ignore this message.
            </p>

            <p>
              Best regards,<br/>
              <strong>HR Team</strong><br/>
              <em>${findOrg?.name}</em>
            </p>
          `,
          userId: defaultEmailUser._id,
          organizationId,
        };

        await sendMailHelper(mailData);

        // Update Report Request status
        await jobApplyModel.findByIdAndUpdate(candidate._id, {
          $set: {
            ReportRequest: "requested",
          },
        });
      }

    }

  } catch (error) {
    console.error('LinkedIn post and PDF generation error:', error);
    return unknownError(res, error.message || error);
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
          location: 'location',
          employmentType: 'employmentType',
          employeeType: 'employeeType',
          subDepartment: 'subDepartment',
          branch: 'branch',
          // jobPostVacancyRequest: 'jobPostVacancyRequest',
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
        ignoreFields: ['_id', '__v', 'BulkResume', 'status', 'Remark', 'immediatejoiner'],
        customFields: {
          jobApplyworkLocation: 'jobApplyworkLocation',
          // jobApplyvacancyRequest: 'jobApplyvacancyRequest',
          jobApplyBranch: 'jobApplyBranch',
        }
      });

    } else if (type === "jobPostAndApply") {
      placeholders.jobPost = extractPlaceholdersFromSchema(jobPostModel, {
        ignoreFields: ['_id', '__v', 'createdByHrId', 'jobPostId', 'budget', 'budgetType', 'status'],
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

      placeholders.jobDescription = extractPlaceholdersFromSchema(JobDescriptionModel, {
        ignoreFields: ['_id', '__v', 'createdById', 'updatedById', 'subdeparmentId'],
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
    } else {
      return badRequest(res, "Invalid type");
    }

    // Validate template content
    console.log('2')
    const invalidPlaceholders = validateTemplateContentTest(content, placeholders);
    if (invalidPlaceholders) {
      console.log('6')
      // return badRequest(res, `Invalid placeholders found: ${invalidPlaceholders.join(', ')}`);
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
