import { randomUUID } from 'node:crypto';

export const branchFormatter = (bodyData) => {
  let {
    companyId,
    name,
    address,
    city,
    state,
    type,
    regional,
    regionalBranchId,
    pincode,
    location,
    createdBy,
    updatedBy,
    status,
    budget,
    loginFees,
    // punchInTime,
    // punchOutTime,
    vendorList,
    guarantorRequired,
    branchType,
    branchMaping,
    organizationId
  } = bodyData;

  if (regional) {
    regionalBranchId = null;
  }

  return {
    companyId,
    name,
    address,
    city,
    state,
    type,
    regional,
    regionalBranchId,
    pincode,
    location,
    createdBy,
    updatedBy,
    status,
    budget,
    loginFees,
    // punchInTime,
    // punchOutTime,
    vendorList,
    guarantorRequired,
    branchMaping,
    branchType,
    organizationId
  };
};
