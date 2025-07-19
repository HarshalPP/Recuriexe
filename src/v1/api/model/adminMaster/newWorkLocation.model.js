const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const workLocationSchema = new Schema(
  {
    name: { type: String, required: [true, "work location is required"] },
    branchId: {
      type: ObjectId,
      ref: "newbranch",
      required: [true, "Branch is required"],
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    createdBy: { type: ObjectId, ref: "employee" },
    updatedBy: { type: ObjectId, ref: "employee", default: null  },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ["aproove", "pending","reject"],
        default: "pending",
    },
  },

  { timestamps: true }
);

workLocationSchema.index({ location: "2dsphere" });

const workLocationModel = mongoose.model("newworklocation", workLocationSchema);

module.exports = workLocationModel;
