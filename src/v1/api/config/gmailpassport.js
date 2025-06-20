import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import Emailuser from "../models/UserEmail/user.js";

dotenv.config();

passport.use(new GoogleStrategy({
  clientID: "59791320328-i1d74g3tv6iqoq0jd1ij2krv7r1u4rgl.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: 'http://localhost:4000/api/google/callback',
  scope: ['profile', 'email','https://www.googleapis.com/auth/gmail.send'],
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await Emailuser.findOne({ googleId: profile.id });
        const organizationId = req.employee.organizationId;

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
          organizationId:organizationId , 
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
