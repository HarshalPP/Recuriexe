// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import { googleToken } from '../../config/jwt.js';
// import { getConfig } from '../../config/google.config.js';
// import User from '../../models/AuthModel/auth.model.js';



// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: "598798693334-ko4vpcpme44qinuptcobkvlevflierrn.apps.googleusercontent.com",
//       clientSecret: "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",
//       callbackURL: 'https://hrms-api.fincooperstech.com/api/googleAuth/google/callback',
//       scope: ['profile', 'email'],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {

//         let user = await User.findOne({ 
//           $or: [
//             { googleId: profile.id },
//             { email: profile.emails[0].value }
//           ]
//         });

//         const token = googleToken(user?._id || null, "User");

//         if (user) {

//           if (!user.googleId) {
//             user.googleId = profile.id;
//           }

//           // Update token
//           user.activeToken = token;
//           await user.save();

//           return done(null, { user, token });
//         }

//         // If user doesn't exist, create a new user
//         const newUser = await User.create({
//           googleId: profile.id,
//           userName: profile.displayName,
//           email: profile.emails[0].value,
//           profilePicture: profile.photos[0].value,
//         });

//         await User.findByIdAndUpdate(newUser._id, { activeToken: token });

//         return done(null, { user: newUser, token });
//       } catch (err) {
//         console.error("Error in Google strategy:", err);
//         return done(err, null);
//       }
//     }
//   )
// );


// // Handle Google authentication response
// export const handleGoogleCallback = async (req, res) => {
//   try {
//     const { user } = req.user;

//     // Load redirect URLs from DB config
//     const config = await getConfig();
//     const failureRedirectUrl = config.google.failureRedirectUrl;
//     const successRedirectUrl = config.google.successRedirectUrl;



//     if (!user) {
//       return res.redirect(`${failureRedirectUrl}?error=AuthenticationFailed`);
//     }



//     const dbUser = await User.findById(user._id);

//     // Check if user has custom success redirect, fallback to portal config
//     const redirectUrl = dbUser?.successRedirectUrl || successRedirectUrl;

//     return res.redirect(`${redirectUrl}?token=${dbUser.activeToken}`);
//   } catch (error) {
//     console.error("Error in Google callback:", error);
//     const config = await getConfig();
//     const failureRedirectUrl = config.google.failureRedirectUrl || "https://candidate-portal.fincooperstech.com/login";
//     return res.redirect(`${failureRedirectUrl}?error=ServerError`);
//   }
// };



// export default passport;