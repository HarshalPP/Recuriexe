import {
  success,
  badRequest,
  unknownError,
} from "../../formatters/globalResponse.js";

import {
  generateAuthUrl,
  generateCodeVerifier,
  generateCodeChallenge,
  exchangeCodeForToken,
  fetchEmployerList,
  exchangeEmployerToken,
  createJob,
  formatJobForIndeed,
} from "../../services/Linkedinservice/indeed.service.js";


// Step 1: Start the auth
export const startIndeedAuth = (req, res) => {
  try {
    const state         = Math.random().toString(36).substring(2);
    const code_verifier = generateCodeVerifier();
    const code_challenge= generateCodeChallenge(code_verifier);

    req.session.oauth_state   = state;
    req.session.code_verifier = code_verifier;

    const authUrl = generateAuthUrl(state, code_challenge);
    return success(res, { authUrl });
  } catch (err) {
    console.error("Error in startIndeedAuth:", err);
    return unknownError(res, "Failed to start Indeed auth.");
  }
};

// Step 2: Callback after user logs in & consents
export const handleIndeedOAuthCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) 
      return badRequest(res, "Missing code or state");
    if (state !== req.session.oauth_state) 
      return badRequest(res, "Invalid state");

    const code_verifier = req.session.code_verifier;
    if (!code_verifier) 
      return badRequest(res, "Missing PKCE code_verifier");

    // Exchange the auth code for a user‐scoped refresh_token + access_token
    const { access_token, refresh_token } = 
      await exchangeCodeForToken(req, code, code_verifier);

    if (!refresh_token) 
      return badRequest(res, "Failed to obtain refresh token");

    // Now list that user's employers
    const employers = await fetchEmployerList();

    if (!Array.isArray(employers) || employers.length === 0) {
      return badRequest(res, "No employers found for this account");
    }

    // Return the list plus the refresh_token so the client can pick an employer
    return success(res, {
      message: "Please select an employer",
      employers,
      temp_refresh_token: refresh_token,
    });
  } catch (err) {
    console.error("Error in handleIndeedOAuthCallback:", err);
    return unknownError(res, "Indeed callback failed.");
  }
};

// Step 3: After the client picks an employer
export const finalizeEmployerSelection = async (req, res) => {
  try {
    const { employerId, temp_refresh_token } = req.body;
    if (!employerId || !temp_refresh_token) {
      return badRequest(res, "Missing employerId or temp_refresh_token");
    }

    // Exchange the user’s refresh token + chosen employer → final tokens
    const finalTokens = await exchangeEmployerToken(
      temp_refresh_token,
      employerId
    );

    return success(res, {
      message: "Indeed connected successfully.",
      tokens: finalTokens,
    });
  } catch (err) {
    console.error("Error in finalizeEmployerSelection:", err);
    return unknownError(res, "Employer selection failed.");
  }
};

// CREATE JOB POSTING
export const createJobPosting = async (req, res) => {
  try {
    const { accessToken, jobData } = req.body;
    
    if (!accessToken || !jobData) {
      return badRequest(res, "Missing accessToken or jobData");
    }

    // Validate required fields
    if (!jobData.title || !jobData.description || !jobData.companyName) {
      return badRequest(res, "Missing required job fields: title, description, or companyName");
    }

    // Format job data for Indeed API
    const formattedJob = formatJobForIndeed(jobData);
    console.log("formattedJob:-----",formattedJob);
    
    const result = await createJob(accessToken, formattedJob);
    
    return success(res, {
      message: "Job posted successfully to Indeed",
      data: result,
    });
  } catch (err) {
    console.error("Error in createJobPosting:", err);
    return unknownError(res, err.message || "Failed to create job posting");
  }
};
