const {
  badRequest,
  parseJwt,
  success,
  unknownError,
  unauthorized,
} = require("../../../../../globalHelper/response.globalHelper");

const { returnFormatter } = require("../../formatter/common.formatter");

const {
  addWorkLocation,
  getAllWorkLocation,
  getWorkLocationById,
  getWorkLocationByBranchId,
  updateWorkLocation,
  deactivateWorkLOcation,
  getAllInactiveWorkLocation
} = require("../../helper/workLocation.helper");

//-----------------------Add new work location ------------------------------
async function addWorkLocationController(req, res) {
  try {
    const { status, message, data } = await addWorkLocation(req.body);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

//----------------------------get all work location ---------------------------------------

async function getAllWorkLocationController(req, res) {
  try {
    const { status, message, data } = await getAllWorkLocation();
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
//----------------------------get by id  work location ---------------------------------------

async function getWorkLocationByIdController(req, res) {
  try {
    const { status, message, data } = await getWorkLocationById(
      req.params.workLocationId
    );
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
//----------------------------get by id  work location ---------------------------------------

async function getWorkLocationByBranchIdController(req, res) {
  try {
    const { status, message, data } = await getWorkLocationByBranchId(
      req.params.branchId
    );
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
//----------------------------get all branch ---------------------------------------

async function getAllInactiveWorkLocationController(req, res) {
  try {
    const { status, message, data } = await getAllInactiveWorkLocation();
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
//-----------------------update new designation ------------------------------
async function updateWorkLocationController(req, res) {
  try {
    const { status, message, data } = await updateWorkLocation(req,req.body.Id, req.body);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

//---------------------------deacyive designation---------------------------------------------
async function deactivateWorkLocationByIdController(req, res) {
  try {
      const { status, message, data } = await deactivateWorkLOcation(req,req.params.workLocationId);
      return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
      return unknownError(res, error.message);
  }
}
module.exports = {
  addWorkLocationController,
  getAllWorkLocationController,
  getWorkLocationByIdController,
  getWorkLocationByBranchIdController,
  updateWorkLocationController,
  deactivateWorkLocationByIdController,
  getAllInactiveWorkLocationController
};
