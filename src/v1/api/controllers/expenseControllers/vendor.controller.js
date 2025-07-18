import {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendorData,
  deleteVendorData
} from "../../helper/expenseHelper/vendor.helper.js";

import {
  success,
  created,
  badRequest,
  notFound,
  unknownError
} from "../../helper/response.helper.js";

// Create new Vendor
export async function createNewVendor(req, res) {
  try {
    const token = req.employee;
    const { status, message, data } = await createVendor(req.body, token.organizationId, token.Id);
    return status ? created(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// Get all Vendors with pagination
export async function getVendors(req, res) {
  try {
    const token = req.employee;
    const { page = 1, limit = 10 } = req.query;
    const { status, message, data } = await getAllVendors(token.organizationId, { page, limit });
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// Get single Vendor by ID
export async function getVendor(req, res) {
  try {
    const token = req.employee;
    const { status, message, data } = await getVendorById(req.params.id, token.organizationId);
    return status ? success(res, message, data) : notFound(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// Update Vendor
export async function updateVendor(req, res) {
  try {
    const token = req.employee;
    const { status, message, data } = await updateVendorData(
      req.params.id,
      req.body,
      token.organizationId,
      token.Id
    );
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// Delete Vendor (Soft delete)
export async function deleteVendor(req, res) {
  try {
    const token = req.employee;
    const { status, message } = await deleteVendorData(req.params.id, token.organizationId, token.Id);
    return status ? success(res, message) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
