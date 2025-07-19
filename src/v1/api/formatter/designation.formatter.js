const { randomUUID } = require("node:crypto");

function designationFormatter(bodyData) {
  const { name, status, createdBy, updatedBy } = bodyData;
  return {
    name, status, createdBy, updatedBy
  };
}

module.exports = {
  designationFormatter,
};
