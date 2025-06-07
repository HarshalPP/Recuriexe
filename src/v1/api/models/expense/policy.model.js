import mongoose, { Schema, model } from "mongoose";

const policySettingsSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: {
      type: String,
      maxlength: 250,
      trim: true,
    },
    policyAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee", // Assuming you have a User model for admins
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee", // Assuming you have a User model for admins
    },
    allowUncategorizedExpenses: {
      type: Boolean,
      default: false,
    },
    tripSubmissionWindow: {
      type: Boolean,
      default: false,
    },
    submissionDaysBeforeTravel: {
      type: Number,
      default: null,
    },
    travelPolicyFile: {
      type: String, // Store file name or file URL
      default: "",
    },
    surchargeOnForeignExpenses: {
      type: Boolean,
      default: false,
    },
    surchargePercentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "active",
      enum:["active","inactive"]
    },
      organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        // required: true,
        default: null,
    },
  },
  {
    timestamps: true,
  }
);

const policySettingModel = model("policySettings", policySettingsSchema);
export default policySettingModel;
