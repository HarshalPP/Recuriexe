import { validationResult } from 'express-validator';
import { badRequest, serverValidation, success, unknownError } from "../../formatters/globalResponse.js"
import desingnationModel from "../../models/designationModel/designation.model.js"
import { createJobDescriptionService , getjobdes  , updateJobDescription} from "../../services/jobdescriptionservices/jobdescription.services.js"
import{generateAIResponse} from "../../services/Geminiservices/gemini.service.js"
import deparmentModel from "../../models/deparmentModel/deparment.model.js"
import AIConfigModel from "../../models/AiModel/ai.model.js"
import jobPostModel from '../../models/jobPostModel/jobPost.model.js';
import organizationModel from '../../models/organizationModel/organization.model.js';
import BranchModel from '../../models/branchModel/branch.model.js';
import designationModel from '../../models/designationModel/designation.model.js';

// Add Job description //
export const addJobDescription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: 'serverValidation',
        errors: errors.array(),
      });
    }

    const { position, jobDescription , departmentId , subdeparmentId } = req.body;


    // Set createdById from verified token middleware
    req.body.createdById = req.employee.id;
    const organizationId = req.employee.organizationId;
   // Optional: Validate designation exists

    // Call service to create Job Description
    const jobDescriptionData = await createJobDescriptionService(req.body , organizationId);

    return success(res, 'Job Description Added Successfully', jobDescriptionData);
  } catch (error) {
    console.error('Error adding job description:', error);
    return unknownError(res, error);
  }
};


// get Job description //

export const getJobdescription = async(req, res)=>{
    try {
       const organizationId = req.employee.organizationId;
        const data = await getjobdes(organizationId);
        success(res, "Job Description Data", data);
        
    } catch (error) {
        console.error("Error in getJobDescriptions:", error);
        unknownError(res, error);
    }

}


// Update job description //

export const updateJobDes = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
  
      const { jobDescriptionId, ...updateData } = req.body;


      const findJdId = await jobPostModel.findOne({jobDescriptionId: jobDescriptionId});
      if(findJdId) {
        return badRequest(res, "Job Description is already used in Job Post , Please create new Job Description");
      }
      const updatedById = req.employee.id;
  
      const result = await updateJobDescription(jobDescriptionId, updateData, updatedById);
      console.log("Update Result:", result);
  
      if (result === "DUPLICATE") {
        return badRequest(res, "Position Already Exists");
      }
  
      success(res, "Job Description Updated Successfully", result);
    } catch (error) {
      console.error("Error in updateJobDescription controller:", error);
      unknownError(res, error);
    }
  };


// export ai generated jd with key and

export const generateFormattedJobDescription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation(res, {
        errorName: 'serverValidation',
        errors: errors.array(),
      });
    }

    const { position, designationId } = req.body;

    if (!position || position.trim() === '' || !designationId) {
      return badRequest(res, 'Both position and designationId are required.');
    }

    const designation = await desingnationModel.findById(designationId);
    if (!designation) {
      return badRequest(res, 'Invalid designationId. No designation found.');
    }

    const prompt = `
Generate a detailed job description based on the following:

Role: ${position}
Designation: ${designation.name}

Format the response strictly as:

Role - [Role Name]
Educational Qualifications - [e.g., Graduate/Post Graduate]
Experience & Requirement - [e.g., 3–5 years of experience in XYZ]

Roles & Responsibilities - 
Use bullet points (•) for each responsibility. Provide at least 6–8 concise and relevant responsibilities in a professional tone.

Return the output in clean readable plain text. Do not include any additional commentary, explanation, or markdown formatting.
`;

    const aiResponse = await generateAIResponse(prompt);

    return success(res, 'Job Description generated successfully.', aiResponse);
  } catch (error) {
    console.error('Error generating job description:', error);
    return unknownError(res, error);
  }
};




// AI genetated jd //


// export const AIgeneratedJd = async (req, res) => {
//   try {
//     const findAiEnable = await AIConfigModel.findOne({ title:"jobdescription Analizer" , enableAIResumeParsing:true });
    
