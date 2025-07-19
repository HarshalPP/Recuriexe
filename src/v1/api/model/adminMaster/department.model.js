const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const departmentSchema = new Schema(
  {
    departmentName: {
      type: String,
      required: [true, "Department Name is required"],
    },
    companyId: { type: ObjectId, default: null },
    branchId: { type: ObjectId, default: null },
    workLocationId: { type: ObjectId, default: null },
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

const departmentModel = mongoose.model("department", departmentSchema);

module.exports = departmentModel;
