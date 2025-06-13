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
      default:""
    },
    PortalName: {
      type: String,
      default:""
    },
    header: {
      type: String,
      default:""
    },
    footer: {
      type: String,
      default:""
    },
    WorkingDayWithHour: {
      type: String,
      default:""
    },
    phoneNumber: {
      type: String,
      default:""
    },
    email: {
      type: String,
      default:""
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
    registerOfficeAddress:{
      type: String,
      default: "",
    },
    corporateOfficeAddress:{
      type: String,
      default: "",
    },
    // linkedin credinal setUp//

    linkedin: {
      clientId: {
        type: String,
        default:""
      },

      clientSecret: {
        type: String,
        default:""
      },

      callbackURL: {
        type: String,
        default:""
      },

      scope: {
        type: String,
        default:""
      },

      RedirectURL: {
        type: String,
        default:""
      },
    },

    google: {
      clientId: {
        type: String,
        default:""
      },

      clientSecret: {
        type: String,
        default:""
      },

      callbackURL: {
        type: String,
        default:""
      },

      scope: {
        type: String,
        default:""
      },

      successRedirectUrl: {
        type: String,
        default:""
      },

      failureRedirectUrl: {
        type: String,
        default:""
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
    headerText: { type: String, default: "" },
    whyJoinOrganization : {type:Boolean , default :true},
    tipsForApplying : {type :Boolean , default:true},
    proTip : {
      proTipTitle : {type :String, default:""},
      appliGuidelinesTitle :{type:String , default : ""}
    },
    minDaysBetweenApplications: {type :Number , default : null},
    maxApplicationsPerEmployee :{type :Number , default : null},
    resumeTemplate : { type :String , default : ""},
  },
  {
    timestamps: true,
  }
);

// export the model

const PortalModel = mongoose.model("portalsetUp", candidateSchema);
export default PortalModel;
