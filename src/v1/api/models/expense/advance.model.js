import { Schema, model } from "mongoose";

const customStatusSchema = Schema({
  name: { type: String, required: true },
  considerAs: {
    type: String,
    enum: ["Approved", "Rejected", "Pending"], // Add more statuses if applicable
    required: true,
  },
});

const advancesPreferencesSchema = Schema(
  {
    customStatuses: [customStatusSchema],

    submissionPreferences: {
      notifyApproverEmail: { type: Boolean, default: false },
      displayTermsAndConditions: { type: Boolean, default: false },
    },

    chatletPreferences: {
      enableChatlets: { type: Boolean, default: false },
      permission: {
        type: String,
        enum: ["adminsAndApprovers", "allUsers"],
        default: "adminsAndApprovers",
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "employee",
    },
    noApproval: { type: Boolean, default: false },
    simpleApproval: { type: Boolean, default: false },
    customApproval: { type: Boolean, default: false },

  },
  {
    timestamps: true,
  }
);

const advancesPreferencesModel = model(
  "advancesPreferences",
  advancesPreferencesSchema
);

export default advancesPreferencesModel;
