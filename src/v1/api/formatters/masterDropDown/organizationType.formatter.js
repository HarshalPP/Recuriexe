export function formatOrganizationType(req, employeeId) {
  const { name, description, status } = req.body;
  return {
    name: name?.trim(),
    description: description?.trim() || "",
    status: status?.toLowerCase() || "active",
    createdBy: employeeId,
  };
}
