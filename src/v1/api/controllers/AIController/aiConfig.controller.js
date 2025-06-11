import {
  success,
  badRequest,
  notFound,
  unknownError,
} from "../../formatters/globalResponse.js";
import jobPostModel from "../../models/jobPostModel/jobPost.model.js"
import designationModel from "../../models/designationModel/designation.model.js";
import aiModel from "../../models/AiModel/ai.model.js";
import jobApply from "../../models/jobformModel/jobform.model.js";
import { screenApplicant } from "../../services/screeningAI/screeningAi.services.js"
import AIRole from "../../models/AiScreeing/AIRule.model.js"
import { generateAIScreening } from "../../services/Geminiservices/gemini.service.js";
import JobDescriptionModel from "../../models/jobdescriptionModel/jobdescription.model.js";
import Qualification from "../../models/QualificationModel/qualification.model.js"
import departmentModel from "../../models/deparmentModel/deparment.model.js"
import screenai from "../../models/AiScreeing/AiScreening.model.js"
import CandidateAIScreeningModel from "../../models/screeningResultModel/screeningResult.model.js"
import mongoose from "mongoose";

import AIConfigModel from "../../models/AiModel/ai.model.js"
import { sendEmail } from "../../Utils/sendEmail.js";


export const createAIConfig = async (req, res) => {
  try {
    const { organizationId, title, enableAIResumeParsing } = req.body;

    // Validate required fields
    if (!organizationId || !title || typeof enableAIResumeParsing !== 'boolean') {
      return badRequest(res, "Missing or invalid required fields.");
    }

    // Create and save config
    const config = new AIConfigModel({
      organizationId,
      title,
      enableAIResumeParsing,
    });

    const result = await config.save();

    return success(res, "AI config created successfully", result);
  } catch (error) {
    console.log(error)
    return unknownError(res, error.message || "Internal server error");
  }
};



export const updateAIConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedConfig = await AIConfigModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedConfig) return notFound(res, "AI config not found for this organization.");

    return success(res, "AI config updated successfully", updatedConfig);
  } catch (error) {
    return unknownError(res, error);
  }
};


export const deleteAIConfig = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const deletedConfig = await AIConfigModel.findOneAndDelete({ organizationId });
    if (!deletedConfig) return notFound(res, "AI config not found for this organization.");

    return success(res, "AI config deleted successfully", deletedConfig);
  } catch (error) {
    return unknownError(res, error);
  }
};



// get All config //
export const getAllAIConfigs = async (req, res) => {
  try {
    const configs = await AIConfigModel.find().populate({
      path: "organizationId",
      select: 'name'
    })
      .sort({ createdAt: -1 })

    if (configs.length === 0) {
      return success(res, "No AI configs found.");
    }

    return success(res, "AI configs fetched successfully", configs);
  } catch (error) {
    return unknownError(res, error);
  }
};


// AI Screening Dashboard //


export const screenApplicantAPI = async (req, res) => {
  try {
    const { jobPostId, resume, candidateId } = req.body;


    if (!jobPostId || !resume) {
      return badRequest(res, "Missing required fields: jobPostId, resume, or candidateId");
    }

    const candidateIdExists = await jobApply.findOne({ candidateId });

    if (!candidateIdExists) {
      return badRequest(res, "candidateId does not exist in the job application.");
    }

    const jobPost = await jobPostModel.findById(jobPostId).lean();
    if (!jobPost) return badRequest(res, "Job post not found");

    // Fetch designation
    const designation = await designationModel.findById(jobPost.designationId).lean();
    if (!designation) return badRequest(res, "Designation not found");

    const aiScreeningEnabled = await AIRole.findOne(AutomaticScreening => AutomaticScreening == true).lean();

    if (!aiScreeningEnabled) {
      return badRequest(res, "AI screening is not enabled..");
    }

    if (aiScreeningEnabled.AI_Screening.length == 0) {
      return badRequest(res, "No AI screening rules found.");
    }


    const result = await screenApplicant(jobPostId, resume);

    if (!result || result.error || result.status === 429) {
      return badRequest(res, "AI Screening failed or rate limited.");
    }

    return success(res, "AI Screening successful", {
      jobPostId,
      candidateId,
      result: {
        score: result.score,
        feedback: result.feedback,
        requiredPercentage,
        designation: designation.name,
      },
    }

    );

  } catch (error) {
    console.error("AI Screening Error:", error);
    unknownError(res, error);
  }
};

// Main API FOR SCREENING //
// export const screenCandidateAIProfile = async (req, res) => {
//   try {
//     const { jobPostId, resume, candidateId } = req.body;

//     if (!jobPostId || !resume) {
//       return badRequest(res, "Missing required fields: jobPostId, resume, aiRoleId");
//     }

//     // Fetch job details
//     const job = await jobPostModel.findById(jobPostId).lean();
//     if (!job) return badRequest(res, "Job not found");



//     const [
//   findJd,
//   Qualificationdata,
//   designation,
//   department
// ] = await Promise.all([
//   JobDescriptionModel.findById(job.jobDescriptionId).lean(),
//   Qualification.findById(job.qualificationId).lean(),
//   designationModel.findById(job.designationId).lean(),
//   departmentModel.findById(job.departmentId).lean()
// ]);

// // Error checks
// if (!findJd) return badRequest(res, "Job description not found");
// if (!Qualificationdata) return badRequest(res, "Qualification not found");
// if (!designation) return badRequest(res, "Designation not found");
// if (!department) return badRequest(res, "Department not found");



//     const aiRule = await AIRole.findOne({ AutomaticScreening: true }).lean();

//     const AiScreeing = await screenai.find({}).lean();
//     // Safely accessing the first item in the array
//     const coreSettings = AiScreeing[0]?.coreSettings || {};
//     const qualificationThresholdScore = coreSettings.qualificationThreshold || 50;
//     const confidenceThresholdScore = coreSettings.confidenceThreshold || 50;



//     let screeningRules = [];

