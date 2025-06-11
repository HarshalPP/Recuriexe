import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    allocatedModule:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Allocated",
      default: null
    }],


    PlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null
    },

    name: { type: String ,default: "" },
    logo: { type: String, default: ""  },
    website: { type: String, default: ""  },
    carrierlink: { type: String, default: "" },
    typeOfOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subDropDown",
            default: null,
      // required: true,
    },

    typeOfSector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subDropDown",
            default: null,
      // required: true,
    },

    typeOfIndustry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subDropDown",
      default: null,
      // required: true,
    },

    contactPerson: { type: String, default: ""  },
    contactNumber: { type: String, default: ""  },
    contactEmail: { type: String, default: ""  },

    addressLine1: { type: String, default: ""  },
    addressLine2: { type: String, default: ""  },
    city: { type: String, default: ""  },
    state: { type: String, default: ""  },
    country: { type: String, default: "India" },
    zipCode: { type: String ,default: "" },

        abbreviation: { type: String, default: "" }, // NEW
    domain: { type: String, default: "" }, // NEW
    defaultCurreny: {    type: mongoose.Schema.Types.ObjectId, default: null , ref :"currency"}, // NEW
    registeredAddress: { type: String, default: "" }, // NEW
    haveGSTIN: { type: Boolean, default: false }, // NEW
    GSTNumber: { type: String, default: "" }, // NEW
    CINNumber: { type: String, default: "" }, // NEW
    incorporationDate: { type: Date, default: "" }, // NEW
    Pan: { type: String, default: "" }, // NEW

    // Promoter and Management Details
    promoterDetail: {
      passportSizePhoto: { type: String, default: '' },
      fullName: { type: String, default: '' },
      fatherOrHusbandName: { type: String, default: '' },
      dateOfBirth: { type: Date, default: null },
      languagePreferenceId: { type: mongoose.Schema.Types.ObjectId, ref: "subDropDown", default: null },
      contactNumber: { type: String, default: '' },
      email: { type: String, default: '' },
      correspondenceAddress: { type: String, default: '' },
      aadharNumber: { type: String, default: '' },
      panCardNumber: { type: String, default: '' },
      yearsOfExperience: { type: Number, default: 0 },
      qualificationId: { type:  mongoose.Schema.Types.ObjectId, ref: "subDropDown", default: null },
      photo: { type: String, default: '' },
      aadharCard: { type: String, default: '' },
      panCard: { type: String, default: '' }
    },

    managementDetail: {
      passportSizePhoto: { type: String, default: '' },
      fullName: { type: String, default: '' },
      fatherOrHusbandName: { type: String, default: '' },
      dateOfBirth: { type: Date, default: null },
      languagePreferenceId: { type: mongoose.Schema.Types.ObjectId, ref: "subDropDown", default: null },
      contactNumber: { type: String, default: '' },
      email: { type: String, default: '' },
      correspondenceAddress: { type: String, default: '' },
      aadharNumber: { type: String, default: '' },
      panCardNumber: { type: String, default: '' },
      yearsOfExperience: { type: Number, default: 0 },
      qualificationId: { type:  mongoose.Schema.Types.ObjectId, ref: "subDropDown", default: null },
      photo: { type: String, default: '' },
      aadharCard: { type: String, default: '' },
      panCard: { type: String, default: '' }
    }
    // Add other fields as needed
  },
  {
    timestamps: true,
  }
);

const OrganizationModel = mongoose.model("Organization", organizationSchema);
export default OrganizationModel;
