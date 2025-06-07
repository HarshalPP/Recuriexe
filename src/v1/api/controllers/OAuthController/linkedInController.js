import axios from 'axios';
import { getConfig } from "../../config/likedInconfig.js";
import User from "../../models/AuthModel/auth.model.js";
import jwt from "jsonwebtoken";
import { success, badRequest, unknownError } from "../../formatters/globalResponse.js";
import { userProfile } from '../authController/auth.controller.js';

// LinkedIn Init
export const initiateLinkedInLogin = async (req, res) => {
  try {

    const config = await getConfig();

    const state = jwt.sign(
      { purpose: 'linkedin_auth', timestamp: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    const linkedInAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    linkedInAuthUrl.searchParams.append('response_type', 'code');
    linkedInAuthUrl.searchParams.append('client_id', config.linkedin.clientId);
    linkedInAuthUrl.searchParams.append('redirect_uri', config.linkedin.callbackURL);
    linkedInAuthUrl.searchParams.append('state', state);
    linkedInAuthUrl.searchParams.append('scope', config.linkedin.scope);

    res.redirect(linkedInAuthUrl.toString());

  } catch (error) {
    console.error("Error initiating LinkedIn login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// LinkedIn Callback Handler
export const handleLinkedInCallback = async (req, res) => {
  try {
        const config = await getConfig();



    const { code, state } = req.query;

    let decodedState;
    try {
      decodedState = jwt.verify(state, process.env.JWT_SECRET);
    } catch (err) {
      return badRequest(res, "Invalid or expired state parameter");
    }

    const tokenResponse = await getLinkedInAccessToken(code);
    const profileData = await getLinkedInProfileData(tokenResponse.access_token);
    const { user, token } = await findOrCreateUser(profileData, tokenResponse);

    const redirectUrl = new URL(config?.linkedin?.redirectUri);
    redirectUrl.searchParams.append('token', token);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    return unknownError(res, error);
  }
};

// Exchange Authorization Code for Access Token
const getLinkedInAccessToken = async (code) => {
  const config = await getConfig();

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('client_id', config.linkedin.clientId);
  params.append('client_secret', config.linkedin.clientSecret);
  params.append('redirect_uri', config.linkedin.callbackURL);

  const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return response.data;
};

// Get Profile Data from LinkedIn
const getLinkedInProfileData = async (accessToken) => {
  try {
    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const profile = response.data;
    return {
      linkedinId: profile.sub,
      firstName: profile.given_name,
      lastName: profile.family_name,
      email: profile.email,
      profilePicture: profile.picture || null
    };
  } catch (error) {
    throw new Error('Failed to retrieve LinkedIn profile data');
  }
};

// Find or Create User in DB
const findOrCreateUser = async (profileData, tokenData) => {
  console.log("profileData" , profileData)
  let user = await User.findOne({ linkedinId: profileData.linkedinId });
  const TEN_DAYS_IN_MS = 10 * 24 * 60 * 60 * 1000;

  if (user) {
    user.linkedinAccessToken = tokenData.access_token;
    user.linkedinTokenExpiry = Date.now() + TEN_DAYS_IN_MS;
    if (tokenData.refresh_token) {
      user.linkedinRefreshToken = tokenData.refresh_token;
    }
  } else {
    user = await User.create({
      linkedinId: profileData.linkedinId,
      name: `${profileData.firstName} ${profileData.lastName}`,
      email: profileData.email ,
      profilePicture: profileData.profilePicture,
      linkedinAccessToken: tokenData.access_token,
      linkedinTokenExpiry: Date.now() + TEN_DAYS_IN_MS,
      linkedinRefreshToken: tokenData.refresh_token || null
    });
  }

  const token = jwt.sign({ id: user._id, role: 'User' }, process.env.JWT_SECRET);
  user.activeToken = token;
  await user.save();

  return { user, token };
};

// Refresh LinkedIn Token
export const refreshLinkedInToken = async (refreshToken) => {
  try {
    const config = await getConfig();

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    params.append('client_id', config.linkedin.clientId);
    params.append('client_secret', config.linkedin.clientSecret);

    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return response.data;
  } catch (error) {
    console.error('Error refreshing LinkedIn token:', error);
    throw new Error('Failed to refresh LinkedIn token');
  }
};

// Logout LinkedIn
export const linkedinLogout = async (req, res) => {
  try {
    let user = null;

    if (req.user?.linkedinId) {
      user = await User.findOne({ linkedinId: req.user.linkedinId });
      if (user) {
        user.linkedinAccessToken = null;
        user.linkedinRefreshToken = null;
        user.linkedinTokenExpiry = null;
        user.activeToken = null;
        await user.save();
      }
    }

    if (req.session) {
      req.session.destroy();
    }

    return success(res, "Logout successful", user);
  } catch (error) {
    console.error('LinkedIn logout error:', error);
    return unknownError(res, "Internal server error");
  }
};
