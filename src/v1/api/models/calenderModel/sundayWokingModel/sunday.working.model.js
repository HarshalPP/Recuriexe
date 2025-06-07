import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const SundayWorkingSchema = new Schema(
  {
    title: { type: String, default: "", trim: true },

    date: {
      type: Date,
      required: true,
      unique: true
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },

    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "employee",
      default: null
    },

    department: [
      {
        departmentId: {
          type: Schema.Types.ObjectId,
          ref: "newdepartment",
          default: null
        }
      }
    ],

    departmentSelection: {
      type: String,
      default: ""
    },

    isWorking: {
      type: Boolean,
      default: false
    },

    reason: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const SundayModel = model("sundayworking", SundayWorkingSchema);
export default SundayModel;
