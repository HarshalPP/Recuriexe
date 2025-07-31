import axios from "axios";
import SocialMediaAccount from "../../models/Social Media/SocialMediaAccount.js";
import {
  success,
  badRequest,
  unknownError,
} from "../../formatters/globalResponse.js";

export const redirectToFacebookPages = (req, res) => {
  try {
    const scopes = [
      "pages_show_list",
      "public_profile",
      "pages_manage_posts",
      "pages_read_engagement",
    ].join(",");
    // const redirectUri = "http://localhost:4000/v1/api/socialMedia/auth/facebook/pages/callback";
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

    const oauthUrl =
      `https://www.facebook.com/v23.0/dialog/oauth` +
      `?client_id=${process.env.APP_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&response_type=code`;

    return res.redirect(oauthUrl);
  } catch (error) {
    console.error("[redirectToFacebookPages][ERROR]", error.message);
    return unknownError(res, error);
  }
};

export const redirectToFacebookInsta = (req, res) => {
  try {
    const scopes = [
      "instagram_basic",
      "pages_show_list",
      "instagram_content_publish",
      "manage_pages",
    ].join(",");
    const redirectUri = process.env.FACEBOOKTOINSTA_REDIRECT_URI;

    const oauthUrl =
      `https://www.facebook.com/v23.0/dialog/oauth` +
      `?client_id=${process.env.APP_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&response_type=code`;

    return res.redirect(oauthUrl);
  } catch (error) {
    console.error("[redirectToFacebookInstagram][ERROR]", error.message);
    return unknownError(res, error);
  }
};

// export const handleFacebookPageCallback = async (req, res) => {
//   try {
//     const { code } = req.query;
//     if (!code) return badRequest(res, "Missing code");

//     // Get short-lived token
//     const tokenRes = await axios.get(
//       "https://graph.facebook.com/v23.0/oauth/access_token",
//       {
//         params: {
//           client_id: process.env.APP_ID,
//           client_secret: process.env.APP_SECRET,
//           // redirect_uri: "http://localhost:4000/v1/api/socialMedia/auth/facebook/pages/callback",
//           redirect_uri: process.env.FACEBOOK_REDIRECT_URI,

//           code,
//         },
//       }
//     );

//     const accessToken = tokenRes.data.access_token;

//     // Get user's pages
//     const pagesRes = await axios.get(
//       "https://graph.facebook.com/v23.0/me/accounts",
//       {
//         params: { access_token: accessToken },
//       }
//     );

//     const facebookPages = pagesRes.data.data.map((page) => ({
//       pageId: page.id,
//       pageName: page.name,
//       pageAccessToken: page.access_token,
//     }));

//     if (!facebookPages.length)
//       return badRequest(res, "No Facebook Pages found.");

//     const html = renderPageSelectionForm(
//       facebookPages,
//       accessToken,
//       "/v1/api/socialMedia/auth/facebook/pages/select"
//     );

//     return res.send(html);
//   } catch (err) {
//     console.error("[handleFacebookPageCallback][ERROR]", err.message);
//     return unknownError(res, err);
//   }
// };

export const handleFacebookPageCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return badRequest(res, "Missing code");

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

    const shortLivedToken = tokenRes.data.access_token;

    // Step 2: Exchange short-lived token for long-lived token
    const longLivedTokenRes = await axios.get(
      "https://graph.facebook.com/v23.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: process.env.APP_ID,
          client_secret: process.env.APP_SECRET,
          fb_exchange_token: shortLivedToken,
        },
      }
    );

    const longLivedToken = longLivedTokenRes.data.access_token;

    // Step 3: Get user's pages using long-lived token
    const pagesRes = await axios.get(
      "https://graph.facebook.com/v23.0/me/accounts",
      {
        params: {
          access_token: longLivedToken,
        },
      }
    );

    const facebookPages = pagesRes.data.data.map((page) => ({
      pageId: page.id,
      pageName: page.name,
      pageAccessToken: page.access_token,
    }));

    if (!facebookPages.length)
      return badRequest(res, "No Facebook Pages found.");

    const html = renderPageSelectionForm(
      facebookPages,
      longLivedToken,
      "/v1/api/socialMedia/auth/facebook/pages/select"
    );

    return res.send(html);
  } catch (err) {
    console.error("[handleFacebookPageCallback][ERROR]", err.message);
    return unknownError(res, err);
  }
};

// export const handleFacebookInstagramCallback = async (req, res) => {
//   try {
//     const { code } = req.query;
//     if (!code) return badRequest(res, "Missing code");

//     const tokenRes = await axios.get(
//       "https://graph.facebook.com/v23.0/oauth/access_token",
//       {
//         params: {
//           client_id: process.env.APP_ID,
//           client_secret: process.env.APP_SECRET,
//           redirect_uri: process.env.FACEBOOKTOINSTA_REDIRECT_URI,
//           code,
//         },
//       }
//     );

//     const accessToken = tokenRes.data.access_token;

//     const pagesRes = await axios.get(
//       "https://graph.facebook.com/v23.0/me/accounts ",
//       {
//         params: { access_token: accessToken },
//       }
//     );

//     const eligiblePages = [];

//     for (const page of pagesRes.data.data || []) {
//       const pageDetailsRes = await axios.get(
//         `https://graph.facebook.com/v23.0/ ${page.id}`,
//         {
//           params: {
//             fields: "instagram_business_account{name},name",
//             access_token: accessToken,
//           },
//         }
//       );

//       const pageDetails = pageDetailsRes.data;

