import Template from "../../models/templeteModel/templete.model.js"

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
import BranchModel from "../../models/branchModel/branch.model.js"
import Organization from '../../models/organizationModel/organization.model.js';
import departmentModel from '../../models/deparmentModel/deparment.model.js';
import designationModel from '../../models/designationModel/designation.model.js';
import WorkLocationModel from '../../models/worklocationModel/worklocation.model.js';
import Qualification from '../../models/QualificationModel/qualification.model.js'
import employementTypeModel from "../../models/employeementTypemodel/employeementtype.model.js"
import employeeTypeModel from "../../models/employeeType/employeeType.model.js" 
import { badRequest, notFound, serverValidation, success, unknownError } from "../../formatters/globalResponse.js"



export const resolveDynamicFields = async (modelDetail, modelType='jobApply') => {
  const resolved = { ...modelDetail };

  if (modelType === "jobApply") {
    resolved.uploadDoucmentLink = `${process.env.INTERVIEW_URL}/candidateDocumentUpload?candidateId=${resolved._id}&organizationId=${resolved.orgainizationId}`;

    // Branch
    if (Array.isArray(resolved.branchId) && resolved.branchId.length) {
      const branches = await BranchModel.find({ _id: { $in: resolved.branchId } }).lean();
      resolved.branchId = branches.map(branch => branch.name).filter(Boolean);
    }

    // Department
    if (resolved.departmentId) {
      const dept = await departmentModel.findById(resolved.departmentId).lean();
      if (dept?.name) resolved.departmentId = dept.name;
    }

    // Organization
    if (resolved.orgainizationId) {
      const org = await OrganizationModel.findById(resolved.orgainizationId).lean();
      if (org?.name) resolved.orgainizationId = org.name;
    }

    // Work Location
    if (resolved.workLocationId) {
      const loc = await WorkLocationModel.findById(resolved.workLocationId).lean();
      if (loc?.name) resolved.workLocationId = loc.name;
    }

    // Interview Data
    const interview = await InterviewDetail.findOne({ candidateId: resolved._id })
      .populate('interviewerId', 'email mobileNo employeName')
      .populate('hrId', 'email mobileNo employeName')
      .sort({ createdAt: -1 })
      .lean();

    if (interview) {
      if (interview.interviewerId) {
        resolved.interviewerName = interview.interviewerId.employeName || "";
        resolved.interviewerEmail = interview.interviewerId.email || "";
        resolved.interviewerNumber = interview.interviewerId.mobileNo || "";
      }

      resolved.AiInterviewLink = interview.AIInterviewId
        ? `${process.env.INTERVIEW_URL}/AI-Interview?InterviewId=${interview.AIInterviewId}`
        : "";

      if (interview.hrId) {
        resolved.scheduleHrName = interview.hrId.employeName || "";
        resolved.scheduleHrEmail = interview.hrId.email || "";
        resolved.scheduleHrNumber = interview.hrId.mobileNo || "";
      }

      const interviewMap = {
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

      for (const [sourceKey, targetKey] of Object.entries(interviewMap)) {
        if (interview[sourceKey] !== undefined) {
          resolved[targetKey] = interview[sourceKey];
        }
      }
    }

    // Job Post + Job Description data
    if (resolved.jobPostId) {
      const jobPostDetail = await jobPostModel.findById(resolved.jobPostId).lean();

      if (jobPostDetail) {
        // Employee type
        if (jobPostDetail.employeeTypeId) {
          const empType = await employeeTypeModel.findById(jobPostDetail.employeeTypeId).lean();
          if (empType?.title) resolved.jobPostemployeeTypeId = empType.title;
        }

        // Employment type
        if (jobPostDetail.employmentTypeId) {
          const empType = await employementTypeModel.findById(jobPostDetail.employmentTypeId).lean();
          if (empType?.title) resolved.jobPostemploymentTypeId = empType.title;
        }

        // Department
        if (jobPostDetail.departmentId) {
          const dept = await departmentModel.findById(jobPostDetail.departmentId).lean();
          if (dept?.name) resolved.jobPostdepartmentId = dept.name;
        }

        // Sub Department
        const dept = await departmentModel.findById(jobPostDetail?.departmentId);
        if (dept) {
          const subDept = dept.subDepartments.id(jobPostDetail.subDepartmentId);
          if (subDept) resolved.jobPostsubDepartmentId = subDept.name;
        }

        // Branch
        if (Array.isArray(jobPostDetail.branchId)) {
          const branches = await BranchModel.find({ _id: { $in: jobPostDetail.branchId } }).lean();
          resolved.jobPostbranchId = branches.map(b => b.name).filter(Boolean);
        }

        // Organization
        if (jobPostDetail.organizationId) {
          const org = await OrganizationModel.findById(jobPostDetail.organizationId).lean();
          if (org?.name) resolved.jobPostorganizationId = org.name;
        }

        // Work Location
        if (jobPostDetail.Worklocation) {
          const loc = await WorkLocationModel.findById(jobPostDetail.Worklocation).lean();
          if (loc?.name) resolved.jobPostWorklocation = loc.name;
        }

        // Qualification
        if (Array.isArray(jobPostDetail.qualificationId)) {
          const qualifications = await qualificationModel.find({
            _id: { $in: jobPostDetail.qualificationId }
          }).lean();
          resolved.jobPostqualificationId = qualifications.map(q => q.name).filter(Boolean);
        }

        // Job Description
        if (jobPostDetail.jobDescriptionId) {
          const jd = await JobDescriptionModel.findById(jobPostDetail.jobDescriptionId).lean();
          if (jd) {
            resolved.JDposition = jd.position || '';
            resolved.specialSkiils = jd.specialSkiils || '';
            resolved.JDAgeLimit = jd.AgeLimit || '';
            resolved.JDGender = jd.Gender || '';
            if (jd.jobDescription) {
              resolved.jobSummary = jd.jobDescription.JobSummary || '';
              resolved.rolesAndResponsibilities = jd.jobDescription.RolesAndResponsibilities || [];
              resolved.keySkills = jd.jobDescription.KeySkills || [];
            }
          }
        }
      }
    }
  }

  if (modelType === "employee") {
    if (Array.isArray(resolved.roleId) && resolved.roleId.length) {
      const roles = await roleModel.find({ _id: { $in: resolved.roleId } }).lean();
      resolved.roleId = roles.map(role => role.roleName).filter(Boolean);
    }

    if (Array.isArray(resolved.branchId)) {
      const branches = await BranchModel.find({ _id: { $in: resolved.branchId } }).lean();
      resolved.branchId = branches.map(branch => branch.name).filter(Boolean);
    }

    if (resolved.organizationId) {
      const org = await OrganizationModel.findById(resolved.organizationId).lean();
      if (org?.name) resolved.organizationId = org.name;
    }

    if (resolved.departmentId) {
      const dept = await departmentModel.findById(resolved.departmentId).lean();
      if (dept?.name) resolved.departmentId = dept.name;
    }

    if (resolved.subDepartmentId) {
      const dept = await departmentModel.findById(resolved.departmentId);
      if (dept) {
        const subDept = dept.subDepartments.id(resolved.subDepartmentId);
        if (subDept) resolved.subDepartmentId = subDept.name;
      }
    }

    if (resolved.workLocationId) {
      const loc = await WorkLocationModel.findById(resolved.workLocationId).lean();
      if (loc?.name) resolved.workLocationId = loc.name;
    }

    if (resolved.employeeTypeId) {
      const empType = await employeeTypeModel.findById(resolved.employeeTypeId).lean();
      if (empType?.title) resolved.employeeTypeId = empType.title;
    }

    if (resolved.employementTypeId) {
      const empType = await employementTypeModel.findById(resolved.employementTypeId).lean();
      if (empType?.title) resolved.employementTypeId = empType.title;
    }

    if (resolved.designationId) {
      const desig = await designationModel.findById(resolved.designationId).lean();
      if (desig?.name) resolved.designationId = desig.name;
    }
  }

  return resolved;
};

