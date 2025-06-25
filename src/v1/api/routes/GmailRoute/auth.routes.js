import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/google/gmail', (req, res, next) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ message: 'Missing employee token in query' });
  }

  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send'],
    accessType: 'offline',
    prompt: 'consent',
    state: token, // 👈 pass token here
  })(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const message = encodeURIComponent('Successfully logged in with Google');
    res.redirect(`http://localhost:3001/email-setup?message=${message}`);
  }
);

export default router;
