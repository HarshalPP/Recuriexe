import express from 'express';
import passport from 'passport';
import {verifyEmployeeToken } from "../../middleware/authicationmiddleware.js"

const router = express.Router();

router.get('/google/gmail',verifyEmployeeToken,
  passport.authenticate('google', {
   
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send'],
   
    accessType: 'offline',
    prompt: 'consent'
  })
);

router.get(
  '/google/callback',verifyEmployeeToken,
  passport.authenticate('google', { failureRedirect: '/' }),

  (req, res) => {
      console.log("🚀 Callback hit — user:", req.user);
    const message = encodeURIComponent('Successfully logged in with Google');
    res.redirect(`http://localhost:3001/email-setup?message=${message}`);
  }
);






export default router;
