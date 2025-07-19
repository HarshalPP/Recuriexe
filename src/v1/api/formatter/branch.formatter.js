const { randomUUID } = require("node:crypto");

function branchFormatter(bodyData) {
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
    punchInTime,
    punchOutTime,
    vendorList,
    guarantorRequired
  } = bodyData;
  if (regional) {
    regionalBranchId = null
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
    punchInTime,
    punchOutTime,
    vendorList,
    guarantorRequired
  };
}

module.exports = {
  branchFormatter,
};
