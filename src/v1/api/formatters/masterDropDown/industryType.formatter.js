export function formatIndustryType(req , employeeId) {
  const { name, description, status } = req.body;
  return {
    name,
    description,
    status: status?.toLowerCase() || "active", // ensure lowercase
    createdBy: employeeId,
  };
}
