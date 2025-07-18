// controllers/instagram.controller.js
import axios from "axios";
import SocialMediaAccount from "../../models/Social Media/SocialMediaAccount.js";
import {
  success,
  badRequest,
  unknownError,
} from "../../formatters/globalResponse.js";
import cron from 'node-cron';

// Redirect to Instagram OAuth
// export const redirectToInstagramDirect = (req, res) => {
//   try {
//     const clientId = process.env.INSTAGRAM_CLIENT_ID;
//     const redirectUri = encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI);
//     const scopes = [
//       "instagram_business_basic",
//       "instagram_business_manage_messages",
//       "instagram_business_manage_comments",
//       "instagram_business_content_publish",
//       "instagram_business_manage_insights"
//     ].join("%2C");

//     const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code&force_reauth=true`;

//     console.log("Redirecting user to:", authUrl);
//     return res.redirect(authUrl);
//   } catch (error) {
//     console.error("[redirectToInstagramDirect][ERROR]", error.message);
//     return unknownError(res, error);
//   }
// };

// // Handle Instagram OAuth callback
// export const handleInstagramCallback = async (req, res) => {
//   try {
//     const { code } = req.query;
//     if (!code) {
//       return badRequest(res, "Missing authorization code");
//     }

//     const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

//     // Step 1: Exchange code for access token
//     const tokenRes = await axios.post(
//       "https://api.instagram.com/oauth/access_token", // 🔥 No trailing space
//       new URLSearchParams({
//         client_id: process.env.INSTAGRAM_CLIENT_ID,
//         client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
//         grant_type: "authorization_code",
//         redirect_uri: redirectUri,
//         code,
//       })
//     );

//     const { access_token, user_id } = tokenRes.data;

//     if (!access_token) {
//       throw new Error("Access token not found in Instagram response");
//     }

//     // Step 2: Get Instagram user info
//     const userRes = await axios.get("https://graph.instagram.com/me", {
//       params: {
//         fields: "id,username,account_type,media_count",
//         access_token,
//       },
//     });

//     const user = userRes.data;

//     // Step 3: Save to unified model
//     const saved = await SocialMediaAccount.findOneAndUpdate(
//       { userId: user.id },
//       {
//         provider: "instagram_basic",
//         userId: user.id,
//         accessToken: access_token,
//         refreshToken: null,
//         expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
//         username: user.username,
//         accountType: user.account_type,
//         mediaCount: user.media_count,
//       },
//       { upsert: true, new: true }
//     );

//     return success(res, "Logged in to Instagram successfully", { user: saved });
//   } catch (error) {
//     console.error(
//       "[handleInstagramCallback][ERROR]",
//       error.response?.data || error.message
//     );
//     return unknownError(res, error);
//   }
// };

// Get Instagram Media



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

    // Step 1: Exchange code for short-lived access token
    const tokenRes = await axios.post(
      "https://api.instagram.com/oauth/access_token",
      new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      })
    );

    const { access_token: shortLivedToken, user_id } = tokenRes.data;

    if (!shortLivedToken) {
      throw new Error("Access token not found in Instagram response");
    }

    // Step 2: Exchange short-lived token for long-lived token
    const longLivedRes = await axios.get("https://graph.instagram.com/access_token", {
      params: {
        grant_type: "ig_exchange_token",
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        access_token: shortLivedToken,
      },
    });

    const { access_token: longLivedToken, expires_in } = longLivedRes.data;

    // Step 3: Get Instagram user info
    const userRes = await axios.get("https://graph.instagram.com/me", {
      params: {
        fields: "id,username,account_type,media_count",
        access_token: longLivedToken,
      },
    });

    const user = userRes.data;

    // Step 4: Save long-lived token with correct expiry time
    const saved = await SocialMediaAccount.findOneAndUpdate(
      { userId: user.id },
      {
        provider: "instagram_basic",
        userId: user.id,
        accessToken: longLivedToken,
        refreshToken: null, // Instagram doesn't issue refresh tokens; use token exchange instead
        expiresAt: new Date(Date.now() + expires_in * 1000), // expires_in is in seconds
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

// const refreshInstagramTokenInBackground = async (account) => {
//   try {
//     const { accessToken, userId } = account;

//     const refreshRes = await axios.get('https://graph.instagram.com/refresh_access_token ', {
//       params: {
//         grant_type: 'ig_refresh_token',
//         access_token: accessToken,
//       },
//     });

//     const { access_token: refreshedToken, expires_in } = refreshRes.data;

//     // Step 2: Update DB with new token and expiration
//     await SocialMediaAccount.findOneAndUpdate(
//       { userId },
//       {
//         accessToken: refreshedToken,
//         expiresAt: new Date(Date.now() + expires_in * 1000),
//         lastRefreshedAt: new Date(),
//       },
//       { new: true }
//     );

//     logger.info(`[Instagram Token Refresh] Token refreshed for user ID: ${userId}`);
//   } catch (error) {
//     logger.error(
//       `[Instagram Token Refresh] Error refreshing token for user ID: ${
//         account.userId
//       }, Error: ${error.message}`,
//       error.response?.data || {}
//     );
//   }
// };





// export const scheduleInstagramTokenRefresh = () => {
//   cron.schedule('0 0 * * 0', async () => {

//     try {
//       const now = new Date();
//       const cutoffTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tokens expiring within next 24 hrs

//       const accounts = await SocialMediaAccount.find({
//         provider: 'instagram_basic',
//         expiresAt: { $lt: cutoffTime },
//       });

//       if (accounts.length === 0) {
//         logger.info('[Instagram Token Refresh] No tokens need refreshing.');
//         return;
//       }

//       logger.info(
//         `[Instagram Token Refresh] Found ${accounts.length} Instagram tokens to refresh.`
//       );

//       for (const account of accounts) {
//         await refreshInstagramTokenInBackground(account);
//       }
//     } catch (error) {
//       logger.error(
//         '[Instagram Token Refresh] Error during scheduled token refresh:',
//         error.message
//       );
//     }
//   });
// };
