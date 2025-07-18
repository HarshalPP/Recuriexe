import mongoose from "mongoose";

const { Schema } = mongoose;

import { model } from 'mongoose';


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
    // permissions: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Permission"
    //   }
    // ],
    organizationId: { type: Schema.Types.ObjectId, default: null, ref: "Organization" },
    createdBy: { type: Schema.Types.ObjectId, default: null, ref: "employee" },
    updateBy: { type: Schema.Types.ObjectId, default: null, ref: "employee" },

    organizationSetup: {

      organizationSetup: {
        type: Boolean,
        default: true
      },
      branchSetup: {
        type: Boolean,
        default: true
      },
      workLocationSetup: {
        type: Boolean,
        default: true
      },
      departmentTypeSetup: {
        type: Boolean,
        default: true
      },
      designationSetup: {
        type: Boolean,
        default: true
      },
      employeeTypeSetup: {
        type: Boolean,
        default: true
      },
      workModeSetup: {
        type: Boolean,
        default: false
      },
      employeeAndRoleManagement: {
        type: Boolean,
        default: true
      },
    },

    RecruitmentHiring: {
      budgetSetup: {
        type: Boolean,
        default: false
      },
      aiSetup: {
        type: Boolean,
        default: false
      },
      careerPageSetting: {
        type: Boolean,
        default: false
      },
      idSetup: {
        type: Boolean,
        default: false
      },
      qualificationSetup: {
        type: Boolean,
        default: false
      },
      linkedin: {
        setup: {
          type: Boolean, default: false
        },
        dashboard: {
          type: Boolean, default: false
        },
        createPost: {
          type: Boolean, default: false
        },
        // linkedinPostApprove: {
        //   type: Boolean, default: false
        // },
      },
      targetCompany: {
        type: Boolean, default: false
      },
      agencySetup: {
        type: Boolean, default: false
      },
      jobDescriptionSetup: {
        type: Boolean,
        default: false
      },
      hiringFlowSetup: {
        type: Boolean,
        default: false
      },
      jobPostDashboard: {
        canViewAll: {
          type: Boolean,
          default: false
        },
        canViewSelf: {
          type: Boolean,
          default: false,
        },
        newJobPost: {
          type: Boolean, default: false
        },
        canToggleStatus: {
          type: Boolean, default: false
        },
        jobPostApprove: {
          type: Boolean, default: false
        },
      },

      jobApplications: {
        canViewAll: {
          type: Boolean,
          default: false
        },
        canViewSelf: {
          type: Boolean,
          default: false,
        },
        canApproveReject: {
          type: Boolean, default: false
        },
        candidateMap: {
          type: Boolean, default: false
        },
      },
      CandidateDocumentCollection : {
        type : Boolean, default : false
      }
    },

    managementFeatures: {
      CustomPdfTemplate: {
        type: Boolean, default: false
      },
      masterDropdownSetup: {
        type: Boolean,
        default: false
      },
      mailSwitchSetup: {
        type: Boolean,
        default: false
      },
    },

    InterviewManagement: {
      callingAgentCreation: {
        type: Boolean, default: false
      },
      interviewCanViewSelf: {
        type: Boolean, default: false
      },
      interviewCanViewAll: {
        type: Boolean, default: false
      },
        callingLogDashboard: {
        type: Boolean, default: false
      },
    },

    expenseManagement: {
      expensePoliciesSetup: {
        type: Boolean,
        default: false
      },
      expenseConfigSetup: {
        type: Boolean,
        default: false
      },
      expenseCategoriesSetup: {
        type: Boolean,
        default: false
      },
      expenseTypesSetup: {
        type: Boolean,
        default: false
      },
      expenseRolePermissionSetup: {
        type: Boolean,
        default: false
      },
      tabsView: {
        type: Boolean,
        default: false
      },
    },

    assetManagement: {
      assetEquipmentSetup: {
        type: Boolean,
        default: false
      },
      assetCategoriesSetup: {
        type: Boolean,
        default: false
      },
      assetPermissionsSetup: {
        type: Boolean,
        default: false
      },
    },

    fileManager: {
      type: Boolean, default: false
    },

    notes: {
      type: Boolean, default: false
    },

    chat: {
      type: Boolean, default: false
    },
    CommandExe: {
     addCase :{
      type : Boolean,
      default : false
     },
     backOffice :{
      type : Boolean,
      default : false
     },
     invoice : {
      type : Boolean,
      default : false
     },
     client : {
      type : Boolean,
      default : false
     },
     pdfTemplate :{
      type : Boolean,
      default : false
     },
     initField :{
      type : Boolean,
      default : false
     },
     variable :{
      type : Boolean,
      default : false
     },
     addAdmin :{
      type : Boolean,
      default : false
     },
     service:{
      type : Boolean,
      default : false
     },
    },
    LeadExe: {

    }

  },
  {
    timestamps: true,
  }
);

const roleModel = mongoose.model("role", roleSchema);

export default roleModel;
