import {
  addBranchType,
  getBranchTypeList,
  getBranchTypeById,
  updateBranchTypeById,
  branchTypeDropdown,
  activeAndInactiveBranchTypeById,
  adddataOnModel,
} from "../../helper/masterDropDown/branchType.helper.js";

import { created, success, badRequest, unknownError } from "../../formatters/globalResponse.js";

export async function createBranchType(req, res) {
  try {
    const { status, message, data } = await addBranchType(req);
    return status ? created(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function listBranchTypes(req, res) {
  try {
    const { status, message, data } = await getBranchTypeList(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function getBranchType(req, res) {
  try {
    const { status, message, data } = await getBranchTypeById(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function updateBranchType(req, res) {
  try {
    const { status, message, data } = await updateBranchTypeById(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}


export async function activeAndInactiveBranchType(req, res) {
  try {
    const { status, message, data } = await activeAndInactiveBranchTypeById(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function dropdownBranchType(req, res) {
  try {
    const { status, message, data } = await branchTypeDropdown();
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}


export async function dataAddOnModel(req, res) {
  try {
    const { status, message, data } = await adddataOnModel(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