//     if (aiRule && aiRule.AI_Screening?.length && aiRule.AI_Screening[0]?.category?.length) {
//       const categoryIds = aiRule.AI_Screening[0].category.map(id => id.toString());
//       const screenaiDocs = await screenai.find({}).lean();

//       const matchedCriteria = screenaiDocs.flatMap(doc =>
//         doc.screeningCriteria.filter(crit =>
//           categoryIds.includes(crit._id.toString())
//         )
//       );

//       if (matchedCriteria.length) {
//         aiRule.AI_Screening[0].category = matchedCriteria;

//         screeningRules = aiRule.AI_Screening.map(rule => ({
//           name: rule.name,
//           description: rule.description,
//           priority: rule.priority,
//           isActive: rule.isActive,
//           screeningCriteria: rule.category.map(item => ({
//             name: item.name,
//             description: item.description,
//             weight: item.weight,
//             confidence: item.confidence,
//             experience: item.experience,
//             isActive: item.isActive,
//           }))
//         }));
//       }
//     }

//     // Fallback to internal AI rules if no valid config found
//     if (!screeningRules.length) {
//       screeningRules = [{
//         name: "Default Screening Rule",
//         description: "Fallback AI rule using internal logic",
//         priority: 1,
//         isActive: true,
//         screeningCriteria: [
//           {
//             name: "Skills",
//             description: "Match with required skills from JD",
//             weight: 30,
//             confidence: 60,
//             experience: null,
//             isActive: true
//           },
//           {
//             name: "Experience",
//             description: "Compare years of experience",
//             weight: 30,
//             confidence: 50,
//             experience: job.experience,
//             isActive: true
//           },
//           {
//             name: "Education",
//             description: "Match educational qualifications",
//             weight: 20,
//             confidence: 70,
//             experience: null,
//             isActive: true
//           },
//           {
//             name: "Certifications",
//             description: "Check for relevant certifications",
//             weight: 10,
//             confidence: 50,
//             experience: null,
//             isActive: true
//           },
//           {
//             name: "Cultural Fit",
//             description: "Evaluate based on values and tone",
//             weight: 10,
//             confidence: 40,
//             experience: null,
//             isActive: true
//           }
//         ]
//       }];
//     }

//     const criteriaDetailsText = screeningRules
//       .map(rule => {
//         const criteriaDetails = rule.screeningCriteria
//           .map(c =>
//             `- Name: ${c.name}\n  Description: ${c.description}\n  Weight: ${c.weight || 0}%\n  Confidence: ${c.confidence || 'N/A'}\n  Experience: ${c.experience || 'N/A'}\n`
//           )
//           .join('\n');
//         return `Rule: ${rule.name}\nDescription: ${rule.description}\n\nCriteria:\n${criteriaDetails}`;
//       })
//       .join('\n\n');


    



//     // Build an array of applied rules for prompt
//     const appliedRules = screeningRules.map(rule => ({
//       name: rule.name,
//       priority: rule.priority,
//       isActive: rule.isActive,
//       criteriaCount: rule.screeningCriteria.length
//     }));
//     const prompt = `
// You are an intelligent AI screening system.

// Analyze the following job and resume information. Provide detailed analysis of:

// - Skills match
// - Education match
// - Experience match
// - Certifications
// - Project exposure
// - Leadership / Initiative
// - Cultural fit
// - Communication skills
// - Learning ability


// Each match should be scored from 0-100. Then calculate the overall AI score using weights:

// - qualificationThreshold: ${qualificationThresholdScore || 50}%
// - confidenceThreshold: ${confidenceThresholdScore || 50}%
// - criteriaDetails: ${criteriaDetailsText}

// Detailed screening rules and their criteria:
// ${criteriaDetailsText}

// Use the following format in JSON:
// {
//   "skillsMatch": 85,
//   "experienceMatch": 75,
//   "educationMatch": 90,
//   "CertificateMatch":40,
//   "Project_Exposure":50,
//   "Leadership_Initiative":60,
//   "Cultural_Fit":50,
//   "Communication_Skills":60,
//   "Learning_Ability":70,
//   "overallScore": 82,
//   "AI_Confidence": "enter confidence score here" ,
//   "AI_Processing_Speed": "enter processing speed here in seconds not in string need in numbers",
//   "Accuracy": "enter accuracy score here" || 0,
//   "decision": "Approved" | "Rejected",
//   "qualificationThreshold": ${qualificationThresholdScore || 50},
//   "confidenceThreshold": ${confidenceThresholdScore || 50},

// "criteria": [
//   { "criteria": "Skills", "score": 85, "reason": "Matched most of the required technical skills such as React, Node.js, and MongoDB." },
//   { "criteria": "Experience", "score": 75, "reason": "Experience slightly below required threshold, but shows exposure to similar projects." },
//   { "criteria": "Education", "score": 90, "reason": "Educational background aligns well with required qualifications, including a Bachelor's in Computer Science." },
//   { "criteria": "Certifications", "score": 80, "reason": "Relevant certifications like AWS Certified Developer and Scrum Master present." },
//   { "criteria": "Project Exposure", "score": 78, "reason": "Participated in full-lifecycle development of enterprise web applications." },
//   { "criteria": "Leadership / Initiative", "score": 65, "reason": "Some involvement in leading small teams and mentoring juniors." },
//   { "criteria": "Cultural Fit", "score": 70, "reason": "Values and work style appear to align with company culture based on resume phrasing and soft skills." },
//   { "criteria": "Communication Skills", "score": 82, "reason": "Resume shows clear articulation, and candidate has experience in client-facing roles." },
//   { "criteria": "Learning Ability", "score": 88, "reason": "Quick learner with recent completion of multiple self-paced courses." }
// ]

