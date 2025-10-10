import express from 'express';
import passport from 'passport';

import {
  success,
  badRequest,
  notFound,
  unknownError,
} from "../../formatters/globalResponse.js";
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();

const FRONTEND_BASEURL = 'https://hr-portal.fincooperstech.com'



router.get('/google/gmail', (req, res, next) => {
  const token = req.query.token;
  if (!token) {
    return badRequest(res, 'Missing employee token in query');
  }
  passport.authenticate('google', {
    scope: ['profile', 'email',
      'https://www.googleapis.com/auth/gmail.send',
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    accessType: 'offline',
    prompt: 'consent',
    state: token, // 👈 pass token here
  })(req, res, next);
});
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate(
      'google',
      { session: false },
      (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.redirect('/');

        const msg = encodeURIComponent('Successfully logged in with Google');
        //  const redirectUrl = `${process.env.FRONTEND_BASEURL}/employeeSetup/Linkedin?message=${msg}`;
        const redirectUrl = `${FRONTEND_BASEURL}/employeeSetup/Linkedin`;
        res.redirect(redirectUrl);
      },
    )(req, res, next);
  },
);


export default router;
