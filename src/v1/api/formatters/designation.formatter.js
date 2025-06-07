import { randomUUID } from 'node:crypto';

export const designationFormatter = (bodyData , organizationId) => {
  const { name, isActive, createdBy, updatedBy ,departmentId,subDepartmentId } = bodyData;
  return {
    name,
    isActive,
    createdBy,
    updatedBy,
    departmentId,
    subDepartmentId,
    organizationId
  };
};
