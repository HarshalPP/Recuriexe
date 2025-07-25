// routes/socialAuth.routes.js
import express from "express";
import {
  // redirectToFacebookInstagram,
  // handleFacebookCallback,
  // selectPageForInstagram,
  getAllConnectedAccounts,
  disconnectAccount,
  postToFacebookPage,
  postToInstagramDirectly,
  postToInstagramAccount,
  saveSocialMediaDraft,
  getSocialMediaDrafts,
  editSocialMediaDraft,
  publishDraft,
  deleteSocialMediaDraft,
  getScheduledPostsByOrganization,
  cancelScheduledPost,
  reschedulePost,
} from "../../controllers/SociaMedia Controller/facebook.auth.js";

import {
  redirectToInstagramDirect,
  handleInstagramCallback,
  getInstagramMedia,
} from "../../controllers/SociaMedia Controller/instagram.auth.js";


import {
  redirectToFacebookPages,
  redirectToFacebookInsta,
  handleFacebookPageCallback,
  handleFacebookInstagramCallback,
  selectPagesForInstagram,
  selectPagesForFacebook,
} from "../../controllers/SociaMedia Controller/socialMedia.js";
const router = express.Router();
import {startIndeedAuth,handleIndeedOAuthCallback,finalizeEmployerSelection,createJobPosting} from "../../controllers/SociaMedia Controller/indeed.controller.js"


import {verifyEmployeeToken } from "../../middleware/authicationmiddleware.js"


// Facebook + Instagram Business Flow

// router.get("/instagram", redirectToFacebookInstagram); // Facebook OAuth to get Instagram
// router.get("/facebook/callback", handleFacebookCallback); // Handle callback
// router.post("/select-page", selectPageForInstagram); // Select page & save IG account

// Instagram Direct Login Flow

router.get("/instagram/direct", redirectToInstagramDirect); // Instagram-only login
router.get("/instagram/direct/callback", handleInstagramCallback); // Handle Instagram callback

// Instagram Media Route

router.get("/instagram/media/:userId", getInstagramMedia); // Fetch media for user

// Account Management

router.get("/accounts", getAllConnectedAccounts); // Get all connected accounts
router.delete("/accounts/:accountId", disconnectAccount); // Revoke token + delete account

// posting to accounts
router.post("/facebook/post", postToFacebookPage);
router.post("/instagram/post", postToInstagramAccount);
router.post("/instagram/direct/post", postToInstagramDirectly);

// auth.routes.js or app.js

router.get("/facebook/pages", redirectToFacebookPages);
router.get("/facebook/instagram", redirectToFacebookInsta);

router.get("/facebook/callback", handleFacebookPageCallback);
router.get("/instagram/callback", handleFacebookInstagramCallback);

router.post("/auth/facebook/instagram/select", selectPagesForInstagram);
router.post("/auth/facebook/pages/select", selectPagesForFacebook);


router.get("/indeed/start", startIndeedAuth); // Initiate OAuth flow
router.get("/indeed/callback", handleIndeedOAuthCallback); // Handle callback
router.post("/indeed/finalize", finalizeEmployerSelection);
router.post("/indeed/createPost", createJobPosting);
// router.post("/token/refresh", refreshIndeedTokenController); // Refresh expired token


// Draft Routes
router.post("/draft",verifyEmployeeToken, saveSocialMediaDraft); // Save new draft
router.get("/all/drafts", verifyEmployeeToken,getSocialMediaDrafts); // Get all drafts
router.put("/draft/:draftId", verifyEmployeeToken,editSocialMediaDraft); // Edit draft
router.delete("/draft/:draftId", deleteSocialMediaDraft); // Delete draft
router.post("/draft/:draftId/publish", publishDraft); // Publish draft
router.get("/scheduled-posts",verifyEmployeeToken, getScheduledPostsByOrganization);

router.post("/api/social/cancel-scheduled-post/:scheduledPostId", cancelScheduledPost);
router.post("/api/social/reschedule-post/:scheduledPostId", reschedulePost);

export default router;

