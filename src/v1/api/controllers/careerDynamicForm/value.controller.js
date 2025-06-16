import { 
  addValue, 
  updateValueById, 
  deleteValueById, 
  getValueById, 
  getAllValues, 
  updateValueStatusById,
  getAllDashboard
} from "../../helper/formValue.helper.js";
import { badRequest, created, success, unknownError } from "../../helper/response.helper.js";

// -------------------------- create value -------------------------------
export async function saveValue(req, res) {
  try {
    const { status, message, data } = await addValue(req);
    return status ? created(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// -------------------------- update value -------------------------------
export async function updateValue(req, res) {
  try {
    const { status, message, data } = await updateValueById(req.body.id, req.body);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// -------------------------- update status value -------------------------------
export async function updateStatusValue(req, res) {
  try {
    const { status, message, data } = await updateValueStatusById(req.body.id, req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// -------------------------- delete value -------------------------------
export async function deleteValue(req, res) {
  try {
    const { status, message } = await deleteValueById(req.params.id);
    return status ? success(res, message) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// -------------------------- get value by id -------------------------------
export async function getValueByIdHandler(req, res) {
  try {
    const { status, message, data } = await getValueById(req.params.id);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// -------------------------- get all values -------------------------------
export async function getAllValuesHandler(req, res) {
  try {
    const { status, message, data } = await getAllValues(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}


// -------------------------- get all count -------------------------------
export async function dashbordCount(req, res) {
  try {
    const { status, message, data } = await getAllDashboard(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
