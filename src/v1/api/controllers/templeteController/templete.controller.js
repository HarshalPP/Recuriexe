import Template from "../../models/templeteModel/templete.model.js"

import jobPostModel from "../../models/jobPostModel/jobPost.model.js"
import JobDescriptionModel from "../../models/jobdescriptionModel/jobdescription.model.js"


import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import uploadToSpaces from "../../services/spaceservices/space.service.js"
import mongoose from 'mongoose';




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

import { badRequest, serverValidation, success, unknownError } from "../../formatters/globalResponse.js"


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
    console.log("placeHoler" , placeholders)
  const validPlaceholders = [
    ...Object.values(placeholders.jobPost),
    ...Object.values(placeholders.jobDescription)
  ];
  const foundPlaceholders = content.match(/{{[a-zA-Z]+}}/g) || [];
  const invalidPlaceholders = foundPlaceholders.filter(placeholder => !validPlaceholders.includes(placeholder));
  return invalidPlaceholders.length === 0 ? null : invalidPlaceholders;
}




export async function createTemplate(req, res) {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
     return badRequest(res , "Please provide the title and content")
    }

    const placeholders = getSchemaPlaceholders();
    const invalidPlaceholders = validateTemplateContent(content, placeholders);
    if (invalidPlaceholders) {
      return badRequest(res ,  `Invalid placeholders found: ${invalidPlaceholders.join(', ')}`);
    }



    const template = new Template({
      title,
      content: content,
      createdBy: req.employee.id,
      organizationId:req.employee.organizationId
    });

    await template.save();
    return success(res , "Templete Create Successfully" , template)
  } catch (error) {
    return unknownError(res , error)
  }
}



// ✅ List all templates for a user
export async function listTemplates(req, res) {
    const orgainizationId=req.employee.organizationId;
  try {
    const templates = await Template.find({ organizationId: orgainizationId }).sort({ createdAt: -1 });
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
    const { templateId } = req.params;
    const { title, content } = req.body;

    if (!title && !content) {
      return badRequest(res, "Please provide the title and/or content to update");
    }

    const template = await Template.findById(templateId);
    if (!template) {
      return badRequest(res, "Template not found");
    }

    if (template.createdBy.toString() !== req.user._id.toString()) {
      return badRequest(res, "Unauthorized to update this template");
    }

    if (content) {
      const placeholders = getSchemaPlaceholders();
      const invalidPlaceholders = validateTemplateContent(content, placeholders);
      if (invalidPlaceholders.length > 0) {
        return badRequest(res, `Invalid placeholders found: ${invalidPlaceholders.join(', ')}`);
      }
    }

    if (title) {
      template.title = title;
    }

    template.updatedAt = Date.now();
    await template.save();

    return success(res, "Template updated successfully", template);
  } catch (error) {
    console.error("Template update error:", error);
    return unknownError(res, error);
  }
}



export async function getAvailablePlaceholders(req, res) {
  try {
    const placeholders = getSchemaPlaceholders();
    return success(res, 'Available placeholders retrieved successfully', placeholders);
  } catch (error) {
    console.error('Placeholder retrieval error:', error);
    return unknownError(res , error)
  }
}



export async function generateLinkedInPostAndPdf(req, res) {
  try {
    const { templateId, jobId, generatePdf = false } = req.body;

    if(!templateId){
        return badRequest(res , "Please select the templete")
    }

    if(!jobId){
        return badRequest(res , "Please provide the JobId")
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
      console.log("filePathInBucket" , filePathInBucket)

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