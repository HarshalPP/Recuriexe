import mongoose from "mongoose";

const { Schema } = mongoose;

const costCenterModelSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const costCenterModel = mongoose.model("costCenter", costCenterModelSchema);

export default costCenterModel;