//     if(!findAiEnable) {
//       return badRequest(res, "Jobdescription Analizer is OFF.");
//     }

//     const { departmentId, subdeparmentId, specialSkills = [], designationId , AgeLimit , Gender } = req.body;

//     // Validate input
//     if (!departmentId || !subdeparmentId || !designationId) {
//       return badRequest(res, "Please provide departmentId, subdeparmentId, and designationId.");
//     }

//     // Fetch required data
//     const [department, subDepartment, designation] = await Promise.all([
//       deparmentModel.findById(departmentId),
//       deparmentModel.findOne({ _id: departmentId, "subDepartments._id": subdeparmentId }),
//       desingnationModel.findById(designationId)
//     ]);

//     if (!department || !subDepartment || !designation) {
//       return badRequest(res, "Invalid department, sub-department, or designation ID.");
//     }

//     const subDeptName = subDepartment.subDepartments.find(sub => sub._id.toString() == subdeparmentId)?.name;

//     if (!subDeptName) {
//       return badRequest(res, "Sub-department not found in the selected department.");
//     }

//     // Build AI prompt
//     const prompt = `
// Generate a detailed job description based on the following:

// Department: ${department.name}
// Sub-Department: ${subDeptName}
// Designation: ${designation.name}
// ${specialSkills.length > 0 ? "Skills: " + specialSkills.join(", ") : ""}
// ${AgeLimit ? `Preferred Age Limit: ${AgeLimit}` : ""}
// ${Gender ? `Preferred Gender: ${Gender}` : ""}

// Format:
// Role - [Designation Name]
// Educational Qualifications - [Example: Bachelor's/Master's in relevant field]
// Experience & Requirement - [e.g., 2-5 years of experience in related domain]
// Preferred Age Limit - [Mention if applicable]
// Preferred Gender - [Mention if applicable]



// Roles & Responsibilities -
// • Provide at least 10-12 relevant bullet points
// • Keep it clean, professional, and concise
// • Return plain text only — no markdown, HTML, or extra notes
// `;

//     // Get AI response
//     const aiResponse = await generateAIResponse(prompt);

//     return success(res, "Job Description generated successfully.", {
//       department: department.name,
//       subDepartment: subDeptName,
//       designation: designation.name,
//       jobDescription: aiResponse?.text || aiResponse
//     });

//   } catch (error) {
//     console.error("❌ AIgeneratedJd Error:", error);
//     return unknownError(res, "Failed to generate AI job description.");
//   }
// };


