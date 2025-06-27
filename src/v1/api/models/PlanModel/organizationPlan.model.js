import mongoose from "mongoose";
const { Schema, model } = mongoose;

const planSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
    },

    planName: {
      type: String,
      required: [true, "Plan Name is required"],
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: false,
      default: null,
    },
    planDescription: {
      type: String,
      default: "",
    },
    planPrice: {
      type: Number,
    },
    planDurationInDays: {
      type: Number,
    },
    planCreditLimit: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Carrere page setUp //

    NumberOfJobPosts: {
      type: Number,
      default: 0,
    },

    NumberOfUsers: {
      type: Number,
      default: 0,
    },

    NumberofAnalizers: {
      type: Number,
      default: 0,
    },
    addNumberOfAnalizers: {
      type: Number,
      default: 0,
    },
    Numberofdownloads: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const PlanModel = model("organizationPlan", planSchema);
export default PlanModel;