//       if (pageDetails.instagram_business_account) {
//         const igAccountId = pageDetails.instagram_business_account.id;

//         const igAccountRes = await axios.get(
//           `https://graph.facebook.com/v23.0/ ${igAccountId}`,
//           {
//             params: {
//               fields: "username",
//               access_token: accessToken,
//             },
//           }
//         );

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

//     const html = renderPageSelectionForm(
//       eligiblePages,
//       accessToken,
//       "/v1/api/socialMedia/auth/facebook/instagram/select", // ✅ Correct route
//       "Select a Facebook Page with Instagram Account" // ✅ Custom heading
//     );

//     return res.send(html);
//   } catch (err) {
//     console.error("[handleFacebookInstagramCallback][ERROR]", err.message);
//     return unknownError(res, err);
//   }
// };

export const handleFacebookInstagramCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return badRequest(res, "Missing code");

    // Step 1: Get short-lived token
    const tokenRes = await axios.get(
      "https://graph.facebook.com/v23.0/oauth/access_token",
      {
        params: {
          client_id: process.env.APP_ID,
          client_secret: process.env.APP_SECRET,
          redirect_uri: process.env.FACEBOOKTOINSTA_REDIRECT_URI,
          code,
        },
      }
    );

    const shortLivedToken = tokenRes.data.access_token;
    console.log("shortLivedToken:--", shortLivedToken);

    // Step 2: Exchange short-lived token for long-lived token
    const longLivedTokenRes = await axios.get(
      "https://graph.facebook.com/v23.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: process.env.APP_ID,
          client_secret: process.env.APP_SECRET,
          fb_exchange_token: shortLivedToken,
        },
      }
    );

    const longLivedToken = longLivedTokenRes.data.access_token;
    console.log("longLivedToken:--", longLivedToken);

    // Add this before the pages call
const userRes = await axios.get("https://graph.facebook.com/v23.0/me", {
  params: { access_token: longLivedToken }
});
console.log("User info:", userRes.data);


    // Step 3: Get user's pages using long-lived token
    const pagesRes = await axios.get(
      "https://graph.facebook.com/v23.0/me/accounts",
      {
        params: {
          access_token: longLivedToken,
        },
      }
    );
    console.log("pagesRes",pagesRes);
    
    // Check if data exists
    if (!pagesRes.data || !pagesRes.data.data) {
      return badRequest(res, "No pages found or insufficient permissions");
    }

    const eligiblePages = [];

    for (const page of pagesRes.data.data || []) {
      const pageDetailsRes = await axios.get(
        `https://graph.facebook.com/v23.0/${page.id}`,
        {
          params: {
            fields: "instagram_business_account{name},name",
            access_token: longLivedToken,
          },
        }
      );

      const pageDetails = pageDetailsRes.data;

      if (pageDetails.instagram_business_account) {
        const igAccountId = pageDetails.instagram_business_account.id;

        const igAccountRes = await axios.get(
          `https://graph.facebook.com/v23.0/${igAccountId}`,
          {
            params: {
              fields: "username",
              access_token: longLivedToken,
            },
          }
        );

        const igAccountData = igAccountRes.data;
        console.log("igAccountData:---", igAccountData);

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
      return badRequest(res, "No Instagram-linked Facebook Pages found.");
    }

    const html = renderPageSelectionForm(
      eligiblePages,
      longLivedToken,
      "/v1/api/socialMedia/auth/facebook/instagram/select", // ✅ Correct route
      "Select a Facebook Page with Instagram Account" // ✅ Custom heading
    );

    return res.send(html);
  } catch (err) {
    console.error("[handleFacebookInstagramCallback][ERROR]", err.message);
    return unknownError(res, err);
  }
};
const renderPageSelectionForm = (
  pages,
  accessToken,
  formAction = "/v1/api/socialMedia/auth/facebook/pages/select",
  formTitle = "Select a Facebook Page"
) => {
  let htmlForm = `<h3>${formTitle}</h3>
    <form method="POST" action="${formAction}">
      <input type="hidden" name="access_token" value="${accessToken}" />
      <ul>`;

  pages.forEach((p) => {
    htmlForm += `
      <li>
        <label>
          <input type="radio" name="selectedPage" value='${JSON.stringify(
            p
          )}' required />
          ${p.pageName}${p.igUsername ? ` → Instagram: @${p.igUsername}` : ""}
        </label>
      </li>`;
  });

  htmlForm += `
      </ul>
      <button type="submit">Connect</button>
    </form>`;

  return htmlForm;
};

// Save selected Facebook Page + Instagram Account

export const selectPagesForInstagram = async (req, res) => {
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

export const selectPagesForFacebook = async (req, res) => {
  try {
    const { selectedPage, access_token } = req.body;

    if (!selectedPage || !access_token) {
      return badRequest(res, "Missing selectedPage or access_token");
    }

    const parsed = JSON.parse(selectedPage);

    const saved = await SocialMediaAccount.findOneAndUpdate(
      { userId: parsed.pageId },
      {
        provider: "facebook_page",
        userId: parsed.pageId,
        accessToken: access_token,
        refreshToken: null,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Optional expiry
        facebookPageId: parsed.pageId,
        facebookPageName: parsed.pageName,
        facebookPageAccessToken: parsed.pageAccessToken,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return success(res, "✅ Facebook Page connected successfully!", {
      account: saved,
    });
  } catch (err) {
    console.error("[selectPageForFacebook][ERROR]", err.message);
    return unknownError(res, err);
  }
};
