import {
  success,
  badRequest,
  notFound,
  unknownError,
} from "../../formatters/globalResponse.js";
import jobPostModel from "../../models/jobformModel/jobform.model.js"
import designationModel from "../../models/designationModel/designation.model.js";
import aiModel from "../../models/AiModel/ai.model.js";
import jobApply from "../../models/jobformModel/jobform.model.js";
import { screenApplicant } from "../../services/screeningAI/screeningAi.services.js"


import AIConfigModel from "../../models/AiModel/ai.model.js"


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
       id ,
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
      path:"organizationId",
      select:'name'
    })
    .sort({createdAt:-1})

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


    if (!jobPostId || !resume ) {
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


    const aiScreeningEnabled =
      jobPost?.AI_Screening === "true";
    const requiredPercentage = Math.max(
      jobPost?.AI_Percentage || 0
    );

    const aiConfig = await aiModel.findOne({
      title: "AI Screening",
      enableAIResumeParsing: true,
    });


    if (!aiScreeningEnabled) {
      return badRequest(res, "AI screening is not enabled for this job post.");
    }

    if (!aiConfig) {
      return badRequest(res, "AI screening is enabled but configuration is missing.");
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



