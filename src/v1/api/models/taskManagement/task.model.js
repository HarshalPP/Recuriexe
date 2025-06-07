import mongoose from "mongoose";

const { Schema, model } = mongoose;
const { ObjectId } = Schema;

const taskModelSchema = new Schema(
  {
    employeeId:   { type: ObjectId, default: null },
    assignBy:     { type: ObjectId, default: null },
    groupId:      { type: String, default: null },
    task:         { type: String, default: null },
    title:        { type: String, default: "" },
    description:  { type: String, default: "" },
    startDate:    { type: String, default: "" },
    endDate:      { type: String, default: "" },
    dueDate:      { type: String, default: "" },
    priority:     { type: String, enum: ["Low", "Medium", "High"], default: "Medium"},
    status: {
      type: String,
      enum: ["pending", "WIP", "processing", "overDue", "completed"],
      default: "pending",
    },
    redirectUrl: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const taskModel = model("task", taskModelSchema);
export default taskModel;
