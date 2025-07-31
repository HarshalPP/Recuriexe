// controllers/socialAuth.controller.js
import axios from "axios";
import SocialMediaAccount from "../../models/Social Media/SocialMediaAccount.js";
import {
  scheduleNewPost,
  postToFacebook,
  postToInstagram,
  savePostedContent,
  postToInstagramDirect,
  executeScheduledPost,
} from "../../services/Linkedinservice/socialMedia.service.js";
import schedule from "node-schedule";
import {
  success,
  badRequest,
  unknownError,
  notFound,
} from "../../formatters/globalResponse.js";
import SocialMediaContent from "../../models/Social Media/PostedContent.js";
import { asyncHandler } from "../../Utils/LinkedIn/asyncHandler.js";
import SocialPostSchedule from "../../models/Social Media/ScheduledPost.js";
import { format } from "date-fns"; // ✅ Add this line
import { ObjectId } from 'mongodb';
// Redirect to Facebook OAuth with Instagram scopes

// export const redirectToFacebookInstagram = (req, res) => {
//   try {
//     const scopes = [
//       "instagram_basic",
//       "pages_show_list",
//       "instagram_content_publish",
//       "pages_manage_posts",
//     ].join(","); // Joined with commas

//     const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

//     // 🔥 NO SPACES IN THE URL STRING 🔥
//     const oauthUrl =
//       `https://www.facebook.com/v23.0/dialog/oauth` +
//       `?client_id=${process.env.APP_ID}` +
//       `&redirect_uri=${encodeURIComponent(redirectUri)}` +
//       `&scope=${encodeURIComponent(scopes)}` +
//       `&response_type=code`;

//     console.log("Redirecting to:", oauthUrl); // Log for debugging
//     return res.redirect(oauthUrl);
//   } catch (error) {
//     console.error("[redirectToFacebookInstagram][ERROR]", error.message);
//     return unknownError(res, error);
//   }
// };

