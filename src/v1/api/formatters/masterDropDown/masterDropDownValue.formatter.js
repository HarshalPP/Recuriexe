
export function formatDropDownValue(req , employeeId , dropDownId) {
  const { name, status } = req.body;
  return {
    dropDownId:dropDownId,
    name:name.trim().toLowerCase(),
    status: status?.toLowerCase() || "active", // ensure lowercase
    createdBy: employeeId,
  };
}