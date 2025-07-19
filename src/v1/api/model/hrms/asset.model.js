const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const assetSchema = new Schema(
  {
    assetId: { type: String, default: "" },
    assetName: { type: String, default: "" },
    modelNumber: { type: String, default: "" },
    employeeAssignedId: { type: ObjectId, ref: "employee", default: null }, //employe id for reference
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const assets = mongoose.model("oldassets", assetSchema);

module.exports = assets;