//   "acceptReason": [
//     {
//       "point": "Strong Technical Skills Match",
//       "description": "Candidate demonstrates proficiency in required technologies",
//       "percentage": "85%",
//       "weight": "High"
//     },
//     {
//       "point": "Educational Background Alignment",
//       "description": "Degree and certifications align with job requirements",
//       "percentage": "90%",
//       "weight": "Medium"
//     },
//     {
//       "point": "Relevant Industry Experience",
//       "description": "Previous work experience in similar domain",
//       "percentage": "75%",
//       "weight": "High"
//     }
//   ],
//   "rejectReason": [
//     {
//       "point": "Insufficient Experience Level",
//       "description": "Candidate lacks the required years of experience for this senior role",
//       "percentage": "45%",
//       "weight": "Critical",
//       "impact": "High"
//     },
//     {
//       "point": "Skills Gap in Core Technologies",
//       "description": "Missing proficiency in essential technical skills mentioned in job requirements",
//       "percentage": "35%",
//       "weight": "Critical",
//       "impact": "High"
//     },
//     {
//       "point": "Educational Qualification Mismatch",
//       "description": "Academic background does not meet the minimum qualification criteria",
//       "percentage": "40%",
//       "weight": "Medium",
//       "impact": "Medium"
//     },
//     {
//       "point": "Certification Requirements Not Met",
//       "description": "Lacks industry-specific certifications required for the role",
//       "percentage": "30%",
//       "weight": "Medium",
//       "impact": "Medium"
//     }
//   ],
//   "recommendation": "Suggest gaining experience in regulatory compliance and improving technical proficiency.",

//    "improvementSuggestions": [
//     "Gain experience with cloud platforms (AWS/Azure)",
//     "Develop enterprise-scale project experience",
//     "Enhance DevOps and CI/CD pipeline knowledge"
//   ],

//     "riskFactors": [
//     {
//       "factor": "Experience Gap",
//       "level": "Low",
//       "description": "Slight gap in required experience level",
//       "mitigation": "Strong technical skills compensate for experience gap"
//     }
//   ],
// }

// **IMPORTANT INSTRUCTIONS:**
// 1. Populate BOTH the "acceptReason" and "rejectReason" arrays to provide a full evaluation of the candidate.
//    - "acceptReason" should highlight the candidate’s strong points.
//    - "rejectReason" should list areas for improvement or mismatches.
// 2. Each reason point should include:
//    - point: Brief title of the reason
//    - description: Detailed explanation
//    - percentage: Match percentage for that specific criteria
//    - weight: Importance level (Critical/High/Medium/Low)
//    - impact: (For reject reasons only) Impact level (High/Medium/Low)
// 3. Ensure percentages are realistic and align with the overall scoring.
// 4. Provide 2-4 points for accept reasons and 2-5 points for reject reasons.
// 5. Make sure the reasons are specific to the candidate's profile and job requirements.

// --- Job Details ---
// Position: ${job.position}
// Department: ${department?.name || "N/A"}
// Experience Required: ${job.experience}

// --- Qualification Required ---
// ${Qualificationdata.name || "N/A"}

// --- Job Summary ---
// ${findJd.jobDescription.JobSummary || "N/A"}

// --- Roles and Responsibilities ---
// ${findJd.jobDescription.RolesAndResponsibilities.map((item, idx) => `${idx + 1}. ${item}`).join("\n") || "N/A"}

// --- Key Skills ---
// ${findJd.jobDescription.KeySkills.join(", ") || "N/A"}

// --- Resume Content ---
// ${resume}
// `;

//     // console.log("AI Screening Prompt:", prompt);



//     const aiResult = await generateAIScreening(prompt, resume);

//     if (!aiResult || aiResult.error) {
//       return badRequest(res, "AI screening failed");
//     }

//     const {
//       skillsMatch,
//       experienceMatch,
//       educationMatch,
//       CertificateMatch,
//       Project_Exposure,
//       Leadership_Initiative,
//       Cultural_Fit,
//       Communication_Skills,
//       Learning_Ability,
//       overallScore,
//       decision,
//       criteria,
//       acceptReason,
//       rejectReason,
//       recommendation,
//       AI_Confidence,
//       AI_Processing_Speed,
//       Accuracy,
//       qualificationThreshold,
//       confidenceThreshold,
//       improvementSuggestions,
//       riskFactors



//     } = aiResult;

//         // Upsert AI screening data
//     const filter = { candidateId };
//       const updateData = {
//       jobPostId,
//       candidateId,
//       position: job.position,
//       department: department.name,
//       qualification: Qualificationdata.name,
//       AI_Confidence,
//       AI_Processing_Speed,
//       Accuracy,
//       qualificationThreshold,
//       confidenceThreshold,
//       overallScore,
//       decision,
//       breakdown: {
//         skillsMatch,
//         experienceMatch,
//         educationMatch,
//         CertificateMatch,
//         Project_Exposure,
//         Leadership_Initiative,
//         Cultural_Fit,
//         Communication_Skills,
//         Learning_Ability
//       },
//       criteria,
//       acceptReason,
//       rejectReason,
//       recommendation,
//       improvementSuggestions,
//       riskFactors,
//     };

        
//     success(res,  "AI_Screening" , updateData);

//     const data = await jobApply.findOneAndUpdate(
//   { _id: new mongoose.Types.ObjectId(candidateId) }, // correct casting
//   {
//     AI_Screeing_Result: `${updateData?.decision}`,
//     AI_Screeing_Status: "Completed",
//     AI_Score:Number(updateData.overallScore),
//     AI_Confidence:Number(updateData.AI_Confidence)
//   },
//   { new: true }
// );




//         // Upsert operation: update if exists, else create
//     await CandidateAIScreeningModel.findOneAndUpdate(
//       filter,
//       updateData,
//       { new: true, upsert: true }
//     );




//   } catch (error) {
//     console.error("Error in screenCandidateAIProfile", error);
//     return unknownError(res, error);
//   }
// };


