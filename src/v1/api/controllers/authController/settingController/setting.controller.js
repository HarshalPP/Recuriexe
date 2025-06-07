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
      const settings = await settingService.getsetting();
      return success(res , "get list" , settings)
    //   res.status(200).json({ success: true, data: settings });
    } catch (error) {
      return UnknownError(res , "Interval server error")
    }
  };



  
  // PATCH /api/settings
  export const updateSettings = async (req, res) => {
    try {
      const updated = await settingService.updateSettings(req.body);
      return success(res , "Update successfully" , updated)
    } catch (error) {
        return UnknownError(res , "Interval server error")
    }
  };


  
// GET /api/settings
export const candidatesettings = async (req, res) => {
    try {
      const settings = await settingService.candidatesetting();
      return success(res , "get list" , settings)
    //   res.status(200).json({ success: true, data: settings });
    } catch (error) {
      return UnknownError(res , "Interval server error")
    }
  };


  
  
  // PATCH /api/settings
  export const updatecandidatesettings = async (req, res) => {
    try {
      const updated = await settingService.updatecandidatesetting(req.body);
      return success(res , "Update successfully" , updated)
    } catch (error) {
      console.log(error)
        return UnknownError(res , "Interval server error")
    }
  };




  // Jobpost //
  export const getJobPostSettings = async (req, res) => {
  try {
    const settings = await settingService.getJobPostSetting();
    return success(res, "Fetched job post settings", settings);
  } catch (error) {
    return UnknownError(res, "Internal server error");
  }
};



// jOB POST //
export const updateJobPostSettings = async (req, res) => {
  try {
    const organizationId = req.employee?.organizationId || null;
    const updated = await settingService.updateJobPostSetting(req.body, organizationId);
    return success(res, "Updated job post settings successfully", updated);
  } catch (error) {
    console.log(error);
    return UnknownError(res, "Internal server error");
  }
};

