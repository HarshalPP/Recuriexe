// routes/socialAuth.routes.js
import express from "express";
import {
  redirectToFacebookInstagram,
  handleFacebookCallback,
  selectPageForInstagram,
  getAllConnectedAccounts,
  disconnectAccount
} from "../../controllers/SociaMedia Controller/facebook.auth.js";

import {
  redirectToInstagramDirect,
  handleInstagramCallback,
  getInstagramMedia,
} from "../../controllers/SociaMedia Controller/instagram.auth.js";

const router = express.Router();

// Facebook + Instagram Business Flow

router.get("/instagram", redirectToFacebookInstagram); // Facebook OAuth to get Instagram
router.get("/facebook/callback", handleFacebookCallback); // Handle callback
router.post("/select-page", selectPageForInstagram); // Select page & save IG account


// Instagram Direct Login Flow

router.get("/instagram/direct", redirectToInstagramDirect); // Instagram-only login
router.get("/instagram/callback", handleInstagramCallback); // Handle Instagram callback

// Instagram Media Route

router.get("/instagram/media/:userId", getInstagramMedia); // Fetch media for user

// Account Management

router.get("/accounts", getAllConnectedAccounts); // Get all connected accounts
router.delete("/accounts/:accountId", disconnectAccount); // Revoke token + delete account

export default router;