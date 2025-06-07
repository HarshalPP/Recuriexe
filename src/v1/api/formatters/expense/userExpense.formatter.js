export function userExpenseFormatter(data) {
  const {
    expenseId,
    minValue,
    maxValue,
    createdBy = data.employee.id,
    organizationId = data.employee.organizationId
  } = data.body;

  return {
    expenseId,
    minValue,
    maxValue,
    createdBy,
    organizationId
  };
}
