// controllers/socialAuth.controller.js
import axios from "axios";
import SocialMediaAccount from "../../models/Social Media/SocialMediaAccount.js";
import {
  success,
  badRequest,
  unknownError,
} from "../../formatters/globalResponse.js";

// Redirect to Facebook OAuth with Instagram scopes

export const redirectToFacebookInstagram = (req, res) => {
  try {
    const scopes = [
      "instagram_basic",
      "pages_show_list",
      "instagram_content_publish",
      "pages_manage_posts",
    ].join(","); // Joined with commas

    const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

    // 🔥 NO SPACES IN THE URL STRING 🔥
    const oauthUrl =
      `https://www.facebook.com/v23.0/dialog/oauth` +
      `?client_id=${process.env.APP_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&response_type=code`;

    console.log("Redirecting to:", oauthUrl); // Log for debugging
    return res.redirect(oauthUrl);
  } catch (error) {
    console.error("[redirectToFacebookInstagram][ERROR]", error.message);
    return unknownError(res, error);
  }
};

// Handle Facebook OAuth Callback

export const handleFacebookCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return badRequest(res, "Missing code parameter");
    }

    // Step 1: Get short-lived token
    const tokenRes = await axios.get(
      "https://graph.facebook.com/v23.0/oauth/access_token",
      {
        params: {
          client_id: process.env.APP_ID,
          client_secret: process.env.APP_SECRET,
          redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
          code,
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    // Step 2: Get Pages
    const pagesRes = await axios.get(
      "https://graph.facebook.com/v23.0/me/accounts",
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    const eligiblePages = [];

    for (const page of pagesRes.data.data || []) {
      const pageDetailsRes = await axios.get(
        `https://graph.facebook.com/v23.0/ ${page.id}`,
        {
          params: {
            fields: "instagram_business_account{name},name",
            access_token: accessToken,
          },
        }
      );

      const pageDetails = pageDetailsRes.data;

      if (pageDetails.instagram_business_account) {
        const igAccountId = pageDetails.instagram_business_account.id;

        // Step 3: Get Instagram Account Details
        const igAccountRes = await axios.get(
          `https://graph.facebook.com/v23.0/ ${igAccountId}`,
          {
            params: {
              fields: "username",
              access_token: accessToken,
            },
          }
        );

        const igAccountData = igAccountRes.data;

        eligiblePages.push({
          pageId: page.id,
          pageName: pageDetails.name,
          igAccountId,
          igUsername: igAccountData.username,
          pageAccessToken: page.access_token,
        });
      }
    }

    if (!eligiblePages.length) {
      return badRequest(
        res,
        "No eligible Instagram-connected pages found."
      );
    }

    let htmlForm = `<h3>Select a Facebook Page</h3><form method="POST" action="/v1/api/socialMedia/select-page"><input type="hidden" name="access_token" value="${accessToken}" /><ul>`;
    eligiblePages.forEach((p) => {
      htmlForm += `
        <li>
          <label>
            <input type="radio" name="selectedPage" value='${JSON.stringify(p)}' required />
            ${p.pageName} → @${p.igUsername}
          </label>
        </li>
      `;
    });
    htmlForm += `</ul><button type="submit">Connect</button></form>`;

    return res.send(htmlForm);
  } catch (err) {
    console.error("[handleFacebookCallback][ERROR]", err.message);
    return unknownError(res, err);
  }
};

// Save selected Facebook Page + Instagram Account

export const selectPageForInstagram = async (req, res) => {
  try {
    const { selectedPage, access_token } = req.body;
    const parsed = JSON.parse(selectedPage);

    const saved = await SocialMediaAccount.findOneAndUpdate(
      { userId: parsed.igAccountId }, // 👈 Use 'userId' instead of 'providerId'
      {
        provider: "instagram_business",
        userId: parsed.igAccountId,
        accessToken: access_token,
        refreshToken: null,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        username: parsed.igUsername,
        igAccountId: parsed.igAccountId, // Optional: if you want to store again explicitly
        instagramUsername: parsed.igUsername,
        facebookPageId: parsed.pageId,
        facebookPageName: parsed.pageName,
        facebookPageAccessToken: parsed.pageAccessToken,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return success(res, "✅ Instagram connected successfully!", {
      account: saved,
    });
  } catch (err) {
    console.error("[selectPageForInstagram][ERROR]", err.message);
    return unknownError(res, err);
  }
};

// get all facebook and instagram accounts

export const getAllConnectedAccounts = async (req, res) => {
  try {
    const accounts = await SocialMediaAccount.find({});

    const result = {
      facebook_pages: [],
      instagram_business_accounts: [],
      instagram_basic_accounts: [],
    };

    accounts.forEach((account) => {
      if (account.provider === "facebook_page") {
        result.facebook_pages.push({
          id: account._id,
          provider: account.provider,
          name: account.facebookPageName || account.username,
          pageId: account.facebookPageId,
          accessToken: account.accessToken,
          expiresAt: account.expiresAt,
        });
      } else if (account.provider === "instagram_business") {
        result.instagram_business_accounts.push({
          id: account._id,
          provider: account.provider,
          name: account.instagramUsername || account.username,
          userId: account.userId,
          igAccountId: account.igAccountId,
          accessToken: account.accessToken,
          expiresAt: account.expiresAt,
        });
      } else if (account.provider === "instagram_basic") {
        result.instagram_basic_accounts.push({
          id: account._id,
          provider: account.provider,
          name: account.username,
          userId: account.userId,
          accessToken: account.accessToken,
          expiresAt: account.expiresAt,
        });
      }
    });

    return success(res, "Accounts fetched successfully", result);
  } catch (error) {
    console.error("[getAllConnectedAccounts][ERROR]", error.message);
    return badRequest(res, "Failed to fetch connected accounts");
  }
};

// Disconnect and revoke token for a social media account

export const disconnectAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    // Step 1: Find the account in DB
    const account = await SocialMediaAccount.findById(accountId);
    if (!account) {
      return badRequest(res, "Account not found");
    }

    let revokeSuccess = true;
    let revokeError = null;

    // Step 2: Revoke token based on provider type
    try {
      if (account.provider === "facebook_page") {
        // 🟦 Facebook Page: Revoke page token
        await axios.delete(
          `https://graph.facebook.com/v23.0/me/permissions`,
          {
            params: {
              access_token: account.accessToken,
            },
          }
        );

      } else if (
        account.provider === "instagram_business" ||
        account.provider === "instagram_basic"
      ) {
        // 🟩 Instagram: Revoke user token
        await axios.get(
          `https://api.instagram.com/oauth/revoke_token`,
          {
            params: {
              access_token: account.accessToken,
              client_id: process.env.INSTAGRAM_CLIENT_ID,
              client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
            },
          }
        );
      } else {
        throw new Error(`Unsupported provider: ${account.provider}`);
      }
    } catch (revokeErr) {
      revokeSuccess = false;
      revokeError = revokeErr.response?.data || revokeErr.message;
      console.error("[TokenRevoke][ERROR]", revokeError);
    }

    // Step 3: Delete account from DB
    await SocialMediaAccount.findByIdAndDelete(accountId);

    // Step 4: Send response
    return success(res, "Account disconnected successfully", {
      revoked: revokeSuccess,
      error: revokeError,
      provider: account.provider,
    });
  } catch (error) {
    console.error("[disconnectAccount][ERROR]", error.message);
    return badRequest(res, "Failed to disconnect account");
  }
};