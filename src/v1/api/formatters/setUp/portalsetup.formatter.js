import PortalModel from "../../models/PortalSetUp/portalsetup.js"

export const createPortalService = async (data) => {
  if (!data.organizationId) {
    throw new Error("Organization ID is required");
  }

  return await PortalModel.create(data);
};


// export const getAllPortalsService = async (organizationId) => {
//   return await PortalModel.find({organizationId}).populate('organizationId')
// };


export const getAllPortalsService = async (organizationId) => {
  try {
    // Find existing portal data for the organization
    const existingPortal = await PortalModel.findOne({ organizationId }).populate('organizationId');
    
    // If portal data exists, return it
    if (existingPortal) {
      return existingPortal;
    }
    
    // If no portal data found, return default portal object
    const defaultPortal = {
      organizationId: organizationId,
      createdBy: null,
      Portallogo: "",
      PortalName: "",
      header: "",
      footer: "",
      WorkingDayWithHour: "",
      phoneNumber: "",
      email: "",
      linkedinConnection: "",
      googleConnection: "",
      linkedinUrl: "",
      googleUrl: "",
      instaUrl: "",
      twitterUrl: "",
      registerOfficeAddress: "",
      corporateOfficeAddress: "",
      linkedin: {
        clientId: "",
        clientSecret: "",
        callbackURL: "",
        scope: "",
        RedirectURL: ""
      },
      google: {
        clientId: "",
        clientSecret: "",
        callbackURL: "",
        scope: "",
        successRedirectUrl: "",
        failureRedirectUrl: ""
      },
      termsAndConditions: "",
      privacyPolicy: "",
      bannerPhoto: "",
      mainHeaderText: "",
      headerText: "",
      whyJoinOrganization: true,
      tipsForApplying: true,
      proTip: {
        proTipTitle: "",
        appliGuidelinesTitle: ""
      },
      minDaysBetweenApplications: null,
      maxApplicationsPerEmployee: null,
      resumeTemplate: "",
      // Add timestamps for consistency
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return defaultPortal;
  } catch (error) {
    console.error("Error in getAllPortalsService:", error);
    throw error;
  }
};


export const getPortalByIdService = async (id) => {
  return await PortalModel.findById(id);
};

export const updatePortalService = async (id, data) => {
  return await PortalModel.findByIdAndUpdate(id, data, { new: true });
};

export const deletePortalService = async (id) => {
  return await PortalModel.findByIdAndDelete(id);
};
