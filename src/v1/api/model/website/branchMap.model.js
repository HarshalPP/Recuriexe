const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const branchMapSchema = new Schema(
  {
    branchName: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    address: { type: String, default: "" },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const branchMap = mongoose.model("branchMap", branchMapSchema);

module.exports = branchMap;
