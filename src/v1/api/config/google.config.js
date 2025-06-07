import PortalModel from "../models/PortalSetUp/portalsetup.js";

// Async function to build config dynamically from DB
export const getConfig = async () => {
  let portalData = null;

  try {
    portalData = await PortalModel.findOne();

  } catch (err) {
    console.error("Failed to fetch portal setup:", err);
  }

  return {
    google: {
      clientId: portalData?.google?.clientId,
      clientSecret: portalData?.google?.clientSecret,
      scope: portalData?.linkedin?.scope,
      callbackURL:portalData?.linkedin?.callbackURL,
      successRedirectUrl:portalData?.google?.successRedirectUrl,
      failureRedirectUrl:portalData?.google?.failureRedirectUrl
    }
  };
};
