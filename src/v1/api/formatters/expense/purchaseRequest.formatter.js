export function purchaseFormatter(data) {
 const {
 autoGenerateNumber: { prefix, startWith },
  customStatuses,
  restrictions: {
    allowCancelOnApprovedOrHold,
    restrictMultipleVendors,
    restrictMultipleCurrencies,
    restrictMultipleTags,
    restrictDifferentCategoryExpenses,
    includeApprovalHistoryInPDF
  },
  approvalPreferences: { allowSelfApproval },
  notifications: {
    onSubmitted,
    onApprovedOrRejected,
    onHold,
    onCancelled,
    onCommentsAdded,
    onStatusChangeToProcessedOrReverted
  },
  chatletPreferences: {
    enableChatlets,
    allowOnlyAdmins
  },
  fields,
  hierarchicalApproval,
  customApproval,
  createdBy = data.user.id
} = data.body;


return {
  autoGenerateNumber: { prefix, startWith },
  customStatuses,
  restrictions: {
    allowCancelOnApprovedOrHold,
    restrictMultipleVendors,
    restrictMultipleCurrencies,
    restrictMultipleTags,
    restrictDifferentCategoryExpenses,
    includeApprovalHistoryInPDF
  },
  approvalPreferences: { allowSelfApproval },
  notifications: {
    onSubmitted,
    onApprovedOrRejected,
    onHold,
    onCancelled,
    onCommentsAdded,
    onStatusChangeToProcessedOrReverted
  },
  chatletPreferences: {
    enableChatlets,
    allowOnlyAdmins
  },
  fields,
  createdBy,
  hierarchicalApproval,
  customApproval
};

}
