// import express from "express"
// import passport from "passport"
// import {handleGoogleCallback} from "../../controllers/OAuthController/googleController.js"

// const router = express.Router();

// // Google OAuth routes
// router.get(
//   '/google',
//   (req, res, next) => {
//     // No need to store redirect URLs in state since we're using database now
//     passport.authenticate('google', {
//       scope: ['profile', 'email']
//     })(req, res, next);
//   }
// );

// router.get(
//   '/google/callback',
//   passport.authenticate('google', { session: false }),
//   handleGoogleCallback
// );


// export default router;