export const screenCandidateAIProfile = async (req, res) => {
  try {
    const { jobPostId, resume, candidateId } = req.body;
    const orgainizationId=req.employee.organizationId;
    if (!orgainizationId) {
      return badRequest(res, "Organization ID is required.");
    }

    if (!jobPostId || !resume) {
      return badRequest(res, "Missing required fields: jobPostId, resume, aiRoleId");
    }

    // Fetch job details
    const job = await jobPostModel.findById(jobPostId).lean();
    if (!job) return badRequest(res, "Job not found");



    const [
  findJd,
  Qualificationdata,
  designation,
  department,
  candidate
] = await Promise.all([
  JobDescriptionModel.findById(job.jobDescriptionId).lean(),
  Qualification.findById(job.qualificationId).lean(),
  designationModel.findById(job.designationId).lean(),
  departmentModel.findById(job.departmentId).lean(),
  jobApply.findById(candidateId).lean() // Fetch candidate details
]);

// Error checks
if (!findJd) return badRequest(res, "Job description not found");
if (!Qualificationdata) return badRequest(res, "Qualification not found");
if (!designation) return badRequest(res, "Designation not found");
if (!department) return badRequest(res, "Department not found");



    // First validate if resume matches candidate's basic information
    const validationPrompt = `
You are a resume validation system. Your task is to verify if the uploaded resume belongs to the person who applied for the job.

Compare the following candidate information with the resume content:

CANDIDATE APPLICATION DATA:
- Name: ${candidate.name}
- Email: ${candidate.emailId}
- Mobile: ${candidate.mobileNumber}

RESUME CONTENT:
${resume}

VALIDATION RULES:
1. Check if the name in the resume matches or is reasonably similar to the candidate's name
2. Check if the email in the resume matches the candidate's email
3. Check if the mobile number in the resume matches the candidate's mobile number

IMPORTANT:
- Names can have slight variations (nicknames, middle names, etc.) but should be recognizably the same person
- Email and mobile number should match exactly or be very close
- If ANY of these don't match, consider it invalid

Respond ONLY with a JSON object in this exact format:
{
  "isValid": true/false,
  "nameMatch": true/false,
  "emailMatch": true/false,
  "mobileMatch": true/false,
  "resumeName": "name found in resume or empty string",
  "resumeEmail": "email found in resume or empty string",
  "resumeMobile": "mobile found in resume or empty string",
  "reason": "Brief explanation of validation result"
}
`;

    // Validate resume first
    const validationResult = await generateAIScreening(validationPrompt, resume);
    
    if (!validationResult || validationResult.error) {
      throw new Error("Resume validation failed");
    }

    // If resume validation fails, reject immediately
    if (!validationResult.isValid) {
      const rejectionData = {
        jobPostId,
        candidateId,
        position: job.position,
        department: department.name,
        qualification: Qualificationdata.name,
        AI_Confidence: 95, // High confidence in rejection due to validation failure
        AI_Processing_Speed: 2,
        Accuracy: 100,
        qualificationThreshold: 0,
        confidenceThreshold:0,
        overallScore: 0,
        decision: "Rejected",
        breakdown: {
          skillsMatch: 0,
          experienceMatch: 0,
          educationMatch: 0,
          CertificateMatch: 0,
          Project_Exposure: 0,
          Leadership_Initiative: 0,
          Cultural_Fit: 0,
          Communication_Skills: 0,
          Learning_Ability: 0
        },
        criteria: [{
          criteria: "Resume Validation",
          description: "Verify if resume belongs to the candidate",
          weight: 100,
          score: 0,
          reason: `Resume validation failed: ${validationResult.reason}. Resume contains - Name: ${validationResult.resumeName}, Email: ${validationResult.resumeEmail}, Mobile: ${validationResult.resumeMobile}`
        }],
        acceptReason: [],
        rejectReason: [
          {
            point: "Resume Validation Failed",
            description: validationResult.reason,
            percentage: "0%",
            weight: "Critical",
            impact: "High"
          },
          {
            point: "Identity Mismatch",
            description: `Expected: ${candidate.name} (${candidate.emailId}, ${candidate.mobileNumber}) but resume contains different information`,
            percentage: "0%",
            weight: "Critical",
            impact: "High"
          }
        ],
        recommendation: "Please upload the correct resume that matches your application details",
        improvementSuggestions: [
          "Upload your own resume with correct personal information",
          "Ensure name, email, and mobile number match your application"
        ],
        riskFactors: [
          {
            factor: "Wrong Resume Upload",
            level: "Critical",
            description: "Candidate uploaded resume that doesn't match their application details",
            mitigation: "Require resume re-upload with validation"
          }
        ],
        organizationId: orgainizationId
      };

      // Update candidate with rejection
      await jobApply.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(candidateId) },
        {
          AI_Screeing_Result: "Rejected",
          AI_Screeing_Status: "Completed",
          AI_Score: 0,
          AI_Confidence: 95,
          lastOrganization: validationResult.resumeName ? "Resume Validation Failed" : ""
        },
        { new: true }
      );

      // Save rejection details
      await CandidateAIScreeningModel.findOneAndUpdate(
        { candidateId },
        rejectionData,
        { new: true, upsert: true }
      );

      return success(res, "AI Screening Rejected due to resume validation failure", rejectionData);
    }



const aiRule = await AIRole.findOne({ AutomaticScreening: true, orgainizationId: String(orgainizationId) }).lean();
const screenaiDocs = await screenai.find({ organizationId: orgainizationId }).lean();

const coreSettings = screenaiDocs[0]?.coreSettings || {};
const qualificationThresholdScore = coreSettings.qualificationThreshold || 50;
const confidenceThresholdScore = coreSettings.confidenceThreshold || 50;

let screeningRules = [];

if (aiRule?.AI_Screening?.length) {
  // Collect all unique categoryIds from all rules
  const categoryIds = aiRule.AI_Screening.flatMap(rule =>
    rule.category?.map(cat => cat.toString()) || []
  );

  // Flatten all criteria across screenaiDocs
  const allCriteria = screenaiDocs.flatMap(doc => doc.screeningCriteria || []);

  // Match relevant criteria
  const matchedCriteria = allCriteria.filter(crit =>
    categoryIds.includes(crit._id.toString())
  );


  if (matchedCriteria.length) {
    screeningRules = aiRule.AI_Screening.map(rule => {
      const matched = rule.category
        .map(catId => matchedCriteria.find(c => c._id.toString() === catId.toString()))
        .filter(Boolean);

      return {
        name: rule.name,
        description: rule.description,
        priority: rule.priority,
        isActive: rule.isActive,
        screeningCriteria: matched.map(item => ({
          name: item.name,
          description: item.description,
          weight: item.weight || 0,
          confidence: item.confidence || 0,
          isActive: item.isActive || false,
        }))
      };
    });
  }
}

