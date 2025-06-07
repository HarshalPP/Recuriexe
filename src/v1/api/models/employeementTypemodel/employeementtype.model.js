import mongoose from "mongoose";

const { Schema } = mongoose;

const employmentTypeModelSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    punchOutsideBranch: {
      type: String,
      enum: ["allowed", "notAllowed"],
      required: [true, "Punch Outside Branch is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    description:{
      type:String,
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      default: null,
    },
    
  },
  {
    timestamps: true,
  }
);

const employmentTypeModel = mongoose.model("employmentType", employmentTypeModelSchema);

export default employmentTypeModel;
