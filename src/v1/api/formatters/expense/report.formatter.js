export function reportFormatter(data) {
  const {
    autoGenerateReportNumber: { prefix, startWith },
    reportNameAutomation,
    customStatuses, // array of { name, considerAs }

    submissionPreferences: {
      configureLastDay,
      allowAttachmentAfterSubmission,
      notifyApproverOnSubmit,
      attachPdfInNotification,
      copySubmitterInEmail,
      receiveCopyOfReport,
      displayTermsAndConditions,
    },

    approvalPreferences: {
      mandateEditReason,
      allowReject,
      allowSelfApproval,
      defaultApprovalDurationDays,
      notifyNearDueDate,
      restrictNonApprovers,
      receiveCopyOnApproval,
    },

    notificationPreferences: {
      notifyOnApprovalOrRejection,
      notifyOnReimbursement,
      notifyOnComment,
    },

    chatletPreferences: {
      enableChatlets,
      permissionLevel: { adminsAndApprovers, allUsers },
    },

    hierarchicalApproval,
    customApproval,
    fields = [],
 createdBy = data.user.id
  } = data.body;

  return {
    autoGenerateReportNumber: { prefix, startWith },
    reportNameAutomation,
    customStatuses, // array of { name, considerAs }

    submissionPreferences: {
      configureLastDay,
      allowAttachmentAfterSubmission,
      notifyApproverOnSubmit,
      attachPdfInNotification,
      copySubmitterInEmail,
      receiveCopyOfReport,
      displayTermsAndConditions,
    },

    approvalPreferences: {
      mandateEditReason,
      allowReject,
      allowSelfApproval,
      defaultApprovalDurationDays,
      notifyNearDueDate,
      restrictNonApprovers,
      receiveCopyOnApproval,
    },

    notificationPreferences: {
      notifyOnApprovalOrRejection,
      notifyOnReimbursement,
      notifyOnComment,
    },

    chatletPreferences: {
      enableChatlets,
      permissionLevel: { adminsAndApprovers, allUsers },
    },
fields,
    hierarchicalApproval,
    customApproval,
    createdBy,
  };
}