// Fallback rule
if (!screeningRules.length) {
  console.warn("No valid AI screening rules found, using default rule");
  screeningRules = [{
    name: "Default Screening Rule",
    description: "Fallback AI rule using internal logic",
    priority: "Medium",
    isActive: true,
    screeningCriteria: [
      {
        name: "Skills",
        description: "Match with required skills from JD",
        weight: 30,
        confidence: 60,
        experience: null,
        isActive: true
      },
      {
        name: "Experience",
        description: "Compare years of experience",
        weight: 30,
        confidence: 50,
        experience: job.experience || null,
        isActive: true
      },
      {
        name: "Education",
        description: "Match educational qualifications",
        weight: 20,
        confidence: 70,
        experience: null,
        isActive: true
      },
      {
        name: "Certifications",
        description: "Check for relevant certifications",
        weight: 10,
        confidence: 50,
        experience: null,
        isActive: true
      },
      {
        name: "Cultural Fit",
        description: "Evaluate based on values and tone",
        weight: 10,
        confidence: 40,
        experience: null,
        isActive: true
      }
    ]
  }];
}


// Filtered flat list for AI prompt
const filteredCriteria = screeningRules.flatMap(rule =>
  (rule.screeningCriteria || [])
    .filter(c => c?.name && c?.weight > 0)  // Only include valid + weighted criteria
    .map(c => ({
      name: c.name.trim(),
      description: c.description || '',
      weight: c.weight,
      confidence: c.confidence || 0,
    }))
);

// 2. Format criteria array as string (score=0, reason="")
const criteriaArrayString = filteredCriteria.map(c =>
  `  { "criteria": "${c.name}", "description": "${c.description}", "weight": ${c.weight}, "score": 0, "reason": "" }`
).join(',\n');

// console.log("Criteria Array String:", criteriaArrayString);



    const prompt = `
You are an intelligent AI screening system.

Analyze the following job and resume information. Provide detailed analysis of:

Each criteria should be scored from 0 to 100.


"criteria": [
${criteriaArrayString}
],

/*
IMPORTANT:
For each object in the "criteria" array:
- Fill in "score" with a number from 0 to 100 indicating how well the candidate met the criterion.
- Fill in "reason" with a specific, clear explanation justifying the score.
- Do not leave "score" or "reason" blank.
- Do not return placeholders — only real data.
- Keep the JSON format exactly the same — any deviation will break the API.
*/


Use the following criteria weights and thresholds:

- Each criterion has a weight (importance percentage) which you must use to calculate a weighted average overall score.
- Qualification threshold: ${qualificationThresholdScore}% — The candidate's qualification score must meet or exceed this value.
- Confidence threshold: ${confidenceThresholdScore}% — The confidence level for the screening should meet or exceed this value.

Calculate the overall AI score as the weighted average of individual criterion scores using the weights provided.

Based on these scores:

- If the overall AI score and qualification score are both above their respective thresholds, the candidate is "Approved".
- Otherwise, the candidate is "Rejected".

For each criterion, provide:

- The score (0-100)
- A detailed explanation supporting the score


From the following resume, extract all organizations the candidate has worked for
Return the response in this JSON format:
{
  "lastOrganization": ["<org1>", "<org2>", ...]
}


Detailed screening rules and their criteria:
${JSON.stringify(filteredCriteria, null, 2)}

Use the following format in JSON:
{
  "skillsMatch": 0,
  "experienceMatch": 0,
  "educationMatch": 0,
  "CertificateMatch": 0,
  "Project_Exposure": 0,
  "lastOrganization": [],
  "Leadership_Initiative": 0,
  "Cultural_Fit": 0,
  "Communication_Skills": 0,
  "Learning_Ability": 0,
  "overallScore": 0,
  "AI_Confidence": "enter confidence score here in number not in string", // confidence score as a number
  "AI_Processing_Speed": 0, // in seconds
  "Accuracy": 0,
  "decision": "Approved" | "Rejected",
  "qualificationThreshold": ${qualificationThresholdScore || 50},
  "confidenceThreshold": ${confidenceThresholdScore || 50},
  
"criteria": [
${criteriaArrayString}
],  --in criteria array in reason also include resume last experience and education and skills and certification and project exposure and leadership initiative and cultural fit and communication skills and learning ability data 

  "acceptReason": [
    {
      "point": "Strong Technical Skills Match",
      "description": "Candidate demonstrates proficiency in required technologies",
      "percentage": "85%",
      "weight": "High"
    }
    // up to 3 more
  ],
  "rejectReason": [
    {
      "point": "Skills Gap in Core Technologies",
      "description": "Missing proficiency in essential technical skills",
      "percentage": "35%",
      "weight": "Critical",
      "impact": "High"
    }
    // up to 4 more
  ],
  "recommendation": "Suggest gaining experience in XYZ",
  "improvementSuggestions": [
    "Gain experience with cloud platforms",
    "Improve leadership skills"
  ],
  "riskFactors": [
    {
      "factor": "Experience Gap", // 
      "level": "Low",
      "description": "Slight gap in experience",
      "mitigation": "Strong skills mitigate this"
    }
  ]
}

--- Job Details ---
Position: ${job.position}
Department: ${department?.name || "N/A"}
Experience Required: ${job.experience}

--- Qualification Required ---
${Qualificationdata?.name || "N/A"}

--- Job Summary ---
${findJd.jobDescription.JobSummary || "N/A"}

--- Roles and Responsibilities ---
${findJd.jobDescription.RolesAndResponsibilities.map((item, idx) => `${idx + 1}. ${item}`).join("\n") || "N/A"}

--- Key Skills ---
${findJd.jobDescription.KeySkills.join(", ") || "N/A"}

--- Resume Content ---
${resume}
`;

    // console.log("AI Screening Prompt:", prompt);



    const aiResult = await generateAIScreening(prompt, resume);

    if (!aiResult || aiResult.error) {
      return badRequest(res, "AI screening failed");
    }

       // ✅ Add weighted score calculator
    const calculateWeightedScore = (criteria = []) => {
      let totalWeight = 0;
      let weightedSum = 0;

      for (const item of criteria) {
        const weight = Number(item.weight || 0);
        const score = Number(item.score || 0);
        weightedSum += weight * score;
        totalWeight += weight;
      }

      return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    };

    // 🧮 Calculate true weighted score from AI result
    const verifiedOverallScore = calculateWeightedScore(aiResult.criteria);


    const {
      skillsMatch,
      experienceMatch,
      educationMatch,
      CertificateMatch,
      lastOrganization,
      Project_Exposure,
      Leadership_Initiative,
      Cultural_Fit,
      Communication_Skills,
      Learning_Ability,
      overallScore,
      decision,
      criteria,
      acceptReason,
      rejectReason,
      recommendation,
      AI_Confidence,
      AI_Processing_Speed,
      Accuracy,
      qualificationThreshold,
      confidenceThreshold,
      improvementSuggestions,
      riskFactors


    } = aiResult;

        // Upsert AI screening data
    const filter = { candidateId };
      const updateData = {
      jobPostId,
      candidateId,
      position: job.position,
      department: department.name,
      qualification: Qualificationdata.name,
      AI_Confidence,
      AI_Processing_Speed,
      Accuracy,
      qualificationThreshold,
      confidenceThreshold,
      overallScore:verifiedOverallScore,
      decision,
      breakdown: {
        skillsMatch,
        experienceMatch,
        educationMatch,
        CertificateMatch,
        Project_Exposure,
        Leadership_Initiative,
        Cultural_Fit,
        Communication_Skills,
        Learning_Ability
      },
      criteria,
      acceptReason,
      rejectReason,
      recommendation,
      improvementSuggestions,
      riskFactors,
      orgainizationId: orgainizationId, // Include organization ID

    };

        
    success(res,  "AI_Screening" , updateData);

    const data = await jobApply.findOneAndUpdate(
  { _id: new mongoose.Types.ObjectId(candidateId) }, // correct casting
  {
    AI_Screeing_Result: `${updateData?.decision}`,
    AI_Screeing_Status: "Completed",
    AI_Score:Number(updateData.overallScore),
    AI_Confidence:Number(updateData.AI_Confidence),
    lastOrganization:Array.isArray(lastOrganization) ? lastOrganization : []
  },
  { new: true }
);




        // Upsert operation: update if exists, else create
    await CandidateAIScreeningModel.findOneAndUpdate(
      filter,
      updateData,
      { new: true, upsert: true }
    );




  } catch (error) {
    console.error("Error in screenCandidateAIProfile", error);
    return unknownError(res, error);
  }
};





