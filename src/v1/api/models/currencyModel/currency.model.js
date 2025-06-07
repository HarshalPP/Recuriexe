import mongoose from "mongoose";

const currencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Currency name is required"],
      trim: true,
    },
    icon: {
      type: String,
      default: "", // e.g., ₹, $, €, or even image URL if needed
      required: [true, "Currency icon is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    }
  },
  {
    timestamps: true,
  }
);

const currencyModel = mongoose.model("currency", currencySchema);
export default currencyModel;
