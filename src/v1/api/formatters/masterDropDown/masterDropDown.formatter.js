export function formatDropDown(req , employeeId , organizationId) {
  const { name, status  } = req.body;
  return {
    name:name.trim().toLowerCase(),
    organizationId ,
    status: status?.toLowerCase() || "active", // ensure lowercase
    createdBy: employeeId,
  };
}
