import mongoose from "mongoose";
const Schema = mongoose.Schema;

const candidateSchema = new Schema(
  {


    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
      default: null,
    },

    Portallogo: {
      type: String,
      default: ""
    },
    PortalName: {
      type: String,
      default: ""
    },
    PortalNameFont: {
      fontSize: { type: String, default: "" },
      fontColor: { type: String, default: "" },
    },
    header: {
      type: String,
      default: ""
    },
    headerFont: {
      fontSize: { type: String, default: "" },
      fontColor: { type: String, default: "" },
    },
    footer: {
      type: String,
      default: ""
    },
    footerFont: {
      fontSize: { type: String, default: "" },
      fontColor: { type: String, default: "" },
    },
    WorkingDayWithHour: {
      type: String,
      default: ""
    },
    phoneNumber: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      default: ""
    },
    linkedinConnection: {
      type: String,
      default: "",
    },
    googleConnection: {
      type: String,
      default: "",
    },
    linkedinUrl: {
      type: String,
      default: "",
    },
    googleUrl: {
      type: String,
      default: "",
    },
    instaUrl: {
      type: String,
      default: "",
    },
    twitterUrl: {
      type: String,
      default: "",
    },
    registerOfficeAddress: {
      type: String,
      default: "",
    },
    corporateOfficeAddress: {
      type: String,
      default: "",
    },
    // linkedin credinal setUp//

    linkedin: {
      clientId: {
        type: String,
        default: ""
      },

      clientSecret: {
        type: String,
        default: ""
      },

      callbackURL: {
        type: String,
        default: ""
      },

      scope: {
        type: String,
        default: ""
      },

      RedirectURL: {
        type: String,
        default: ""
      },
    },

    google: {
      clientId: {
        type: String,
        default: ""
      },

      clientSecret: {
        type: String,
        default: ""
      },

      callbackURL: {
        type: String,
        default: ""
      },

      scope: {
        type: String,
        default: ""
      },

      successRedirectUrl: {
        type: String,
        default: ""
      },

      failureRedirectUrl: {
        type: String,
        default: ""
      },
    },
    termsAndConditions: {
      type: String,
      default: "",
    },
    privacyPolicy: {
      type: String,
      default: "",
    },
    bannerPhoto: { type: String, default: "" },
    mainHeaderText: { type: String, default: "" },
    mainHeaderTextFont: {
      fontSize: { type: String, default: "" },
      fontColor: { type: String, default: "" },
    },
    headerText: { type: String, default: "" },
    headerTextFont: {
      fontSize: { type: String, default: "" },
      fontColor: { type: String, default: "" },
    },
    whyJoinOrganization: { type: Boolean, default: true },
    tipsForApplying: { type: Boolean, default: true },
    proTip: {
      proTipTitle: { type: String, default: "" },
      proTipTitleFont: {
        fontSize: { type: String, default: "" },
        fontColor: { type: String, default: "" },
      },
      appliGuidelinesTitle: { type: String, default: "" }
    },
    minDaysBetweenApplications: { type: Number, default: null },
    maxApplicationsPerEmployee: { type: Number, default: null },
    resumeTemplate: { type: String, default: "" },

    jobListCard: {
      positionName: { type: Boolean, default: true },
      JobType: { type: Boolean, default: false },
      jobPostTime: { type: Boolean, default: true },
      branch: { type: Boolean, default: true },
      JobSummary: { type: Boolean, default: true },
      keySkills: { type: Boolean, default: true },
      applicationCount: { type: Boolean, default: true },
      department: { type: Boolean, default: true },
      experience: { type: Boolean, default: false },
      AgeLimit: { type: Boolean, default: false },
      gender: { type: Boolean, default: false },
      expiredDate: { type: Boolean, default: false },
      qualification: { type: Boolean, default: false },
      employmentType: { type: Boolean, default: false },
      employeeType: { type: Boolean, default: false },
      noOfPosition: { type: Boolean, default: false },
    },
    jobApplyDetail: {
      positionName: { type: Boolean, default: true },
      package: { type: Boolean, default: false },
      branch: { type: Boolean, default: true },
      experience: { type: Boolean, default: false },
      qualification: { type: Boolean, default: true },
      employmentType: { type: Boolean, default: true },
      noOfPosition: { type: Boolean, default: true },
      JobType: { type: Boolean, default: true },
      jobPostTime: { type: Boolean, default: true },
      JobSummary: { type: Boolean, default: true },
      keySkills: { type: Boolean, default: true },
      AgeLimit: { type: Boolean, default: false },
      gender: { type: Boolean, default: false },
      expiredDate: { type: Boolean, default: true },
      employeeType: { type: Boolean, default: false },
      applicationCount: { type: Boolean, default: true },
      department: { type: Boolean, default: true },
      rolesAndResponsibilities: { type: Boolean, default: true },
    }
  },
  {
    timestamps: true,
  }
);

// export the model

const PortalModel = mongoose.model("portalsetUp", candidateSchema);
export default PortalModel;