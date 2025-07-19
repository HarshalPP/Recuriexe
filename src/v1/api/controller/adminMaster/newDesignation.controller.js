const {
  badRequest,
  parseJwt,
  success,
  unknownError,
  unauthorized,
} = require("../../../../../globalHelper/response.globalHelper");

const { returnFormatter } = require("../../formatter/common.formatter");

const {
  addDesignation,
  getAllDesignation,
  getAllInactiveDesignation,
  updateDesignation,
  getDesignationById,
  deactivateDesignation
} = require("../../helper/designation.helper");

//-----------------------Add new branch ------------------------------
async function addDesignationController(req, res) {
  try {
    const { status, message, data } = await addDesignation(req.body);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

//----------------------------get all branch ---------------------------------------

async function getAllDesignationController(req, res) {
  try {
    const { status, message, data } = await getAllDesignation();
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
//----------------------------get all branch ---------------------------------------

async function getAllInactiveDesignationController(req, res) {
  try {
    const { status, message, data } = await getAllInactiveDesignation();
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
//----------------------------get branch by ID ---------------------------------------

async function getDesignationByIdController(req, res) {
  try {
    const { status, message, data } = await getDesignationById(req.params.designationId);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
//-----------------------update new designation ------------------------------
async function updateDesignationController(req, res) {
  try {
    const { status, message, data } = await updateDesignation(req,req.body.Id, req.body);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

//---------------------------deacyive designation---------------------------------------------
async function deactivateDesignationByIdController(req, res) {
  try {
      const { status, message, data } = await deactivateDesignation(req,req.params.designationId);
      return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
      return unknownError(res, error.message);
  }
}

module.exports = {
  addDesignationController,
  getAllDesignationController,
  getAllInactiveDesignationController,
  updateDesignationController,
  getDesignationByIdController,
  deactivateDesignationByIdController
};
