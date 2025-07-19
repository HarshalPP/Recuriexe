const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const designationSchema = new Schema(
  {
    name: { type: String, required: [true, "Designation is required"] },
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

designationSchema.index({ location: "2dsphere" });

const designationModel = mongoose.model("newdesignation", designationSchema);

module.exports = designationModel;
