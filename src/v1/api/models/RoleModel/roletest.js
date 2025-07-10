// import mongoose from "mongoose";

// const { Schema } = mongoose;

// import { model } from 'mongoose';

// const permissionSchema = new Schema({
//   view: {
//     type: Boolean,
//     default: false
//   },
//   edit: {
//     type: Boolean,
//     default: false,
//   },
//   add: {
//     type: Boolean,
//     default: false
//   },
//   delete: {
//     type: Boolean,
//     default: false
//   }
// }, { _id: false })



// const roleSchema = new Schema(
//   {
//     roleName: {
//       type: String,
//       required: [true, "Role Name is required"],
//     },
//     status: {
//       type: String,
//       enum: ["active", "inactive"],
//       default: "active",
//     },
//     permissions: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "Permission"
//       }
//     ],
//     organizationId: { type: Schema.Types.ObjectId, default: null, ref: "Organization" },
//     createdBy: { type: Schema.Types.ObjectId, default: null, ref: "employee" },
//     updateBy: { type: Schema.Types.ObjectId, default: null, ref: "employee" },
//     // EMPLOYEE SETUP MODULES

//     organizationSetup: {
//       type: Boolean,
//       default: false
//     },
//     branchSetup: {
//       type: Boolean,
//       default: false
//     },
//     workLocationSetup: {
//       type: Boolean,
//       default: false
//     },
//     departmentTypeSetup: {
//       type: Boolean,
//       default: false
//     },
//     designationSetup: {
//       type: Boolean,
//       default: false
//     },
//     employeeTypeSetup: {
//       type: Boolean,
//       default: false
//     },
//     workModeSetup: {
//       type: Boolean,
//       default: false
//     },
//     roleAssignment: {
//       type: Boolean,
//       default: false
//     },

//     // RECRUITMENT MODULES
//     budgetSetup: {
//       type: Boolean,
//       default: false
//     },
//     jobDescriptionSetup: {
//       type: Boolean,
//       default: false
//     },
//     aiSetup: {
//       type: Boolean,
//       default: false
//     },
//     careerPageSetting: {
//       type: Boolean,
//       default: false
//     },
//     qualificationSetup: {
//       type: Boolean,
//       default: false
//     },
//     idSetup: {
//       type: Boolean,
//       default: false
//     },
//     roleSetup: {
//       type: Boolean,
//       default: false
//     },
//     hiringFlowSetup: {
//       type: Boolean,
//       default: false
//     },
//     // candidateProfileSetup: {
//     //   type: Boolean,
//     //   default: false
//     // },

//     // VERIFICATION
//     verificationApiSetup: {
//       type: Boolean,
//       default: false
//     },
//     verificationStagesSetup: {
//       type: Boolean,
//       default: false
//     },

//     // TIME & ATTENDANCE
//     leaveTypeSetup: {
//       type: Boolean,
//       default: false
//     },
//     holidaySetup: {
//       type: Boolean,
//       default: false
//     },

//     // MASTER DATA SETUP
//     costCenterSetup: {
//       type: Boolean,
//       default: false
//     },
//     masterDropdownSetup: {
//       type: Boolean,
//       default: false
//     },
//     mailSwitchSetup: {
//       type: Boolean,
//       default: false
//     },

//     // EXPENSE MANAGEMENT
//     expensePoliciesSetup: {
//       type: Boolean,
//       default: false
//     },
//     expenseConfigSetup: {
//       type: Boolean,
//       default: false
//     },
//     expenseCategoriesSetup: {
//       type: Boolean,
//       default: false
//     },
//     expenseTypesSetup: {
//       type: Boolean,
//       default: false
//     },
//     expenseRolePermissionSetup: {
//       type: Boolean,
//       default: false
//     },

//     // ASSET MANAGEMENT
//     assetEquipmentSetup: {
//       type: Boolean,
//       default: false
//     },
//     assetCategoriesSetup: {
//       type: Boolean,
//       default: false
//     },
//     assetPermissionsSetup: {
//       type: Boolean,
//       default: false
//     },

//     // VENDOR MANAGEMENT
//     vendorRegistrationSetup: {
//       type: Boolean,
//       default: false
//     },
//     industryTypeSetup: {
//       type: Boolean,
//       default: false
//     },
//     // linkedinSetUp: {
//     //   type: Boolean,
//     //   default: false
//     // },
//     jobPostDashboard: {
//       canViewAll: {
//         type: Boolean,
//         default: false
//       },
//       canViewSelf: {
//         type: Boolean,
//         default: false,
//       },
//       newJobPost: {
//         type: Boolean, default: false
//       },
//       canToggleStatus: {
//         type: Boolean, default: false
//       },
//       jobPostApprove: {
//         type: Boolean, default: false
//       },
//     },

//     jobApplications: {
//       canViewAll: {
//         type: Boolean,
//         default: false
//       },
//       canViewSelf: {
//         type: Boolean,
//         default: false,
//       },
//       canApproveReject: {
//         type: Boolean, default: false
//       },
//       candidateMap: {
//         type: Boolean, default: false
//       },
//     },
//     socialMedia: {
//       newPost: {
//         type: Boolean,
//         default: false
//       },
//       draft: {
//         type: Boolean,
//         default: false,
//       },
//       scheduledPost: {
//         type: Boolean, default: false
//       },
//       calendar: {
//         type: Boolean, default: false
//       },
//     },
//     linkedin: {
//       setup: {
//         type: Boolean, default: false
//       },
//       dashboard: {
//         type: Boolean, default: false
//       },
//       createPost: {
//         type: Boolean, default: false
//       },
//     },
//     fileManager: {
//       type: Boolean, default: false
//     },
//     notes: {
//       type: Boolean, default: false
//     },
//     agencySetup: {
//       type: Boolean, default: false
//     },
//     CustomPdfTemplate: {
//       type: Boolean, default: false
//     },

//     interviewSetup: {
//       agentSetup: {
//         type: Boolean, default: false
//       },
//     },

//     targetCompany: {
//       type: Boolean, default: false
//     },
//     chat: {
//       type: Boolean, default: false
//     },
//     callingAgentCreation: {
//       type: Boolean, default: false
//     },
//     interviewCanViewSelf: {
//       type: Boolean, default: false
//     },
//     interviewCanViewAll: {
//       type: Boolean, default: false
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const roleModel = mongoose.model("role", roleSchema);

// export default roleModel;
