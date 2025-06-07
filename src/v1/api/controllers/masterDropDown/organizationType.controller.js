import {
  addOrganizationType,
  getOrganizationTypeList,
  getOrganizationTypeById,
  updateOrganizationType,
  organizationTypeDropdown,
  activeAndInactiveOrganizationTypeById,
} from "../../helper/masterDropDown/organizationType.helper.js";

import { created, success, badRequest, unknownError } from "../../formatters/globalResponse.js";

export async function createOrganizationType(req, res) {
  try {
    const { status, message, data } = await addOrganizationType(req);
    return status ? created(res, message, data) : badRequest(res, message);
  } catch (err) {
    return unknownError(res, err.message);
  }
}

export async function listOrganizationTypes(req, res) {
  try {
    const { status, message, data } = await getOrganizationTypeList(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (err) {
    return unknownError(res, err.message);
  }
}

export async function getOrganizationType(req, res) {
  try {
    const { status, message, data } = await getOrganizationTypeById(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (err) {
    return unknownError(res, err.message);
  }
}

export async function updateOrganizationTypeById(req, res) {
  try {
    const { status, message, data } = await updateOrganizationType(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (err) {
    return unknownError(res, err.message);
  }
}

export async function dropdownOrganizationType(req, res) {
  try {
    const { status, message, data } = await organizationTypeDropdown();
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (err) {
    return unknownError(res, err.message);
  }
}


export async function activeAndInactiveOrganizationType(req, res) {
  try {
    const { status, message, data } = await activeAndInactiveOrganizationTypeById(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}