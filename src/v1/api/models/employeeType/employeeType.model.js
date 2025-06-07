import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema;

const employeeTypeModelSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    description:{
      type:String
    },

    organizationId: {
      type: ObjectId,
      ref: "organization",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const employeeTypeModel = mongoose.model("employeeType", employeeTypeModelSchema);

export default employeeTypeModel;
