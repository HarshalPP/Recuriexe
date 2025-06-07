import {
  addDropDown,
  getDropDownList,
  getDropDownById,
  updateDropDownById,
  activeAndInactiveDropDownById,
  createsubDropDown,
  subDropDownUpdate,
  nameBySubDropDownGet,
  detailSubDropDown,
  activeAndInactiveSubDropDownById,
} from "../../helper/masterDropDown/masterDropDown.helper.js";

import { created, success, badRequest, unknownError } from "../../formatters/globalResponse.js";

export async function addNewDropDown(req, res) {
  try {
    const { status, message, data } = await addDropDown(req);
    return status ? created(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}


export async function listDropDown(req, res) {
  try {
    const { status, message, data } = await getDropDownList(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function getDropDown(req, res) {
  try {
    const { status, message, data } = await getDropDownById(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function updateDropDown(req, res) {
  try {
    const { status, message, data } = await updateDropDownById(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}


export async function activeAndInactiveDropDown(req, res) {
  try {
    const { status, message, data } = await activeAndInactiveDropDownById(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function addsubDropDown(req, res) {
  try {
    const { status, message, data } = await createsubDropDown(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function updateSubDropDown(req, res) {
  try {
    const { status, message, data } = await subDropDownUpdate(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function subDropDownGet(req, res) {
  try {
    const { status, message, data } = await nameBySubDropDownGet(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function subDropDownDetail(req, res) {
  try {
    const { status, message, data } = await detailSubDropDown(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function activeAndInactiveSubDropDown(req, res) {
  try {
    const { status, message, data } = await activeAndInactiveSubDropDownById(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
