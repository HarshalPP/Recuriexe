export function tripFormatter(data) {
  const {
    autoGenerateTripNumber: { prefix, startWith },
    associateExpensesWithTripDuration,
    createAdvanceWithTrip,
    restrictReportCreationFor,
    mandateTravelProfile,
    tripAllowance: { autoCreate },
    customStatus,
    submissionPreferences: {
      attachTripAsPdf,
      receiveCopy,
      displayTermsAndConditions,
    },
    approvalPreferences: { allowSelfApproval, receiveApprovalCopy },
    sendNotifications: { onApproved, onSubmitted, onCancelled },
    chatletPreferences: { enabled, allowedFor },
    fields,
    hierarchicalApproval,
    customApproval
  } = data.body;

  return {
    autoGenerateTripNumber: { prefix, startWith },
    associateExpensesWithTripDuration,
    createAdvanceWithTrip,
    restrictReportCreationFor,
    mandateTravelProfile,
    tripAllowance: { autoCreate },
    customStatus,
    submissionPreferences: {
      attachTripAsPdf,
      receiveCopy,
      displayTermsAndConditions,
    },
    approvalPreferences: { allowSelfApproval, receiveApprovalCopy },
    sendNotifications: { onApproved, onSubmitted, onCancelled },
    chatletPreferences: { enabled, allowedFor },
    fields,
    hierarchicalApproval,
    customApproval
  };
}
