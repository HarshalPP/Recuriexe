import * as PortalService from "../../formatters/setUp/portalsetup.formatter.js"
import { success, unknownError, serverValidation, badRequest } from "../../formatters/globalResponse.js"


// create Portal //

export const createPortal = async (req, res) => {
  try {
    const organizationId = req.employee?.organizationId;
    const employeeId = req.employee?.id;

    if (!organizationId) {
      return badRequest(res, "Organization ID is required");
    }

    const result = await PortalService.createPortalService({
      ...req.body,
      organizationId,
      createdBy: employeeId,
    });

    return success(res, "Portal created successfully", result);
  } catch (error) {
    return unknownError(res, "Internal server error");
  }
};


export const getAllPortals = async (req, res) => {
  try {
    const organizationId = req.query.organizationId;
    console.log("organizationId---", organizationId);

    // if (!organizationId) {
    //   return badRequest(res, "Organization ID is required");
    // }

    // const result = await PortalService.getAllPortalsService(organizationId);
    
    const result = await PortalService.getAllPortalsService(organizationId);
    return success(res, "Retrieved data successfully", result);
  } catch (error) {
    return unknownError(res, "Internal server error");
  }
};


export const getPortalDetail = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;
    const result = await PortalService.getAllPortalsService(organizationId);
    return success(res, "Retrieved data successfully", result);
  } catch (error) {
    return unknownError(res, "Internal server error");
  }
};


export const getAll = async (req, res) => {
  try {
    const organizationId = req.employee?.organizationId;

    // if (!organizationId) {
    //   return badRequest(res, "Organization ID is required");
    // }

    const result = await PortalService.getAllPortalsService();

    // Remove 'linkedin' and 'google' fields from each document
    const sanitizedResult = result.map(portal => {
      const { linkedin, google, ...rest } = portal.toObject();
      return rest;
    });

    return success(res, "Retrieved data successfully", sanitizedResult);
  } catch (error) {
    console.error("Error in getAll:", error);
    return unknownError(res, "Internal server error");
  }
};



export const getPortalById = async (req, res) => {
  try {
    const result = await PortalService.getPortalByIdService(req.params.id);
    if(!result){
        return badRequest(res , "data not found")
    }
    return success(res , "find data" , result)
  } catch (error) {
    return unknownError(res , "Internal server error");
  }
};

export const updatePortal = async (req, res) => {
  try {
    const result = await PortalService.updatePortalService(req.params.id, req.body);
    if(!result){
        return badRequest(res , "Not Updated")
    }

    return success(res , "Updated successfully" , result)
  } catch (error) {
    return unknownError(res , "Internal server error");
  }
};

export const deletePortal = async (req, res) => {
  try {
    const result = await PortalService.deletePortalService(req.params.id);
    if (!result) {
        return badRequest(res , "data not found")
    }

    return success(res , "portal delete successfully")
  } catch (error) {
   return unknownError(res , "Internal server error");
  }
};