export const redirectToFacebookPages = (req, res) => {
  try {
    const scopes = [
      "public_profile",
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "business_management",
    ].join(",");

    const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

    const oauthUrl =
      `https://www.facebook.com/v23.0/dialog/oauth` +
      `?client_id=${process.env.APP_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&auth_type=rerequest` + // Force re-prompt
      `&response_type=code`;

    return res.redirect(oauthUrl);
  } catch (error) {
    console.error("[redirectToFacebookPages][ERROR]", error.message);
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
      return badRequest(res, "No eligible Instagram-connected pages found.");
    }

    let htmlForm = `<h3>Select a Facebook Page</h3><form method="POST" action="/v1/api/socialMedia/select-page"><input type="hidden" name="access_token" value="${accessToken}" /><ul>`;
    eligiblePages.forEach((p) => {
      htmlForm += `
        <li>
          <label>
            <input type="radio" name="selectedPage" value='${JSON.stringify(
              p
            )}' required />
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

// export const handleFacebookInstagramCallback = async (req, res) => {
//   try {
//     const { code } = req.query;
//     if (!code) return badRequest(res, "Missing code parameter");

//     const tokenRes = await axios.get("https://graph.facebook.com/v23.0/oauth/access_token", {
//       params: {
//         client_id: process.env.APP_ID,
//         client_secret: process.env.APP_SECRET,
//         redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
//         code,
//       },
//     });

//     const accessToken = tokenRes.data.access_token;

//     const pagesRes = await axios.get("https://graph.facebook.com/v23.0/me/accounts", {
//       params: { access_token: accessToken },
//     });

//     const eligiblePages = [];

//     for (const page of pagesRes.data.data || []) {
//       const pageDetailsRes = await axios.get(`https://graph.facebook.com/v23.0/${page.id}`, {
//         params: {
//           fields: "instagram_business_account{name},name",
//           access_token: accessToken,
//         },
//       });

//       const pageDetails = pageDetailsRes.data;

//       if (pageDetails.instagram_business_account) {
//         const igAccountId = pageDetails.instagram_business_account.id;

//         const igAccountRes = await axios.get(`https://graph.facebook.com/v23.0/${igAccountId}`, {
//           params: {
//             fields: "username",
//             access_token: accessToken,
//           },
//         });

//         const igAccountData = igAccountRes.data;

//         eligiblePages.push({
//           pageId: page.id,
//           pageName: pageDetails.name,
//           igAccountId,
//           igUsername: igAccountData.username,
//           pageAccessToken: page.access_token,
//         });
//       }
//     }

//     if (!eligiblePages.length) {
//       return badRequest(res, "No Instagram-linked Facebook Pages found.");
//     }

//     const html = renderPageSelectionForm(eligiblePages, accessToken);
//     return res.send(html);
//   } catch (err) {
//     console.error("[handleFacebookInstagramCallback][ERROR]", err.message);
//     return unknownError(res, err);
//   }
// };

// export const handleFacebookPageCallback = async (req, res) => {
//   try {
//     const { code } = req.query;
//     if (!code) return badRequest(res, "Missing code parameter");

//     const tokenRes = await axios.get("https://graph.facebook.com/v23.0/oauth/access_token", {
//       params: {
//         client_id: process.env.APP_ID,
//         client_secret: process.env.APP_SECRET,
//         redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
//         code,
//       },
//     });

//     const accessToken = tokenRes.data.access_token;

//     const pagesRes = await axios.get("https://graph.facebook.com/v23.0/me/accounts", {
//       params: { access_token: accessToken },
//     });

//     const facebookPages = pagesRes.data.data.map((page) => ({
//       pageId: page.id,
//       pageName: page.name,
//       pageAccessToken: page.access_token,
//     }));

//     if (!facebookPages.length) {
//       return badRequest(res, "No Facebook Pages found.");
//     }

//     const html = renderPageSelectionForm(facebookPages, accessToken, "/v1/api/socialMedia/select-page-facebook");
//     return res.send(html);
//   } catch (err) {
//     console.error("[handleFacebookPageCallback][ERROR]", err.message);
//     return unknownError(res, err);
//   }
// };

// utils/renderForm.js

// const renderPageSelectionForm = (pages, accessToken, formAction = "/v1/api/socialMedia/select-page") => {
//   let htmlForm = `<h3>Select a Facebook Page</h3><form method="POST" action="${formAction}"><input type="hidden" name="access_token" value="${accessToken}" /><ul>`;

//   pages.forEach((p) => {
//     htmlForm += `
//       <li>
//         <label>
//           <input type="radio" name="selectedPage" value='${JSON.stringify(p)}' required />
//           ${p.pageName}${p.igUsername ? ` → @${p.igUsername}` : ""}
//         </label>
//       </li>
//     `;
//   });

//   htmlForm += `</ul><button type="submit">Connect</button></form>`;
//   return htmlForm;
// };

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

// export const selectPageForFacebook = async (req, res) => {
//   try {
//     const { selectedPage, access_token } = req.body;

//     if (!selectedPage || !access_token) {
//       return badRequest(res, "Missing selectedPage or access_token");
//     }

//     const parsed = JSON.parse(selectedPage);

//     const saved = await SocialMediaAccount.findOneAndUpdate(
//       { userId: parsed.pageId },
//       {
//         provider: "facebook_page",
//         userId: parsed.pageId,
//         accessToken: access_token,
//         refreshToken: null,
//         expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Optional expiry
//         facebookPageId: parsed.pageId,
//         facebookPageName: parsed.pageName,
//         facebookPageAccessToken: parsed.pageAccessToken,
//       },
//       { upsert: true, new: true, runValidators: true }
//     );

//     return success(res, "✅ Facebook Page connected successfully!", {
//       account: saved,
//     });
//   } catch (err) {
//     console.error("[selectPageForFacebook][ERROR]", err.message);
//     return unknownError(res, err);
//   }
// };

// get all facebook and instagram accounts

export const getAllConnectedAccounts = async (req, res) => {
  try {
    const accounts = await SocialMediaAccount.find({});

    const result = {
      facebook_pages: [],
      instagram_accounts: [],
    };

    accounts.forEach((account) => {
      // Facebook Pages from both instagram_business and facebook_page
      if (
        ["instagram_business", "facebook_page"].includes(account.provider) &&
        account.facebookPageId
      ) {
        result.facebook_pages.push({
          id: account._id,
          provider: account.provider,
          name: account.facebookPageName || account.username,
          pageId: account.facebookPageId,
          accessToken: account.accessToken,
          expiresAt: account.expiresAt,
        });
      }

      // Instagram Accounts from both instagram_business and instagram_basic
      if (
        ["instagram_business", "instagram_basic"].includes(account.provider)
      ) {
        result.instagram_accounts.push({
          id: account._id,
          provider: account.provider,
          name: account.instagramUsername || account.username,
          userId: account.userId,
          igAccountId: account.igAccountId || null,
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
        try {
          await axios.delete(
            `https://graph.facebook.com/v23.0/me/permissions `,
            {
              params: {
                access_token: account.facebookPageAccessToken,
              },
            }
          );
          revokeSuccess = true;
        } catch (err) {
          // Ignore specific OAuth errors if token is already revoked/expired
          const errorCode = err.response?.data?.error?.code;
          if (errorCode === 190 || errorCode === 458) {
            console.warn(
              "[TokenRevoke][WARN] Token already revoked or invalid"
            );
            revokeSuccess = true; // Consider it successfully revoked
          } else {
            revokeSuccess = false;
            revokeError = err.response?.data || err.message;
          }
        }
      } else if (
        account.provider === "instagram_business" ||
        account.provider === "instagram_basic"
      ) {
        // 🟩 Instagram: Revoke user token
        await axios.get(`https://api.instagram.com/oauth/revoke_token`, {
          params: {
            access_token: account.accessToken,
            client_id: process.env.INSTAGRAM_CLIENT_ID,
            client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
          },
        });
      } else {
        throw new Error(`Unsupported provider: ${account.provider}`);
      }
    } catch (revokeErr) {
      revokeSuccess = false;
      revokeError = revokeErr.response?.data || revokeErr.message;
      console.error("[TokenRevoke][ERROR]", revokeError);
    }

    account.accessToken = null;
    account.facebookPageAccessToken = null;
    account.expiresAt = null;
    await account.save();

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

const scheduledJobs = new Map();

// export const postToFacebookPage = async (req, res) => {
//   try {
//     const { pageId, message, mediaUrl, scheduleTime } = req.body;

//     const files = req.files || [];

//     if (!pageId || !message)
//       return badRequest(res, "Both pageId and message are required");

//     const account = await SocialMediaAccount.findOne({
//       facebookPageId: pageId,
//     });
//     if (!account || !account.accessToken)
//       return badRequest(res, "Invalid or unconnected page ID");

//     if (scheduleTime) {
//       const scheduledPost = await scheduleNewPost(
//         "facebook_page",
//         account._id,
//         message,
//         mediaUrl ? [mediaUrl] : [],
//         files,
//         new Date(scheduleTime),
//         req.user?._id,
//         account.facebookPageName,
//         null
//       );
//       return success(res, "Post scheduled successfully", {
//         scheduledPostId: scheduledPost._id,
//         scheduledTime: scheduledPost.scheduleTime,
//       });
//     }

//     const result = await postToFacebook(account, message, mediaUrl);
//     const postedContent = await savePostedContent(
//       "facebook_page",
//       account._id,
//       message,
//       mediaUrl ? [mediaUrl] : [],
//       files,
//       result.id,
//       null,
//       req.user?._id,
//       account.facebookPageName,
//       null
//     );

//     return success(res, "Posted to Facebook successfully", {
//       postId: result.id,
//       contentId: postedContent._id,
//     });
//   } catch (error) {
//     console.error("[postToFacebookPage][ERROR]", error.message);
//     return unknownError(res, error);
//   }
// };

// export const postToInstagramAccount = async (req, res) => {
//   try {
//     const { igUserId, caption, mediaUrl, scheduleTime } = req.body;
//     const files = req.files || [];

//     if (!igUserId || !caption || !mediaUrl)
//       return badRequest(res, "igUserId, caption, and mediaUrl are required");

//     const account = await SocialMediaAccount.findOne({ igAccountId: igUserId });
//     if (!account || !account.accessToken)
//       return badRequest(res, "Invalid or unconnected Instagram account");

//     if (scheduleTime) {
//       const scheduledPost = await scheduleNewPost(
//         "instagram_business",
//         account._id,
//         caption,
//         mediaUrl ? [mediaUrl] : [],
//         files,
//         new Date(scheduleTime),
//         req.user?._id,
//         null,
//         account.instagramUsername
//       );
//       return success(res, "Post scheduled successfully", {
//         scheduledPostId: scheduledPost._id,
//         scheduledTime: scheduledPost.scheduleTime,
//       });
//     }

//     const result = await postToInstagram(account, caption, mediaUrl);
//     const postedContent = await savePostedContent(
//       "instagram_business",
//       account._id,
//       caption,
//       mediaUrl ? [mediaUrl] : [],
//       files,
//       null,
//       result.id,
//       req.user?._id,
//       null,
//       account.instagramUsername
//     );
//     console.log("postedContent", postedContent);

//     return success(res, "Posted to Instagram successfully", {
//       mediaId: result.id,
//       contentId: postedContent._id,
//     });
//   } catch (error) {
//     console.error("[postToInstagram][ERROR]", error.message);
//     return unknownError(res, error);
//   }
// };

export const postToFacebookPage = async (req, res) => {
  try {
    const { pageId, message, mediaUrl, scheduleTimes } = req.body; // scheduleTimes is now an array
    const files = req.files || [];
    const organizationId = req.employee.organizationId;

    if (!pageId || !message)
      return badRequest(res, "Both pageId and message are required");

    const account = await SocialMediaAccount.findOne({
      facebookPageId: pageId,
    });
    if (!account || !account.accessToken)
      return badRequest(res, "Invalid or unconnected page ID");

    if (scheduleTimes && scheduleTimes.length > 0) {
      const scheduledPost = await scheduleNewPost(
        "facebook_page",
        account._id,
        message,
        mediaUrl ? [mediaUrl] : [],
        files,
        scheduleTimes,
        req.user?._id,
        account.facebookPageName,
        null,
        organizationId
      );
      return success(res, "Post scheduled successfully", {
        scheduledPostId: scheduledPost._id,
        scheduledTimes: scheduledPost.scheduleTimes,
      });
    }

    const result = await postToFacebook(account, message, mediaUrl);
    const postedContent = await savePostedContent(
      "facebook_page",
      account._id,
      message,
      mediaUrl ? [mediaUrl] : [],
      files,
      result.id,
      null,
      req.user?._id,
      account.facebookPageName,
      null,
      organizationId
    );

    return success(res, "Posted to Facebook successfully", {
      postId: result.id,
      contentId: postedContent._id,
    });
  } catch (error) {
    console.error("[postToFacebookPage][ERROR]", error.message);
    return unknownError(res, error);
  }
};

export const postToInstagramAccount = async (req, res) => {
  try {
    const { igUserId, caption, mediaUrl, scheduleTimes } = req.body; // scheduleTimes is now an array
    const files = req.files || [];
    const organizationId = req.employee.organizationId;

    if (!igUserId || !caption || !mediaUrl)
      return badRequest(res, "igUserId, caption, and mediaUrl are required");

    const account = await SocialMediaAccount.findOne({ igAccountId: igUserId });
    if (!account || !account.accessToken)
      return badRequest(res, "Invalid or unconnected Instagram account");

    if (scheduleTimes && scheduleTimes.length > 0) {
      const scheduledPost = await scheduleNewPost(
        "instagram_business",
        account._id,
        caption,
        mediaUrl ? [mediaUrl] : [],
        files,
        scheduleTimes,
        req.user?._id,
        null,
        account.instagramUsername,
        organizationId
      );
      return success(res, "Post scheduled successfully", {
        scheduledPostId: scheduledPost._id,
        scheduledTimes: scheduledPost.scheduleTimes,
      });
    }

    const result = await postToInstagram(account, caption, mediaUrl);
    const postedContent = await savePostedContent(
      "instagram_business",
      account._id,
      caption,
      mediaUrl ? [mediaUrl] : [],
      files,
      null,
      result.id,
      req.user?._id,
      null,
      account.instagramUsername,
      organizationId
    );
    console.log("postedContent", postedContent);

    return success(res, "Posted to Instagram successfully", {
      mediaId: result.id,
      contentId: postedContent._id,
    });
  } catch (error) {
    console.error("[postToInstagram][ERROR]", error.message);
    return unknownError(res, error);
  }
};

// export const postToInstagramDirectly = async (req, res) => {
//   try {
//     const { igUserId, caption, mediaUrl } = req.body;
//     const files = req.files || [];

//     if (!igUserId || !caption || !mediaUrl) {
//       return badRequest(res, "igUserId, caption, and mediaUrl are required");
//     }

//     const account = await SocialMediaAccount.findOne({ userId: igUserId });
//     if (!account || !account.accessToken) {
//       return badRequest(res, "Invalid or unconnected Instagram account");
//     }

//     const result = await postToInstagramDirect(account, caption, mediaUrl);

//     return success(res, "Posted to Instagram successfully", {
//       mediaId: result.id,
//     });
//   } catch (error) {
//     console.error("[postToInstagram][ERROR]", error.message);
//     return unknownError(res, error);
//   }
// };

export const postToInstagramDirectly = async (req, res) => {
  try {
    const { igUserId, caption, mediaUrl, scheduleTimes } = req.body; // scheduleTimes is now an array
    const files = req.files || [];
    const organizationId = req.employee.organizationId;

    if (!igUserId || !caption || !mediaUrl) {
      return badRequest(res, "igUserId, caption, and mediaUrl are required");
    }

    const account = await SocialMediaAccount.findOne({ userId: igUserId });
    if (!account || !account.accessToken) {
      return badRequest(res, "Invalid or unconnected Instagram account");
    }

    // Scheduling
    if (scheduleTimes && scheduleTimes.length > 0) {
      const scheduledPost = await scheduleNewPost(
        "instagram_basic",
        account._id,
        caption,
        mediaUrl ? [mediaUrl] : [],
        files,
        scheduleTimes,
        req.user?._id,
        null,
        account.username,
        organizationId
      );
      return success(res, "Post scheduled successfully", {
        scheduledPostId: scheduledPost._id,
        scheduledTimes: scheduledPost.scheduleTimes,
      });
    }

    // Immediate posting
    const result = await postToInstagramDirect(account, caption, mediaUrl);
    const postedContent = await savePostedContent(
      "instagram_basic",
      account._id,
      caption,
      mediaUrl ? [mediaUrl] : [],
      files,
      null,
      result.id,
      req.user?._id,
      null,
      account.instagramUsername,
      organizationId
    );
    console.log("postedContent", postedContent);

    return success(res, "Posted to Instagram successfully", {
      mediaId: result.id,
      contentId: postedContent._id,
    });
  } catch (error) {
    console.error("[postToInstagramDirectly][ERROR]", error.message);
    return unknownError(res, error);
  }
};

export const saveSocialMediaDraft = asyncHandler(async (req, res) => {
  const { message, mediaUrls = [], accountIds = [] } = req.body;
  const mediaFiles = req.files || [];
  const organizationId = req.employee.organizationId;

  // Validate inputs
  if (!message && mediaUrls.length === 0 && mediaFiles.length === 0) {
    return badRequest(res, "Message or media files are required");
  }

  if (!Array.isArray(accountIds) || accountIds.length === 0) {
    return badRequest(res, "At least one social media account ID is required");
  }

  // Find account details
  const accounts = await SocialMediaAccount.find({
    _id: { $in: accountIds },
  });

  if (accounts.length === 0) {
    return badRequest(res, "No valid accounts found for provided IDs");
  }

  const platforms = [];
  let facebookPageId = null;
  let instagramUserId = null;
  let facebookPageName = null;
  let instagramAccountName = null;

  accounts.forEach((account) => {
    if (account.provider === "facebook_page") {
      platforms.push("facebook_page");
      facebookPageId = account.facebookPageId;
      facebookPageName = account.facebookPageName;
    } else if (account.provider === "instagram_business") {
      platforms.push("instagram_business");
      instagramUserId = account.igAccountId;
      instagramAccountName = account.instagramUsername;
    }
  });

  if (platforms.length === 0) {
    return badRequest(res, "No valid platforms found in selected accounts");
  }

  try {
    const draftPost = await SocialMediaContent.create({
      message,
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls],
      platforms,
      status: "draft",
      organizationId,
      postType: "UGC",
      ...(facebookPageId && { facebookPageId }),
      ...(instagramUserId && { instagramUserId }),
      ...(facebookPageName && { facebookPageName }),
      ...(instagramAccountName && { instagramAccountName }),
    });

    return success(res, "Social media draft saved successfully", draftPost);
  } catch (error) {
    console.error("Error saving social media draft:", error);
    return badRequest(res, "Failed to save draft");
  }
});

export const getSocialMediaDrafts = asyncHandler(async (req, res) => {
  console.log("organizationId", 1);

  const organizationId = req.employee.organizationId;
  console.log("organizationId", organizationId);

  const drafts = await SocialMediaContent.find({
    status: "draft",
    organizationId,
  }).sort({ createdAt: -1 });

  return success(res, "Social media drafts fetched successfully", drafts);
});

// export const editSocialMediaDraft = asyncHandler(async (req, res) => {
//   const { draftId } = req.params;
//   const { message, mediaUrls, accountIds } = req.body;
//   const mediaFiles = req.files || [];
//   const organizationId = req.employee.organizationId;

//   // 1. Find the existing draft and ensure it belongs to the user's organization
//   const draft = await SocialMediaContent.findOne({
//     _id: draftId,
//     status: "draft",
//     organizationId,
//   });

//   if (!draft) {
//     return notFound(res, "Draft post not found or has already been processed");
//   }

//   // 2. Validate that the update doesn't leave the draft empty
//   const hasContent =
//     message !== undefined ||
//     (mediaUrls && mediaUrls.length > 0) ||
//     mediaFiles.length > 0;

//   if (
//     !hasContent &&
//     (!draft.message && draft.mediaUrls.length === 0)
//   ) {
//     return badRequest(res, "Draft must contain a message or media.");
//   }

//   // 3. Update basic fields if they are provided in the request
//   if (message !== undefined) {
//     draft.message = message;
//   }
//   if (mediaUrls !== undefined) {
//     // Note: Assumes frontend sends the full array of URLs on update
//     draft.mediaUrls = Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls];
//   }

//   // 4. If accountIds are provided, update platform-specific data
//   if (accountIds) {
//     if (!Array.isArray(accountIds) || accountIds.length === 0) {
//       return badRequest(
//         res,
//         "At least one social media account ID is required when updating accounts."
//       );
//     }

//     const accounts = await SocialMediaAccount.find({
//       _id: { $in: accountIds },
//       organizationId, // Ensure accounts belong to the same organization
//     });

//     if (accounts.length !== accountIds.length) {
//       return badRequest(res, "One or more account IDs are invalid.");
//     }

//     // Reset platform data and recalculate based on new accounts
//     let platforms = [];
//     let facebookPageId = null;
//     let instagramUserId = null;
//     let facebookPageName = null;
//     let instagramAccountName = null;

//     accounts.forEach((account) => {
//       if (account.provider === "facebook_page") {
//         platforms.push("facebook_page");
//         facebookPageId = account.facebookPageId;
//         facebookPageName = account.facebookPageName;
//       } else if (account.provider === "instagram_business") {
//         platforms.push("instagram_business");
//         instagramUserId = account.igAccountId;
//         instagramAccountName = account.instagramUsername;
//       }
//     });

//     // Update draft with the new platform information
//     draft.platforms = platforms;
//     draft.facebookPageId = facebookPageId;
//     draft.facebookPageName = facebookPageName;
//     draft.instagramUserId = instagramUserId;
//     draft.instagramAccountName = instagramAccountName;
//   }

//   try {
//     const updatedDraft = await draft.save();
//     return success(res, "Draft updated successfully", updatedDraft);
//   } catch (error) {
//     console.error("Error updating social media draft:", error);
//     return badRequest(res, "Failed to update draft");
//   }
// });

export const editSocialMediaDraft = asyncHandler(async (req, res) => {
  const { draftId } = req.params;
  const { message, mediaUrls } = req.body;
  const mediaFiles = req.files || [];
  const organizationId = req.employee.organizationId;

  // 1. Find the existing draft that belongs to the organization
  const draft = await SocialMediaContent.findOne({
    _id: draftId,
    status: "draft",
    organizationId,
  });

  if (!draft) {
    return notFound(res, "Draft post not found or already processed");
  }

  // 2. Ensure at least message or media is present
  const hasContent =
    message !== undefined ||
    (mediaUrls && mediaUrls.length > 0) ||
    mediaFiles.length > 0;

  if (!hasContent && !draft.message && draft.mediaUrls.length === 0) {
    return badRequest(res, "Draft must contain a message or media.");
  }

  // 3. Update message if provided
  if (message !== undefined) {
    draft.message = message;
  }

  // 4. Update media URLs if provided
  if (mediaUrls !== undefined) {
    draft.mediaUrls = Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls];
  }

  // (Optional) 5. Handle uploaded files here if needed
  // If you're storing uploaded media and appending to mediaUrls
  // draft.mediaUrls.push(...newUploadedFileUrls);

  try {
    const updatedDraft = await draft.save();
    return success(res, "Draft updated successfully", updatedDraft);
  } catch (error) {
    console.error("Error updating social media draft:", error);
    return badRequest(res, "Failed to update draft");
  }
});

export const deleteSocialMediaDraft = asyncHandler(async (req, res) => {
  const { draftId } = req.params;

  if (!draftId) {
    return badRequest(res, "Draft ID is required");
  }

  const deletedDraft = await SocialMediaContent.findOneAndDelete({
    _id: draftId,
    status: "draft",
  });

  if (!deletedDraft) {
    return badRequest(res, "Draft not found or already published");
  }

  return success(res, "Draft deleted successfully", deletedDraft);
});

export const publishDraft = asyncHandler(async (req, res) => {
  const { draftId } = req.params;

  const draft = await SocialMediaContent.findOne({
    _id: draftId,
    status: "draft",
  });

  if (!draft) {
    return notFound(res, "Draft not found or already published");
  }

  const results = [];

  for (const platform of draft.platforms) {
    try {
      const account = await SocialMediaAccount.findOne({
        provider: platform,
        ...(platform === "facebook_page"
          ? { facebookPageId: draft.facebookPageId }
          : { igAccountId: draft.instagramUserId }),
      });

      if (!account) {
        throw new Error(`No connected ${platform} account found`);
      }

      const mediaUrl = draft.mediaUrls?.[0] || draft.mediaFiles?.[0]?.path;
      let postedData;

      if (platform === "facebook_page") {
        if (!account.facebookPageAccessToken) {
          throw new Error("Missing Facebook page access token");
        }
        postedData = await postToFacebook(account, draft.message, mediaUrl);
        draft.facebookPostId = postedData.id;
      }

      if (platform === "instagram_business") {
        if (!account.accessToken) {
          throw new Error("Missing Instagram access token");
        }
        postedData = await postToInstagram(account, draft.message, mediaUrl);
        draft.instagramMediaId = postedData.id;
      }

      results.push({
        platform,
        status: "success",
        postId: postedData.id,
      });
    } catch (error) {
      console.error(`Failed to post to ${platform}:`, error.message);
      results.push({
        platform,
        status: "failed",
        error: error.message,
      });
    }
  }

  draft.status = "posted";
  draft.postedAt = new Date();
  await draft.save();

  return success(res, "Draft published successfully", {
    draftId: draft._id,
    results,
  });
});

export const getScheduledPostsByOrganization = async (req, res) => {
  try {
    const organizationId = req.employee.organizationId;

    if (!organizationId) {
      return badRequest(res, "Organization ID is required");
    }

    const scheduledPosts = await SocialPostSchedule.find({
      organizationId: new ObjectId(organizationId),
      status: "scheduled",
    }).sort({ scheduleTime: 1 });

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return notFound(res, "No scheduled posts found for this organization");
    }

    return success(res, "Scheduled posts fetched successfully", scheduledPosts);
  } catch (error) {
    console.error("Error fetching scheduled posts:", error);
    return unknownError(res, error);
  }
};

export const cancelScheduledPost = asyncHandler(async (req, res) => {
  const { scheduledPostId } = req.params;

  const scheduledPost = await SocialPostSchedule.findById(scheduledPostId);
  if (!scheduledPost) {
    return badRequest(res, "Scheduled post not found");
  }

  if (scheduledPost.status !== "scheduled") {
    return badRequest(
      res,
      `Cannot cancel post with status: ${scheduledPost.status}`
    );
  }

  // Cancel all scheduled jobs
  if (scheduledPost.jobNames?.length > 0) {
    scheduledPost.jobNames.forEach((jobName) => {
      const jobKey = `${scheduledPostId}-${jobName}`;
      const job = scheduledJobs.get(jobKey);
      if (job) {
        job.cancel();
        scheduledJobs.delete(jobKey);
      }
    });
  }

  // Update DB status to cancelled
  scheduledPost.status = "canceled";
  await scheduledPost.save();

  // Clean up saved files
  if (scheduledPost.mediaFiles?.length > 0) {
    await Promise.all(
      scheduledPost.mediaFiles.map(async (fileInfo) => {
        try {
          await fs.unlink(fileInfo.path);
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      })
    );
  }

  return success(res, "Scheduled post cancelled successfully", scheduledPost);
});

export const reschedulePost = asyncHandler(async (req, res) => {
  const { scheduledPostId } = req.params;
  const { newScheduleTime } = req.body;

  if (!newScheduleTime) return badRequest(res, "newScheduleTime is required");

  const scheduledPost = await SocialPostSchedule.findById(scheduledPostId);
  if (!scheduledPost) {
    return badRequest(res, "Scheduled post not found");
  }

  if (scheduledPost.status !== "scheduled") {
    return badRequest(
      res,
      `Cannot reschedule post with status: ${scheduledPost.status}`
    );
  }

  const newScheduleDate = new Date(newScheduleTime);
  if (isNaN(newScheduleDate.getTime())) {
    return badRequest(res, "Invalid newScheduleTime format");
  }

  if (newScheduleDate <= new Date()) {
    return badRequest(res, "New schedule time must be in the future");
  }

  // Cancel existing jobs
  if (scheduledPost.jobNames?.length > 0) {
    scheduledPost.jobNames.forEach((jobName) => {
      const jobKey = `${scheduledPostId}-${jobName}`;
      const job = scheduledJobs.get(jobKey);
      if (job) {
        job.cancel();
        scheduledJobs.delete(jobKey);
      }
    });
  }

  // Schedule new job
  const jobName = `rescheduled-${Date.now()}`;
  const job = schedule.scheduleJob(jobName, newScheduleDate, async () => {
    await executeScheduledPost(scheduledPostId, newScheduleDate);
  });

  const jobKey = `${scheduledPostId}-${jobName}`;
  scheduledJobs.set(jobKey, job);

  // Update DB
  scheduledPost.scheduleTimes = [newScheduleDate];
  scheduledPost.jobNames = [jobName];
  scheduledPost.status = "scheduled";
  scheduledPost.scheduleStatuses = [
    {
      time: newScheduleDate,
      status: "pending",
    },
  ];
  await scheduledPost.save();

  const displayTime = format(newScheduleDate, "yyyy-MM-dd'T'HH:mm:ss'Z'"); // ✅ Now works

  return success(res, `Post rescheduled for ${displayTime}`, {
    scheduledPostId: scheduledPost._id,
    newScheduledTime: displayTime,
    newScheduledTimeISO: newScheduleDate.toISOString(),
  });
});
