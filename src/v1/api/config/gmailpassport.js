import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import Emailuser from "../models/UserEmail/user.js";
import jwt from "jsonwebtoken";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      // clientID: process.env.GMAIL_CLIENT_ID,
      // clientSecret: process.env.GMAIL_CLIENT_SECRET,
      // callbackURL: 'http://localhost:4000/v1/api/google/callback',

      // clientID:
      //   "872671367575-jg9vohru7bc7cj22iitp617iascb9pjn.apps.googleusercontent.com",
      // clientSecret: "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",
      // callbackURL: "https://hrms-api.fincooperstech.com/v1/api/google/callback",

      clientID: process.env.CLIENT_ID ,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URI}/v1/api/google/callback`,



      // clientID: "598798693334-ko4vpcpme44qinuptcobkvlevflierrn.apps.googleusercontent.com",
      // clientSecret: "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",
      // callbackURL: 'https://hrms-api.fincooperstech.com/api/googleAuth/google/callback',

      passReqToCallback: true, // <-- enable req access
    },
    async (req, accessToken, refreshToken, params, profile, done) => {
      const expiryDate = Date.now() + params.expires_in * 1000;

      try {
        // decode token from state
        let organizationId = null;
        if (req.query.state) {
          const decoded = jwt.verify(
            req.query.state,
            process.env.JWT_EMPLOYEE_TOKEN
          );
          organizationId = decoded.organizationId;
        }
        let user = await Emailuser.findOne({ googleId: profile.id });

        if (user) {
          user.accessToken = accessToken;
          user.refreshToken = refreshToken;
          user.expiryDate = expiryDate;
          user.organizationId = organizationId;
          await user.save();
        } else {
          user = await Emailuser.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value,
            accessToken,
            refreshToken,
            expiryDate: expiryDate,
            organizationId,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Emailuser.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
