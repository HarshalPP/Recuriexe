import mongoose from "mongoose";

const stageSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    stageName: {
      type: String,
      trim: true,
    },

    usedBy: {
      type: String,
      enum: ["HR", "Candidate"],
      default: "HR",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    sequence: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const StageModel = mongoose.model("Stage", stageSchema);
export default StageModel;
