import PermissionModel from "../models/RoleModel/permission.model.js"

export const createPermissionService = async ({ name, description , organizationId  }) => {
  if (!name) throw new Error("Permission name is required");
  if (!organizationId) throw new Error("Organization ID is required");

  const existing = await PermissionModel.findOne({ name, organizationId });
  if (existing) throw new Error("Permission already exists for this organization");

 return await PermissionModel.create({ name, description, organizationId });
};

export const getAllPermissionsService = async (organizationId) => {
  return await PermissionModel.find({organizationId:organizationId}).sort({createdAt:-1})
};

export const deletePermissionService = async (id) => {
  // return await PermissionModel.findByIdAndDelete(id);
};
