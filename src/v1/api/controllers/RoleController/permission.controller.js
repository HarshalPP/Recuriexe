import {
  createPermissionService,
  getAllPermissionsService,
  deletePermissionService
} from "../../formatters/PermissionFormatter.js"

import { success, unknownError, badRequest } from "../../formatters/globalResponse.js"

export const createPermission = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      organizationId: req.employee.organizationId // or req.body.organizationId if passed directly
    };

    const permission = await createPermissionService(payload);
    return success(res, "Permission created successfully", permission);
  } catch (err) {
    return badRequest(res, err.message);
  }
};




export const getAllPermissions = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId; // Assuming you have the organization ID from the authenticated user
    if (!organizationId) {
      return badRequest(res, "Organization ID is required");
    }
    const permissions = await getAllPermissionsService(organizationId);
    return success(res, "Permissions fetched successfully", permissions);
  } catch (err) {
    return unknownError(res, "Failed to fetch permissions");
  }
};

export const deletePermission = async (req, res) => {
  try {
    const deleted = await deletePermissionService(req.params.id);
    if (!deleted) return badRequest(res, "Permission not found");
    return success(res, "Permission deleted successfully", deleted);
  } catch (err) {
    return unknownError(res, "Failed to delete permission");
  }
};
