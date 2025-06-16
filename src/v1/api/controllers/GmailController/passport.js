import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import Emailuser from "../../models/UserEmail/user.js";

dotenv.config();

passport.use(new GoogleStrategy({
  clientID: "598798693334-ko4vpcpme44qinuptcobkvlevflierrn.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: 'https://hrms-api.fincooperstech.com/api/googleAuth/google/callback',
  scope: ['profile', 'email'],
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await Emailuser.findOne({ googleId: profile.id });

      if (user) {
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save();
      } else {
        user = await Emailuser.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          photo: profile.photos[0].value,
          accessToken,
          refreshToken
        });
      }

      return done(null, user); // this `user._id` will be passed to serializeUser
    } catch (err) {
      return done(err, null);
    }
  }
));

// Make sure you're storing the actual MongoDB _id
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
