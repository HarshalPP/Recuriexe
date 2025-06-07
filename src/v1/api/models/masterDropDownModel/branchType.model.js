import mongoose from "mongoose";

const branchTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
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

const branchTypeModel = mongoose.model("branchType", branchTypeSchema);

export default branchTypeModel;
