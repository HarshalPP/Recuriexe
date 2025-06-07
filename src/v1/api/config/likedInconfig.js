import PortalModel from "../models/PortalSetUp/portalsetup.js";

// Async function to build config dynamically from DB
export const getConfig = async () => {
  let portalData = null;

  try {
    portalData = await PortalModel.findOne();
  } catch (err) {
    console.error("Failed to fetch portal setup:", err.message);
  }

  

  return {
    linkedin: {
      clientId: portalData?.linkedin?.clientId || process.env.LINKEDIN_CLIENT_ID,
      clientSecret: portalData?.linkedin?.clientSecret || process.env.LINKEDIN_CLIENT_SECRET,
      redirectUri: portalData?.linkedin?.RedirectURL || process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:4000/api/auth/linkedin/callback',
      scope: portalData?.linkedin?.scope || 'openid profile email',
      callbackURL:portalData?.linkedin?.callbackURL || "http://localhost:4000/api/auth/linkedin/callback"
    }
  };
};
