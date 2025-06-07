export function advanceFormatter(data) {
 const {
   customStatuses,
  submissionPreferences: {
    notifyApproverEmail,
    displayTermsAndConditions
  },
  chatletPreferences: {
    enableChatlets,
    permission
  },
  noApproval,
  simpleApproval,
  customApproval,
  fields = [],
  createdBy = data.user.id
} = data.body;

return {
  customStatuses,
  submissionPreferences: {
    notifyApproverEmail,
    displayTermsAndConditions
  },
  chatletPreferences: {
    enableChatlets,
    permission
  },
    noApproval,
  simpleApproval,
  customApproval,
  fields,
  createdBy
}
}
