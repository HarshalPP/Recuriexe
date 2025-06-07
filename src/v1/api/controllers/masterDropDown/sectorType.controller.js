import {
  createSectorType,
  getSectorTypeDetail,
  getAllSectorTypes,
  updateSectorType,
  sectorTypeDropdown,
  activeAndInactiveSectorTypeById,
} from "../../helper/masterDropDown/sectorType.helper.js";
import { created, success, badRequest, unknownError } from "../../formatters/globalResponse.js";

export async function addSectorType(req, res) {
  try {
    const { status, message, data } = await createSectorType(req);
    return status ? created(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function getSectorTypeById(req, res) {
  try {
    const { status, message, data } = await getSectorTypeDetail(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function getSectorTypeList(req, res) {
  try {
    const { status, message, data } = await getAllSectorTypes(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

export async function updateSectorTypeById(req, res) {
  try {
    const { status, message, data } = await updateSectorType(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}



export async function dropdownSectorType(req, res) {
  try {
    const { status, message, data } = await sectorTypeDropdown();
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (err) {
    return unknownError(res, err.message);
  }
}


export async function activeAndInactiveSectorType(req, res) {
  try {
    const { status, message, data } = await activeAndInactiveSectorTypeById(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}