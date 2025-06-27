import mongoose from "mongoose";
const { Schema, model } = mongoose;

const organizationAIPlanSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
    },

    aiPlanId: {
      type: Schema.Types.ObjectId,
      ref: "AICreditPlan",
      required: [true, "AI Plan ID is required"],
    },

    planName: {
      type: String,
      trim: true,
    },

    planDescription: {
      type: String,
      default: "",
    },

    totalCredits: {
      type: Number,
      required: true,
      default: 0,
    },

    usedCredits: {
      type: Number,
      default: 0,
    },

    remainingCredits: {
      type: Number,
      default: 0,
    },

    pricePerCredit: {
      type: Number,
      default: 0,
    },

    totalPrice: {
      type: Number,
      default: 0,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);

organizationAIPlanSchema.pre("save", function (next) {
  if (!this.endDate && this.startDate && this.durationInDays) {
    this.endDate = new Date(this.startDate);
    this.endDate.setDate(this.endDate.getDate() + this.durationInDays);
  }

  // Auto-update remaining credits
  this.remainingCredits = Math.max(this.totalCredits - this.usedCredits, 0);

  next();
});

const OrganizationAIPlanModel = model("OrganizationAIPlan", organizationAIPlanSchema);

export default OrganizationAIPlanModel;