import { Schema, model } from "mongoose";

const CustomStatusSchema = Schema({
  name: { type: String, required: true },
  considerAs: {
    type: String,
    enum: ["Approved", "Rejected", "Submitted", "Reimbursed"],
    required: true,
  },
});

const reportPreferenceSchema = Schema(
  {
    autoGenerateReportNumber: {
      prefix: { type: String, default: "" },
      startWith: { type: String, default: "00001" },
    },

    reportNameAutomation: { type: Boolean, default: false },
    customStatuses: [CustomStatusSchema],

    submissionPreferences: {
      configureLastDay: { type: Boolean, default: false },
      allowAttachmentAfterSubmission: { type: Boolean, default: false },
      notifyApproverOnSubmit: { type: Boolean, default: true },
      attachPdfInNotification: { type: Boolean, default: false },
      copySubmitterInEmail: { type: Boolean, default: false },
      receiveCopyOfReport: { type: Boolean, default: false },
      displayTermsAndConditions: { type: Boolean, default: false },
    },

    approvalPreferences: {
      mandateEditReason: { type: Boolean, default: false },
      allowReject: { type: Boolean, default: false },
      allowSelfApproval: { type: Boolean, default: false },
      defaultApprovalDurationDays: { type: Number, default: 15 },
      notifyNearDueDate: { type: Boolean, default: false },
      restrictNonApprovers: { type: Boolean, default: false },
      receiveCopyOnApproval: { type: Boolean, default: false },
    },

    notificationPreferences: {
      notifyOnApprovalOrRejection: { type: Boolean, default: true },
      notifyOnReimbursement: { type: Boolean, default: false },
      notifyOnComment: { type: Boolean, default: false },
    },

    chatletPreferences: {
      enableChatlets: { type: Boolean, default: false },
      permissionLevel: {
        adminsAndApprovers: { type: Boolean, default: false },
        allUsers: { type: Boolean, default: false },
      },
    },
    fields: [
      {
        fieldId: { type: Schema.Types.ObjectId, ref: "field", default: null },
        isEnable: { type: Boolean, default: false },
        isMandatory: { type: Boolean, default: false },
        isShowPdf: { type: Boolean, default: false },
      },
    ],
    hierarchicalApproval: { type: Boolean, default: false },
    customApproval: { type: Boolean, default: false },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "employee",
    },
  },

  { timestamps: true }
);

const reportPreferencesModel = model(
  "reportPreferences",
  reportPreferenceSchema
);
export default reportPreferencesModel;
