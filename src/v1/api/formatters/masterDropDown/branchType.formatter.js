export function formatBranchType(req , employeeId) {
  const { name, status } = req.body;
  return {
    name,
    status: status?.toLowerCase() || "active", // ensure lowercase
    createdBy: employeeId,
  };
}
