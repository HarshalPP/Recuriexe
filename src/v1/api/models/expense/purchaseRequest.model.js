import { Schema, model } from "mongoose";

const customStatusSchema = Schema({
  name: String,
  considerAs: {
    type: String,
    enum: ["Approved", "Rejected", "On-hold", "Cancelled"], // extend if needed
  },
});

const purchaseRequestSchema = Schema(
  {
    autoGenerateNumber: {
      prefix: { type: String, required: true },
      startWith: { type: String, required: true },
    },
    customStatuses: [customStatusSchema],
    restrictions: {
      allowCancelOnApprovedOrHold: { type: Boolean, default: false },
      restrictMultipleVendors: { type: Boolean, default: false },
      restrictMultipleCurrencies: { type: Boolean, default: false },
      restrictMultipleTags: { type: Boolean, default: false },
      restrictDifferentCategoryExpenses: { type: Boolean, default: false },
      includeApprovalHistoryInPDF: { type: Boolean, default: false },
    },
    approvalPreferences: {
      allowSelfApproval: { type: Boolean, default: false },
    },
    notifications: {
      onSubmitted: { type: Boolean, default: true },
      onApprovedOrRejected: { type: Boolean, default: true },
      onHold: { type: Boolean, default: true },
      onCancelled: { type: Boolean, default: true },
      onCommentsAdded: { type: Boolean, default: true },
      onStatusChangeToProcessedOrReverted: { type: Boolean, default: false },
    },
    chatletPreferences: {
      enableChatlets: { type: Boolean, default: false },
      allowOnlyAdmins: { type: Boolean, default: true },
    },
    fields: [
      {
        fieldId: { type: Schema.Types.ObjectId, ref: "field", default: null },
        isEnable: { type: Boolean, default: false },
        isMandatory: { type: Boolean, default: false },
        isShowPdf: { type: Boolean, default: false },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "employee",
    },
    hierarchicalApproval: { type: Boolean, default: false },
    customApproval: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const purchaseRequestModel = model("purchaseRequest", purchaseRequestSchema);
export default purchaseRequestModel;

