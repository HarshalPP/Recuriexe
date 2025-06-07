import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = Schema;

const subDepartmentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Sub-department name is required"],
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
);

const newDepartmentModelSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true
    },
    isSubDepartment:{
      type:Boolean,
      enum:[true,false],
      default:false
    },
    subDepartments: [subDepartmentSchema],
    isActive: {
      type: Boolean,
      default: true
    },
    organizationId: {
      type: ObjectId,
      ref: 'Organization',
      default: null
    },
    createdBy:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'employee'
    }
  },
  { timestamps: true }
);

const newDepartmentModel = mongoose.model("newdepartment", newDepartmentModelSchema);

export default newDepartmentModel;
