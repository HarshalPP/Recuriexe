import mongoose, { Schema, model } from "mongoose";

const valueItemSchema = new Schema({
  fieldId: {
    type: mongoose.Types.ObjectId,
    ref: "field", // Replace with actual collection name if different
    default: null,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  }
}, { _id: false }); // _id: false to prevent Mongoose from auto-adding _id to subdocuments

const tripValueSchema = new Schema(
  {
    tripName: {
      type: String,
      default: "",
    },
    value: {
      type: [valueItemSchema],
      default: [],
    },
    employeeId: {
      type: mongoose.Types.ObjectId,
      ref: "employee",
      default: null,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved"]
    },
  },
  { timestamps: true }
);

const tripValueModel = model("tripValue", tripValueSchema);
export default tripValueModel;
