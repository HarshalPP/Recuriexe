export function policyValueFormatter(data) {
  const {
    name,
    description,
    policyAdmins,
    allowUncategorizedExpenses,
    tripSubmissionWindow,
    submissionDaysBeforeTravel,
    surchargeOnForeignExpenses,
    surchargePercentage,
    status,
    createdBy = data.employee.id,
    organizationId = data.employee.organizationId
  } = data.body;

  return {
    name,
    description,
    policyAdmins,
    allowUncategorizedExpenses,
    tripSubmissionWindow,
    submissionDaysBeforeTravel,
    surchargeOnForeignExpenses,
    surchargePercentage,
    status,
    createdBy,
    organizationId
  };
}
