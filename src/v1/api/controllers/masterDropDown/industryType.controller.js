import {
  addIndustryType,
  getIndustryTypeList,
  getIndustryTypeById,
  updateIndustryTypeById,
  industryTypeDropdown,
  activeAndInactiveIndustryTypeById,
} from "../../helper/masterDropDown/industryType.helper.js";

import { created, success, badRequest, unknownError } from "../../formatters/globalResponse.js";

export async function createIndustryType(req, res) {
  try {
    const { status, message, data } = await addIndustryType(req);
    return status ? created(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function listIndustryTypes(req, res) {
  try {
    const { status, message, data } = await getIndustryTypeList(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function getIndustryType(req, res) {
  try {
    const { status, message, data } = await getIndustryTypeById(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function updateIndustryType(req, res) {
  try {
    const { status, message, data } = await updateIndustryTypeById(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function dropdownIndustryType(req, res) {
  try {
    const { status, message, data } = await industryTypeDropdown();
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function activeAndInactiveIndustryType(req, res) {
  try {
    const { status, message, data } = await activeAndInactiveIndustryTypeById(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}