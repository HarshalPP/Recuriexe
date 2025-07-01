import settingService from "../../../services/settingservices/setting.service.js"

import {
    success,
    created,
    notFound,
    badRequest,
    unauthorized,
    forbidden,
    serverValidation,
    unknownError,
    validation,
    alreadyExist,
    sendResponse,
    invalid,
    onError
} from "../../../formatters/globalResponse.js"
import { UnknownError } from "postmark/dist/client/errors/Errors.js";


// GET /api/settings
export const getSettings = async (req, res) => {
    try {
      const organizationId = req.employee?.organizationId
      const settings = await settingService.getsetting(organizationId);
      return success(res , "get list" , settings)
    //   res.status(200).json({ success: true, data: settings });
    } catch (error) {
      return UnknownError(res , "Interval server error")
    }
  };



  
  // PATCH /api/settings
  export const updateSettings = async (req, res) => {
    try {
      const organizationId = req.employee.organizationId
      const updated = await settingService.updateSettings(req.body , organizationId);
      return success(res , "Update successfully" , updated)
    } catch (error) {
        return UnknownError(res , "Interval server error")
    }
  };


  
// GET /api/settings
// GET /api/candidate-settings
export const candidatesettings = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    const settings = await settingService.candidatesetting(organizationId);
    return success(res, "Candidate settings fetched successfully", settings);
  } catch (error) {
    console.error("Error in candidatesettings:", error);
    return UnknownError(res, "Internal server error");
  }
};

// PATCH /api/candidate-settings
export const updatecandidatesettings = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    const updated = await settingService.updatecandidatesetting(req.body, organizationId);
    return success(res, "Candidate settings updated successfully", updated);
  } catch (error) {
    console.error("Error in updatecandidatesettings:", error);
    return UnknownError(res, "Internal server error");
  }
};





  // Jobpost //
 // GET /api/job-post-settings
export const getJobPostSettings = async (req, res) => {
  try {
    const organizationId = req.employee?.organizationId;
    const settings = await settingService.getJobPostSetting(organizationId);
    return success(res, "Fetched job post settings", settings);
  } catch (error) {
    console.error("Error in getJobPostSettings:", error);
    return UnknownError(res, "Internal server error");
  }
};

// PATCH /api/job-post-settings
export const updateJobPostSettings = async (req, res) => {
  try {
    const organizationId = req.employee?.organizationId;
    const updated = await settingService.updateJobPostSetting(req.body, organizationId);
    return success(res, "Updated job post settings successfully", updated);
  } catch (error) {
    console.error("Error in updateJobPostSettings:", error);
    return UnknownError(res, "Internal server error");
  }
};



  // 
 // GET /api/ClientSetting //
export const getClientSettings = async (req, res) => {
  try {
    const organizationId = req.employee?.organizationId;
    const settings = await settingService.getClientSetting(organizationId);
    return success(res, "Fetched job post settings", settings);
  } catch (error) {
    console.error("Error in getJobPostSettings:", error);
    return UnknownError(res, "Internal server error");
  }
};

// PATCH /api/Client_setting //
export const updateClientSettings = async (req, res) => {
  try {
    const organizationId = req.employee?.organizationId;
    const updated = await settingService.updateClientSetting(req.body, organizationId);
    return success(res, "Updated job post settings successfully", updated);
  } catch (error) {
    console.error("Error in updateJobPostSettings:", error);
    return UnknownError(res, "Internal server error");
  }
};


