import express from 'express';
import passport from 'passport';
// import { sendMail } from '../controller/mailController.js';
// import  upload  from '../controller/upload.js';

const router = express.Router();

router.get('/google/gmail',
  passport.authenticate('google', {
   
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send'],
   
    accessType: 'offline',
    prompt: 'consent'
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),

  (req, res) => {
      console.log("🚀 Callback hit — user:", req.user);
    // Option 1: Redirect to frontend with success message as query param
    const message = encodeURIComponent('Successfully logged in with Google');
    res.redirect(`http://localhost:3001/email-setup?message=${message}`);
  }
);

// router.post('/send', upload.single('file'), sendMail);

export default router;
