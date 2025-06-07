import { randomUUID } from "node:crypto";

export const workLocationFormatter = (bodyData) => {
  const { companyId, name, branchId, location, status, createdBy, updatedBy,organizationId,isActive } = bodyData;
  return {
    companyId,
    name,
    branchId,
    isActive,
    location,
    status,
    createdBy,
    updatedBy,
    organizationId
  };
};
