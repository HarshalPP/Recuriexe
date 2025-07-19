const { randomUUID } = require("node:crypto");

function workLocationFormatter(bodyData) {
  const { companyId, name, branchId, location, status ,createdBy, updatedBy} = bodyData;
  return {
    companyId,
    name,
    branchId,
    location,
    status,
    createdBy,
    updatedBy
  };
}

module.exports = {
  workLocationFormatter,
};
