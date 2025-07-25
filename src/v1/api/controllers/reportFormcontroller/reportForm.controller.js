import { addForm, updateFormById, deleteFormById, getFormById, getAllForms, getAllFormsByReportType } from "../../helper/reportHelper/reportform.helper.js";
import { badRequest, created, success, unknownError } from "../../helper/response.helper.js";


// -------------------------- create form -------------------------------
export async function saveForm(req, res) {
  try {
    const { status, message, data } = await addForm(req);
    return status ? created(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// -------------------------- update form -------------------------------
export async function updateForm(req, res) {
  try {
    const { status, message, data } = await updateFormById( req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// -------------------------- delete form -------------------------------
export async function deleteForm(req, res) {
  try {
    const { status, message } = await deleteFormById(req.params.id);
    return status ? success(res, message) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// -------------------------- get form by id -------------------------------
export async function getFormByIdHandler(req, res) {
  try {
    const { status, message, data } = await getFormById(req.params.id);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// -------------------------- get all forms -------------------------------
export async function getAllFormsHandler(req, res) {
  try {
    const { status, message, data } = await getAllForms(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// -------------------------- get all by reportType forms -------------------------------
export async function getAllFormsByReportId(req, res) {
  try {
    const { status, message, data } = await getAllFormsByReportType(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

