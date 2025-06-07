import mongoose from "mongoose";

const { Schema } = mongoose;

const permissionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // ensures no duplicate permission names
      trim: true
    },
    
    description: {
      type: String,
      default: "",
    },
    
    organizationId: { type: Schema.Types.ObjectId, default: null, ref:"Organization" },
  },
  {
    timestamps: true,
  }
);

const PermissionModel = mongoose.model("Permission", permissionSchema);

export default PermissionModel;
