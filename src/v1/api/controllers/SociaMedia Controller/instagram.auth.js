// controllers/instagram.controller.js
import axios from "axios";
import SocialMediaAccount from "../../models/Social Media/SocialMediaAccount.js";
import {
  success,
  badRequest,
  unknownError,
} from "../../formatters/globalResponse.js";

// Redirect to Instagram OAuth
export const redirectToInstagramDirect = (req, res) => {
  try {
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI);
    const scopes = [
      "instagram_business_basic",
      "instagram_business_manage_messages",
      "instagram_business_manage_comments",
      "instagram_business_content_publish",
      "instagram_business_manage_insights"
    ].join("%2C");

    const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code&force_reauth=true`;

    console.log("Redirecting user to:", authUrl);
    return res.redirect(authUrl);
  } catch (error) {
    console.error("[redirectToInstagramDirect][ERROR]", error.message);
    return unknownError(res, error);
  }
};

// Handle Instagram OAuth callback
export const handleInstagramCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return badRequest(res, "Missing authorization code");
    }

    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

    // Step 1: Exchange code for access token
    const tokenRes = await axios.post(
      "https://api.instagram.com/oauth/access_token", // 🔥 No trailing space
      new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      })
    );

    const { access_token, user_id } = tokenRes.data;

    if (!access_token) {
      throw new Error("Access token not found in Instagram response");
    }

    // Step 2: Get Instagram user info
    const userRes = await axios.get("https://graph.instagram.com/me", {
      params: {
        fields: "id,username,account_type,media_count",
        access_token,
      },
    });

    const user = userRes.data;

    // Step 3: Save to unified model
    const saved = await SocialMediaAccount.findOneAndUpdate(
      { userId: user.id },
      {
        provider: "instagram_basic",
        userId: user.id,
        accessToken: access_token,
        refreshToken: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        username: user.username,
        accountType: user.account_type,
        mediaCount: user.media_count,
      },
      { upsert: true, new: true }
    );

    return success(res, "Logged in to Instagram successfully", { user: saved });
  } catch (error) {
    console.error(
      "[handleInstagramCallback][ERROR]",
      error.response?.data || error.message
    );
    return unknownError(res, error);
  }
};

// Get Instagram Media
export const getInstagramMedia = async (req, res) => {
  try {
    const { userId } = req.params;
    const account = await SocialMediaAccount.findOne({userId : userId }).exec();
    if (!account || !account.accessToken) {
      return badRequest(res, "Invalid or unconnected Instagram account");
    }

    const mediaRes = await axios.get(`https://graph.instagram.com/me/media`, {
      params: {
        access_token: account.accessToken,
        fields: "id,caption,media_type,media_url,thumbnail_url,permalink",
      },
    });

    return success(res, "Media fetched successfully", {
      media: mediaRes.data.data,
    });
  } catch (error) {
    console.error("[getInstagramMedia][ERROR]", error.message);
    return unknownError(res, error);
  }
};