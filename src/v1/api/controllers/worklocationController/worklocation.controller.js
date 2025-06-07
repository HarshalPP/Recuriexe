import {
    badRequest,
    success,
    unknownError,
    unauthorized,
  } from "../../formatters/globalResponse.js"
  
  
  import {
    addWorkLocation,
    getAllWorkLocation,
    getWorkLocationById,
    getWorkLocationByBranchId,
    updateWorkLocation,
    deactivateWorkLOcation,
    getAllInactiveWorkLocation,
  } from  "../../services/worklocationservices/worklocation.services.js"
  
  // -----------------------Add new work location ------------------------------
  export const addWorkLocationController = async (req, res) => {
    try {
      req.body.organizationId = req.employee.organizationId;
      const { status, message, data } = await addWorkLocation(req.body);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  };
  
  // ----------------------------Get all work locations ---------------------------------------
  export const getAllWorkLocationController = async (req, res) => {
    try {
      const { status, message, data } = await getAllWorkLocation(req);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  };
  
  // ----------------------------Get work location by ID ---------------------------------------
  export const getWorkLocationByIdController = async (req, res) => {
    try {
      const { status, message, data } = await getWorkLocationById(req.params.workLocationId);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  };
  
  // ----------------------------Get work location by Branch ID ---------------------------------------
  export const getWorkLocationByBranchIdController = async (req, res) => {
    try {
      const { status, message, data } = await getWorkLocationByBranchId(req.params.branchId);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  };
  
  // ----------------------------Get all inactive work locations ---------------------------------------
  export const getAllInactiveWorkLocationController = async (req, res) => {
    try {
      const { status, message, data } = await getAllInactiveWorkLocation();
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  };
  
  // -----------------------Update work location ------------------------------
  export const updateWorkLocationController = async (req, res) => {
    try {
      const { status, message, data } = await updateWorkLocation(req, req.body.Id, req.body);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  };
  
  // ---------------------------Deactivate work location ---------------------------------------------
  export const deactivateWorkLocationByIdController = async (req, res) => {
    try {
      const { status, message, data } = await deactivateWorkLOcation(req, req.params.workLocationId);
      return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
      return unknownError(res, error.message);
    }
  };
  


  // ------------------- Update the active and deactive status of work location -------------------
export const toggleWorkLocationStatusController = async (req, res) => {
  try {
    const { workLocationId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return badRequest(res, "isActive must be a boolean.");
    }

    const { status, message, data } = await updateWorkLocation(req, workLocationId, { isActive });
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

