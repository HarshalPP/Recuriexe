const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const jobDescriptionModelSchema = new Schema(
  {
    createdById: { type: ObjectId, ref: "employee", default: null }, //employe id
    updatedById: { type: ObjectId, ref: "employee", default: null }, //employe id
    position: { type: String, required: [true, "Position Is Required"] },
    jobDescription: {
      type: String,
      required: [true, "Job description Is Required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },

  { timestamps: true }
);

const jobDescriptionModel = mongoose.model("jobDescription", jobDescriptionModelSchema);

module.exports = jobDescriptionModel;
