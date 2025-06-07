import { Schema, model } from "mongoose";

const customStatusSchema = new Schema({
  name: { type: String, required: true },
  considerAs: {
    type: String,
    enum: ["Rejected", "Approved", "Closed"], // Extend as needed
    required: true,
  },
});

const tripsPreferencesSchema = new Schema(
  {
    autoGenerateTripNumber: {
      prefix: { type: String, default: "" },
      startWith: { type: String, default: "00001" },
    },

    associateExpensesWithTripDuration: { type: Boolean, default: false },
    createAdvanceWithTrip: { type: Boolean, default: false },
    restrictReportCreationFor: {
      type: [String],
      default: [],
    },

    mandateTravelProfile: { type: Boolean, default: false },

    tripAllowance: {
      autoCreate: { type: String, default: "None" },
    },

    customStatus: [customStatusSchema],

    submissionPreferences: {
      attachTripAsPdf: { type: Boolean, default: false },
      receiveCopy: { type: Boolean, default: false },
      displayTermsAndConditions: { type: Boolean, default: false },
    },

    approvalPreferences: {
      allowSelfApproval: { type: Boolean, default: false },
      receiveApprovalCopy: { type: Boolean, default: false },
    },

    sendNotifications: {
      onApproved: { type: Boolean, default: true },
      onSubmitted: { type: Boolean, default: true },
      onCancelled: { type: Boolean, default: true },
    },

    chatletPreferences: {
      enabled: { type: Boolean, default: false },
      allowedFor: {
        type: String,
        enum: ["AdminsOnly", "AllUsers"],
        default: "AdminsOnly",
      },
    },

    fields: [
     {
      fieldId: { type: Schema.Types.ObjectId, ref: "field", default: null },
      isEnable: { type: Boolean, default: false },
      isMandatory: { type: Boolean, default: false },
      isShowPdf: { type: Boolean, default: false }
    }
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

const TripsPreferencesModel = model("TripsPreferences", tripsPreferencesSchema);
export default TripsPreferencesModel;
