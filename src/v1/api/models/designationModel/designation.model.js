import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema;

const designationSchema = new Schema(
  {
    name: { type: String, required: [true, "Designation is required"] },

    departmentId: {
      type: ObjectId,
      ref: "newdepartment",
      default:null
    },

    subDepartmentId: {
      type: ObjectId,
      ref: "newdepartment",
      default: null,
    },

    organizationId: {
      type: ObjectId,
      ref: "organization",
      default: null,
    },
    
    createdBy: { type: ObjectId, ref: "employee" },
    updatedBy: { type: ObjectId, ref: "employee", default: null },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["aproove", "pending", "reject"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Note: Only include this if there's actually a `location` field in the schema
// Otherwise, it will throw an error
// designationSchema.index({ location: "2dsphere" });

const designationModel = mongoose.model("newdesignation", designationSchema);

export default designationModel;