export const processAIScreeningForCandidate = async ({ jobPostId, resume, candidateId, organizationId }) => {
  try {
    if (!jobPostId || !resume || !candidateId || !organizationId)  {
      throw new Error("Missing required fields: jobPostId, resume, candidateId");
    }

    const job = await jobPostModel.findById(jobPostId).lean();
    if (!job) throw new Error("Job not found");

    const [findJd, Qualificationdata, designation, department , candidate] = await Promise.all([
      JobDescriptionModel.findById(job.jobDescriptionId).lean(),
      Qualification.findById(job.qualificationId).lean(),
      designationModel.findById(job.designationId).lean(),
      departmentModel.findById(job.departmentId).lean(),
      jobApply.findById(candidateId).lean(),
    ]);

    if (!findJd || !Qualificationdata || !designation || !department) {
      throw new Error("Missing related job details (JD/Qualification/Designation/Department)");
    }
    // First validate if resume matches candidate's basic information
    const validationPrompt = `
You are a resume validation system. Your task is to verify if the uploaded resume belongs to the person who applied for the job.

Compare the following candidate information with the resume content:

CANDIDATE APPLICATION DATA:
- Name: ${candidate.name}
- Email: ${candidate.emailId}
- Mobile: ${candidate.mobileNumber}

RESUME CONTENT:
${resume}

VALIDATION RULES:
1. Check if the name in the resume matches or is reasonably similar to the candidate's name
2. Check if the email in the resume matches the candidate's email
3. Check if the mobile number in the resume matches the candidate's mobile number

IMPORTANT:
- Names can have slight variations (nicknames, middle names, etc.) but should be recognizably the same person
- Email and mobile number should match exactly or be very close
- If ANY of these don't match, consider it invalid

Respond ONLY with a JSON object in this exact format:
{
  "isValid": true/false,
  "nameMatch": true/false,
  "emailMatch": true/false,
  "mobileMatch": true/false,
  "resumeName": "name found in resume or empty string",
  "resumeEmail": "email found in resume or empty string",
  "resumeMobile": "mobile found in resume or empty string",
  "reason": "Brief explanation of validation result"
}
`;

    // Validate resume first
    const validationResult = await generateAIScreening(validationPrompt, resume);
    
    if (!validationResult || validationResult.error) {
      throw new Error("Resume validation failed");
    }

    // If resume validation fails, reject immediately
    if (!validationResult.isValid) {
      const rejectionData = {
        jobPostId,
        candidateId,
        position: job.position,
        department: department.name,
        qualification: Qualificationdata.name,
        AI_Confidence: 95, // High confidence in rejection due to validation failure
        AI_Processing_Speed: 2,
        Accuracy: 100,
        qualificationThreshold: 50,
        confidenceThreshold: 50,
        overallScore: 0,
        decision: "Rejected",
        breakdown: {
          skillsMatch: 0,
          experienceMatch: 0,
          educationMatch: 0,
          CertificateMatch: 0,
          Project_Exposure: 0,
          Leadership_Initiative: 0,
          Cultural_Fit: 0,
          Communication_Skills: 0,
          Learning_Ability: 0
        },
        criteria: [{
          criteria: "Resume Validation",
          description: "Verify if resume belongs to the candidate",
          weight: 100,
          score: 0,
          reason: `Resume validation failed: ${validationResult.reason}. Resume contains - Name: ${validationResult.resumeName}, Email: ${validationResult.resumeEmail}, Mobile: ${validationResult.resumeMobile}`
        }],
        acceptReason: [],
        rejectReason: [
          {
            point: "Resume Validation Failed",
            description: validationResult.reason,
            percentage: "0%",
            weight: "Critical",
            impact: "High"
          },
          {
            point: "Identity Mismatch",
            description: `Expected: ${candidate.name} (${candidate.emailId}, ${candidate.mobileNumber}) but resume contains different information`,
            percentage: "0%",
            weight: "Critical",
            impact: "High"
          }
        ],
        recommendation: "Please upload the correct resume that matches your application details",
        improvementSuggestions: [
          "Upload your own resume with correct personal information",
          "Ensure name, email, and mobile number match your application"
        ],
        riskFactors: [
          {
            factor: "Wrong Resume Upload",
            level: "Critical",
            description: "Candidate uploaded resume that doesn't match their application details",
            mitigation: "Require resume re-upload with validation"
          }
        ],
        organizationId: organizationId
      };

      // Update candidate with rejection
      await jobApply.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(candidateId) },
        {
          AI_Screeing_Result: "Rejected",
          AI_Screeing_Status: "Completed",
          AI_Score: 0,
          AI_Confidence: 95,
          lastOrganization: validationResult.resumeName ? "Resume Validation Failed" : ""
        },
        { new: true }
      );

      // Save rejection details
      await CandidateAIScreeningModel.findOneAndUpdate(
        { candidateId },
        rejectionData,
        { new: true, upsert: true }
      );

      return success("AI Screening Rejected due to resume validation failure", rejectionData);
    }

  const aiRule = await AIRole.findOne({ AutomaticScreening: true, orgainizationId: String(organizationId) }).lean();