export const AIgeneratedJd = async (req, res) => {
  try {
    const findAiEnable = await AIConfigModel.findOne({ title: "jobdescription Analizer", enableAIResumeParsing: true });

    if (!findAiEnable) {
      return badRequest(res, "Jobdescription Analizer is OFF.");
    }

    const { departmentId, subdeparmentId, specialSkills = [], designationId, AgeLimit, Gender } = req.body;

    if (!departmentId || !subdeparmentId || !designationId) {
      return badRequest(res, "Please provide departmentId, subdeparmentId, and designationId.");
    }

    const [department, subDepartment, designation] = await Promise.all([
      deparmentModel.findById(departmentId),
      deparmentModel.findOne({ _id: departmentId, "subDepartments._id": subdeparmentId }),
      desingnationModel.findById(designationId),
    ]);

    if (!department || !subDepartment || !designation) {
      return badRequest(res, "Invalid department, sub-department, or designation ID.");
    }

    const subDept = subDepartment.subDepartments.find(sub => sub._id.toString() === subdeparmentId);
    if (!subDept) {
      return badRequest(res, "Sub-department not found in the selected department.");
    }

    const subDeptName = subDept.name;

    // Normalize Gender
    let genderDisplay = "Both male and female candidates can apply.";
    if (Gender?.toLowerCase() === "male") {
      genderDisplay = "Only male candidates are eligible for this role.";
    } else if (Gender?.toLowerCase() === "female") {
      genderDisplay = "Only female candidates are eligible for this role.";
    }

    // Normalize Age
    const ageDisplay = AgeLimit ? `Only candidates within the age group of ${AgeLimit} are eligible.` : "No specific age requirement.";

    // Prepare AI Prompt
    const prompt = `
Generate a structured job description with the following sections in JSON format:
{
  "Department": "${department.name}",
  "Sub-Department": "${subDeptName}",
  "Designation": "${designation.name}",
  "JobSummary": "Provide a brief 3-4 line summary of the job based on the department, sub-department, and designation.",
  
    "RolesAndResponsibilities": [
    "List 10-12 specific, concise bullet points relevant to the designation.",
    "${genderDisplay}",
    "${ageDisplay}"
  ],
  "KeySkills": [
    "List 5-7 relevant skills based on department, sub-department, and designation.",
    "${specialSkills.join('", "')}"
  ],
}

Ensure output is valid JSON only. Do not include any markdown or explanatory notes.
    `;

    const aiResponse = await generateAIResponse(prompt);
    const structuredJD = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse;

    return success(res, "Job Description generated successfully.", {
      department: department.name,
      subDepartment: subDeptName,
      designation: designation.name,
      jobDescription: structuredJD
    });

  } catch (error) {
    console.error("❌ AIgeneratedJd Error:", error);
    return unknownError(res, "Failed to generate AI job description.");
  }
};



//  Linkedin Posting //



export const generateLinkedInPost = async (req, res) => {
  try {
    const {
      departmentId,
      subDepartmentId,
      designationId,
      branchId,
      experience,
      organizationId,
    } = req.body;

    // Validate required fields
    if (!departmentId || !subDepartmentId || !designationId) {
      return badRequest(
        res,
        "Please provide departmentId, subDepartmentId, and designationId."
      );
    }

    // Fetch department and designation
    const [department, designation] = await Promise.all([
      deparmentModel.findById(departmentId),
      designationModel.findById(designationId),
    ]);

    if (!department) {
      return badRequest(res, "Invalid department ID.");
    }

    // Find sub-department inside the department
    const subDept = department.subDepartments.find(
      (sub) => sub._id.toString() === subDepartmentId
    );

    if (!subDept) {
      return badRequest(res, "Sub-department not found in the department.");
    }

    if (!designation) {
      return badRequest(res, "Invalid designation ID.");
    }

    // Fetch branch and organization
    const [branch, organization] = await Promise.all([
      BranchModel.findById(branchId),
      organizationModel.findById(organizationId),
    ]);

    if (!branch) {
      return badRequest(res, "Invalid branchId. No branch found.");
    }

    if (!organization) {
      return badRequest(res, "Invalid organizationId. No organization found.");
    }

    // AI prompt to generate LinkedIn post
    const prompt = `
Generate a LinkedIn-style hiring post using the following data:

- Company: ${organization.name}
- Department: ${department.name}
- Sub-Department: ${subDept.name}
- Designation: ${designation.name}
- Location: ${branch.name}
- Experience: ${experience}
- Email: career@fincoopers.in

Structure the output like a professional, engaging LinkedIn post (with emojis like 🚀, 📍, 🎓, etc.), ending with popular hashtags relevant to job posting (like #Hiring, #Freshers, #IndoreJobs). Ensure the output is clean plain text, no JSON or markdown.
`;

    const aiResponse = await generateAIResponse(prompt);
    // console.log("AI Response:", aiResponse);

    const postText =
      typeof aiResponse == "string"
        ? aiResponse
        : aiResponse?.text || aiResponse?.linkedin_post || "";

    return success(res, "LinkedIn post generated successfully.", {
      department: department.name,
      subDepartment: subDept.name,
      designation: designation.name,
      experience,
      postText,
    });
  } catch (error) {
    console.error("❌ generateLinkedInPost Error:", error);
    return unknownError(res, "Failed to generate LinkedIn post.");
  }
};









