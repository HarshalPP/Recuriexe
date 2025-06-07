export function expenseRoleFormatter(data) {
  const {
    roleSubmitter,
    roleApprover,
    roleRemitter,
    expenseType,
    createdBy = data.employee.id,
    organizationId = data.employee.organizationId,
    isExistRecord = true,
    departmentId
  } = data.body;

  return {
    roleSubmitter,
    roleApprover,
    roleRemitter,
    expenseType,
    createdBy,
    organizationId,
    isExistRecord,
    departmentId
  };
}
