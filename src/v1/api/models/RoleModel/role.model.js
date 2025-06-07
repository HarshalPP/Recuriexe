import mongoose from "mongoose";

const { Schema } = mongoose;

import { model } from 'mongoose';

const permissionSchema = new Schema({
  view: {
    type: Boolean,
    default: false
  },
  edit: {
    type: Boolean,
    default: false,
  },
  add: {
    type: Boolean,
    default: false
  },
  delete: {
    type: Boolean,
    default: false
  }
}, { _id: false })
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
    organizationId: { type: Schema.Types.ObjectId, default: null, ref: "Organization" },
    createdBy: { type: Schema.Types.ObjectId, default: null, ref: "employee" },
    updateBy: { type: Schema.Types.ObjectId, default: null, ref: "employee" },
    // EMPLOYEE SETUP MODULES

    organizationSetup: permissionSchema,
    branchSetup: permissionSchema,
    workLocationSetup: permissionSchema,
    departmentTypeSetup: permissionSchema,
    designationSetup: permissionSchema,
    employeeTypeSetup: permissionSchema,
    workModeSetup: permissionSchema,
    roleAssignment: permissionSchema,

    // RECRUITMENT MODULES
    budgetSetup: permissionSchema,
    jobDescriptionSetup: permissionSchema,
    aiSetup: permissionSchema,
    careerPageSetting: permissionSchema,
    qualificationSetup: permissionSchema,
    idSetup: permissionSchema,
    roleSetup: permissionSchema,
    hiringFlowSetup: permissionSchema,
    candidateProfileSetup: permissionSchema,

    // VERIFICATION
    verificationApiSetup: permissionSchema,
    verificationStagesSetup: permissionSchema,

    // TIME & ATTENDANCE
    leaveTypeSetup: permissionSchema,
    holidaySetup: permissionSchema,

    // MASTER DATA SETUP
    costCenterSetup: permissionSchema,
    masterDropdownSetup: permissionSchema,
    mailSwitchSetup: permissionSchema,

    // EXPENSE MANAGEMENT
    expensePoliciesSetup: permissionSchema,
    expenseConfigSetup: permissionSchema,
    expenseCategoriesSetup: permissionSchema,
    expenseTypesSetup: permissionSchema,
    expenseRolePermissionSetup: permissionSchema,

    // ASSET MANAGEMENT
    assetEquipmentSetup: permissionSchema,
    assetCategoriesSetup: permissionSchema,
    assetPermissionsSetup: permissionSchema,

    // VENDOR MANAGEMENT
    vendorRegistrationSetup: permissionSchema,
    industryTypeSetup: permissionSchema,
  },
  {
    timestamps: true,
  }
);

const roleModel = mongoose.model("role", roleSchema);

export default roleModel;
