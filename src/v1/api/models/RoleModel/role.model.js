import mongoose from "mongoose";

const { Schema } = mongoose;

const roleSchema = new Schema(
  {
    roleName: {
      type: String,
      required: [true, "Role Name is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission"
      }
    ],
    organizationId: { type: Schema.Types.ObjectId, default: null, ref:"Organization" },
    createdBy: { type: Schema.Types.ObjectId, default: null, ref:"employee" },
    updateBy: { type: Schema.Types.ObjectId, default: null, ref:"employee" },

  },
  {
    timestamps: true,
  }
);

const roleModel = mongoose.model("role", roleSchema);

export default roleModel;