const screenaiDocs = await screenai.find({ organizationId: organizationId }).lean();

const coreSettings = screenaiDocs[0]?.coreSettings || {};
const qualificationThresholdScore = coreSettings.qualificationThreshold || 50;
const confidenceThresholdScore = coreSettings.confidenceThreshold || 50;

let screeningRules = [];

if (aiRule?.AI_Screening?.length) {
  // Collect all unique categoryIds from all rules
  const categoryIds = aiRule.AI_Screening.flatMap(rule =>
    rule.category?.map(cat => cat.toString()) || []
  );

  // Flatten all criteria across screenaiDocs
  const allCriteria = screenaiDocs.flatMap(doc => doc.screeningCriteria || []);

  // Match relevant criteria
  const matchedCriteria = allCriteria.filter(crit =>
    categoryIds.includes(crit._id.toString())
  );


  if (matchedCriteria.length) {
    screeningRules = aiRule.AI_Screening.map(rule => {
      const matched = rule.category
        .map(catId => matchedCriteria.find(c => c._id.toString() === catId.toString()))
        .filter(Boolean);

      return {
        name: rule.name,
        description: rule.description,
        priority: rule.priority,
        isActive: rule.isActive,
        screeningCriteria: matched.map(item => ({
          name: item.name,
          description: item.description,
          weight: item.weight || 0,
          confidence: item.confidence || 0,
          isActive: item.isActive || false,
        }))
      };
    });
  }
}

// Fallback rule
if (!screeningRules.length) {
  console.warn("No valid AI screening rules found, using default rule");
  screeningRules = [{
    name: "Default Screening Rule",
    description: "Fallback AI rule using internal logic",
    priority: "Medium",
    isActive: true,
    screeningCriteria: [
      {
        name: "Skills",
        description: "Match with required skills from JD",
        weight: 30,
        confidence: 60,
        experience: null,
        isActive: true
      },
      {
        name: "Experience",
        description: "Compare years of experience",
        weight: 30,
        confidence: 50,
        experience: job.experience || null,
        isActive: true
      },
      {
        name: "Education",
        description: "Match educational qualifications",
        weight: 20,
        confidence: 70,
        experience: null,
        isActive: true
      },
      {
        name: "Certifications",
        description: "Check for relevant certifications",
        weight: 10,
        confidence: 50,
        experience: null,
        isActive: true
      },
      {
        name: "Cultural Fit",
        description: "Evaluate based on values and tone",
        weight: 10,
        confidence: 40,
        experience: null,
        isActive: true
      }
    ]
  }];
}


// Filtered flat list for AI prompt
const filteredCriteria = screeningRules.flatMap(rule =>
  (rule.screeningCriteria || [])
    .filter(c => c?.name && c?.weight > 0)  // Only include valid + weighted criteria
    .map(c => ({
      name: c.name.trim(),
      description: c.description || '',
      weight: c.weight,
      confidence: c.confidence || 0,
    }))
);

// 2. Format criteria array as string (score=0, reason="")
const criteriaArrayString = filteredCriteria.map(c =>
  `  { "criteria": "${c.name}", "description": "${c.description}", "weight": ${c.weight}, "score": 0, "reason": "" }`
).join(',\n');

