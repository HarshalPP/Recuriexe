import {
  addinitFileds,
  updateinitFiledsById,
  deleteInitFieldsById,
  getInitFieldsById,
  getAllInitFields
} from "../../helper/initFields.helper.js";

import {
  badRequest,
  created,
  notFound,
  success,
  unknownError
} from "../../helper/response.helper.js";

// -------------------------- Create InitFields -------------------------------
export async function saveInitFields(req, res) {
  try {
    const { status, message, data } = await addinitFileds(req);
    return status ? created(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// -------------------------- Update InitFields -------------------------------
export async function updateInitFields(req, res) {
  try {
    const { id } = req.params;
    const { status, message, data } = await updateinitFiledsById( req.body);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// -------------------------- Delete InitFields -------------------------------
export async function deleteInitFields(req, res) {
  try {
    const { id } = req.params;
    const { status, message } = await deleteInitFieldsById(id);
    return status ? success(res, message) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// -------------------------- Get InitFields by ID -------------------------------
export async function getInitFields(req, res) {
  try {
    const { id } = req.params;
    const { status, message, data } = await getInitFieldsById(id);
    return status ? success(res, message, data) : notFound(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// -------------------------- Get All InitFields -------------------------------
export async function getAllInitFieldsController(req, res) {
  try {
    const { status, message, data } = await getAllInitFields(req);
    return status ? success(res, message, data) : notFound(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
