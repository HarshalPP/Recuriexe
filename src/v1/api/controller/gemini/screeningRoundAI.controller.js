const { generateAIScreening } = require("../../services/geminiService.js");
const jobpostmodel = require("../../model/hrms/jobPosting.model.js");
const axios = require("axios");
const mongoose = require("mongoose");

async function extractResumeText(resumeUrl) {
  try {
    const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
    const base64Resume = Buffer.from(response.data).toString('base64');
    return base64Resume;
  } catch (error) {
    console.error('Error fetching resume:', error);
    throw new Error('Failed to fetch resume from URL.');
  }
}

// Function to compare skills between the job description and the resume
function compareSkills(jobSkills, resumeSkills) {
  const jobSkillsArray = jobSkills.split(',').map(skill => skill.trim().toLowerCase());
  const resumeSkillsArray = resumeSkills.split(',').map(skill => skill.trim().toLowerCase());
  
  const commonSkills = jobSkillsArray.filter(skill => resumeSkillsArray.includes(skill));
  const skillMatchPercentage = (commonSkills.length / jobSkillsArray.length) * 100;
  return skillMatchPercentage;
}

function compareExperience(jobExperience, resumeExperience) {
  if (resumeExperience >= jobExperience) {
    return 100;
  }
  return (resumeExperience / jobExperience) * 100;
}

function compareEducation(jobEducation, resumeEducation) {
  const educationLevels = ['High School', 'Bachelor’s', 'Master’s', 'PhD'];
  const jobEduIndex = educationLevels.indexOf(jobEducation);
  const resumeEduIndex = educationLevels.indexOf(resumeEducation);

  if (resumeEduIndex >= jobEduIndex) {
    return 100;
  }
  return (resumeEduIndex / jobEduIndex) * 100;
}

async function screenApplicant(jobId, resumeUrl) {
  try {
    const jobpost = await jobpostmodel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(jobId) } },
      {
        $lookup: {
          from: "jobdescriptions",
          localField: "jobDescriptionId",
          foreignField: "_id",
          as: "jobDescription"
        }
      },
      { $unwind: "$jobDescription" },
      {
        $project: {
          "position": 1,
          "eligibility": 1,
          "experience": 1,
          "budget": 1,
          "budgetType": 1,
          "jobDescription.jobDescription": 1
        }
      }
    ]);

    if (!jobpost || jobpost.length === 0) {
      throw new Error("Job description not found.");
    }

    const jobDetails = jobpost[0];

    const resumeBase64 = await extractResumeText(resumeUrl);

    const prompt = `
    You are a job screening AI. Analyze the following Job Description and Applicant Resume.
    Provide a match percentage and determine if the candidate is suitable for the job.
  
    Job Position: ${jobDetails.position}
    Eligibility Requirement: ${jobDetails.eligibility}
    Experience Requirement: ${jobDetails.experience}
    Budget: ${jobDetails.budget} ${jobDetails.budgetType}
    Job Description: ${jobDetails.jobDescription.jobDescription}
  
    Please analyze the following details from the resume:
    - jobSkills: "List the skills required for this job. For example, JavaScript, Python, etc."
    - resumeSkills: "Extract the skills from the applicant's resume."
    - jobExperience: "The minimum experience required for the job in years."
    - resumeExperience: "The experience years of the applicant as listed in the resume."
    - jobEducation: "The minimum education qualification required for the job."
    - resumeEducation: "The education qualification of the applicant as mentioned in the resume."
  
    Please provide a JSON response with the following fields:
    - "isEligible" (true/false): Whether the candidate is eligible based on the match percentage.
    - "matchPercentage" (0-100): The overall match percentage of the resume with the job description.
    - "summary": A brief summary of the analysis, explaining the match for skills, experience, and education.
  
    For example:
    {
      "isEligible": true,
      "matchPercentage": 85,
      "summary": "The candidate's skills match 80% with the job's requirements. The experience is 90% aligned. The education is 100% aligned. Overall, the candidate is highly eligible."
    }
  `;
  
  const geminiResponse = await generateAIScreening(prompt, resumeUrl);
  return geminiResponse;
  } catch (error) {
    console.error("Error in screenApplicant function", error);
    return { error: "Failed to screen applicant." };
  }
}

module.exports = {
  screenApplicant,
};