// console.log("Criteria Array String:", criteriaArrayString);

    const prompt = `
You are an intelligent AI screening system.

Analyze the following job and resume information. Provide detailed analysis of:

Each criteria should be scored from 0 to 100.


"criteria": [
${criteriaArrayString}
],

/*
IMPORTANT:
For each object in the "criteria" array:
- Fill in "score" with a number from 0 to 100 indicating how well the candidate met the criterion.
- Fill in "reason" with a specific, clear explanation justifying the score.
- Do not leave "score" or "reason" blank.
- Do not return placeholders — only real data.
- Keep the JSON format exactly the same — any deviation will break the API.
*/


Use the following criteria weights and thresholds:

- Each criterion has a weight (importance percentage) which you must use to calculate a weighted average overall score.
- Qualification threshold: ${qualificationThresholdScore}% — The candidate's qualification score must meet or exceed this value.
- Confidence threshold: ${confidenceThresholdScore}% — The confidence level for the screening should meet or exceed this value.

Calculate the overall AI score as the weighted average of individual criterion scores using the weights provided.

Based on these scores:

- If the overall AI score and qualification score are both above their respective thresholds, the candidate is "Approved".
- Otherwise, the candidate is "Rejected".

For each criterion, provide:

- The score (0-100)
- A detailed explanation supporting the score



From the following resume, extract all organizations the candidate has worked for
Return the response in this JSON format:
{
  "lastOrganization": ["<org1>", "<org2>", ...]
}


Detailed screening rules and their criteria:
${JSON.stringify(filteredCriteria, null, 2)}

Use the following format in JSON:
{
  "skillsMatch": 0,
  "experienceMatch": 0,
  "educationMatch": 0,
  "CertificateMatch": 0,
  "lastOrganization": [],
  "Project_Exposure": 0,
  "Leadership_Initiative": 0,
  "Cultural_Fit": 0,
  "Communication_Skills": 0,
  "Learning_Ability": 0,
  "overallScore": 0,
  "AI_Confidence": "enter confidence score here in number not in string", // confidence score as a number
  "AI_Processing_Speed": 0, // in seconds
  "Accuracy": 0,
  "decision": "Approved" | "Rejected",
  "qualificationThreshold": ${qualificationThresholdScore || 50},
  "confidenceThreshold": ${confidenceThresholdScore || 50},
  
"criteria": [
${criteriaArrayString}
],  --in criteria array in reason also include resume last experience and education and skills and certification and project exposure and leadership initiative and cultural fit and communication skills and learning ability data 

  "acceptReason": [
    {
      "point": "Strong Technical Skills Match",
      "description": "Candidate demonstrates proficiency in required technologies",
      "percentage": "85%",
      "weight": "High"
    }
    // up to 3 more
  ],
  "rejectReason": [
    {
      "point": "Skills Gap in Core Technologies",
      "description": "Missing proficiency in essential technical skills",
      "percentage": "35%",
      "weight": "Critical",
      "impact": "High"
    }
    // up to 4 more
  ],
  "recommendation": "Suggest gaining experience in XYZ",
  "improvementSuggestions": [
    "Gain experience with cloud platforms",
    "Improve leadership skills"
  ],
  "riskFactors": [
    {
      "factor": "Experience Gap", // 
      "level": "Low",
      "description": "Slight gap in experience",
      "mitigation": "Strong skills mitigate this"
    }
  ]
}

--- Job Details ---
Position: ${job.position}
Department: ${department?.name || "N/A"}
Experience Required: ${job.experience}

--- Qualification Required ---
${Qualificationdata?.name || "N/A"}

--- Job Summary ---
${findJd.jobDescription.JobSummary || "N/A"}

--- Roles and Responsibilities ---
${findJd.jobDescription.RolesAndResponsibilities.map((item, idx) => `${idx + 1}. ${item}`).join("\n") || "N/A"}

--- Key Skills ---
${findJd.jobDescription.KeySkills.join(", ") || "N/A"}

--- Resume Content ---
${resume}
`;

    const aiResult = await generateAIScreening(prompt, resume);
    if (!aiResult || aiResult.error) throw new Error("AI screening failed");


        const calculateWeightedScore = (criteria = []) => {
      let totalWeight = 0;
      let weightedSum = 0;

      for (const item of criteria) {
        const weight = Number(item.weight || 0);
        const score = Number(item.score || 0);
        weightedSum += weight * score;
        totalWeight += weight;
      }

      return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    };

    // 🧮 Calculate true weighted score from AI result
    const verifiedOverallScore = calculateWeightedScore(aiResult.criteria);

    const {
      skillsMatch,
      experienceMatch,
      educationMatch,
      lastOrganization,
      CertificateMatch,
      Project_Exposure,
      Leadership_Initiative,
      Cultural_Fit,
      Communication_Skills,
      Learning_Ability,
      overallScore,
      decision,
      criteria,
      acceptReason,
      rejectReason,
      recommendation,
      AI_Confidence,
      AI_Processing_Speed,
      Accuracy,
      qualificationThreshold,
      confidenceThreshold,
      improvementSuggestions,
      riskFactors



    } = aiResult;

        // Upsert AI screening data
    const filter = { candidateId };
      const updateData = {
      jobPostId,
      candidateId,
      position: job.position,
      department: department.name,
      qualification: Qualificationdata.name,
      AI_Confidence,
      AI_Processing_Speed,
      Accuracy,
      qualificationThreshold,
      confidenceThreshold,
      overallScore:verifiedOverallScore,
      decision,
      breakdown: {
        skillsMatch,
        experienceMatch,
        educationMatch,
        CertificateMatch,
        Project_Exposure,
        Leadership_Initiative,
        Cultural_Fit,
        Communication_Skills,
        Learning_Ability
      },
      criteria,
      acceptReason,
      rejectReason,
      recommendation,
      improvementSuggestions,
      riskFactors,
      organizationId: organizationId // Include organizationId for context
    };


    
   const data = await jobApply.findOneAndUpdate(
  { _id: new mongoose.Types.ObjectId(candidateId) }, // correct casting
  {
    AI_Screeing_Result: `${updateData?.decision}`,
    AI_Screeing_Status: "Completed",
    AI_Score:Number(updateData.overallScore),
    AI_Confidence:Number(updateData.AI_Confidence),
    lastOrganization: Array.isArray(lastOrganization) ? lastOrganization : []
  },
  { new: true }
);




        // Upsert operation: update if exists, else create
   const updatedata =  await CandidateAIScreeningModel.findOneAndUpdate(
      filter,
      updateData,
      { new: true, upsert: true }
    );



  } catch (error) {
    console.error("Error in processAIScreeningForCandidate:", error);
    throw error;
  }
};


// 



