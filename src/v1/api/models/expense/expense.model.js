import { Schema, model } from "mongoose";

const approvalLevelSchema = new Schema(
  {
    level: {
      type: String,
      enum: ["L1", "L2", "L3", "R1", "R2", "R3"],
    },
    status: {
      type: String,
      default: "pending",
      enum: ["approved","pending","rejected"]
    },
    date: {
      type: Date,
      // default:""
    },
    remarks: {
      type: String,
    },
  },
  { _id: false }
);

const expensePreferencesSchema = new Schema(
  {
    expenseType: {
      type: Schema.Types.ObjectId,
      ref: "expenesType",
    },
    price: {
      type: Number,
    },
    expenseBillname: {
      type: String,
    },
    image: {
      type: String,
    },
    approverLevel: {
      L1: { type: approvalLevelSchema, default:{} },
      L2: { type: approvalLevelSchema, default:{} },
      L3: { type: approvalLevelSchema, default:{} },
    },

    // Remitter: 3 levels (R1, R2, R3)
    remitterLevel: {
      R1: { type: approvalLevelSchema, default:{} },
      R2: { type: approvalLevelSchema, default:{} },
      R3: { type: approvalLevelSchema, default:{} },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "employee",
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      default: null,
    },
  },

  { timestamps: true }
);

const   expensePreferencessModel = model(
  "expensePreferences",
  expensePreferencesSchema
);
export default expensePreferencessModel;
