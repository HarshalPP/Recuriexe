import mongoose from "mongoose";

const masterDropDownSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      // required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive","alwaysActive"],
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

const masterDropDownModel = mongoose.model("dropDown", masterDropDownSchema);

export default masterDropDownModel;
