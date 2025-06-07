export function formatSectorTypeData(req , employeeId) {
  const { name, description, status, createdBy } = req.body;

  return {
    name: name?.trim()?.toLowerCase(),
    description,
    status,
    createdBy: employeeId,
  };
}
