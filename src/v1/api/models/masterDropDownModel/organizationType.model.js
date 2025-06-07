import mongoose from "mongoose";

const organizationTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'employee',
      default: null
    },
  },
  {
    timestamps: true,
  }
);

const OrganizationType = mongoose.model("organizationType", organizationTypeSchema);

export default OrganizationType;
