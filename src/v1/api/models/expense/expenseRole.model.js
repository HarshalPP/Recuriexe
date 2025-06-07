import mongoose, { Schema, model } from "mongoose";

const levelSchema = new Schema(
  {
    level: {
      type: String,
      enum: ["L1", "L2", "L3", "R1", "R2", "R3"],
    },
    departmentId: {
      type: [mongoose.Schema.Types.ObjectId],
      default: null,
      ref: "newdepartment",
    },
    // expenseType: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref: "expenesType",
    //   default: null,
    // },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const expenseRoleAssignmentSchema = new Schema(
  {
    fromWhere: {
      type: String,
      enum: ["Department", "Non-Department", "ExpenseType"],
    },

    // department: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref: "newdepartment",
    //   default: null,
    // },

    expenseType: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "expenesType",
        default: null,
      },
    ],

    departmentId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "newdepartment",
        default: null,
      },
    ],

    // designation: {
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref: "newdesignation",
    //   default: null,
    // },

    // submitter:{
    //   type: [String],
    //   // enum: ["L1", ],
    // },

    approverLevel: {
      type: String,
    },

    remitterLevel: {
      type: String,
    },
    // Submitter: only one employeeId
    roleSubmitter: {
      employeeId: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "employee",
        default: null,
      },
      departmentId: [{
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: "newdepartment",
        default: null,
      }],
    },

    // Approver: 3 levels (L1, L2, L3)
    roleApprover: {
      L1: { type: levelSchema },
      L2: { type: levelSchema },
      L3: { type: levelSchema },
    },

    // Remitter: 3 levels (R1, R2, R3)
    roleRemitter: {
      R1: { type: levelSchema },
      R2: { type: levelSchema },
      R3: { type: levelSchema },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee", // optional, if you have an employee model
    },

    isExistRecord: {
      type: Boolean,
      default: false,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      // required: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const expenseRoleAssignmentModel = model(
  "ExpenseRoleAssignment",
  expenseRoleAssignmentSchema
);

export default expenseRoleAssignmentModel;
