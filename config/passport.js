import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import crypto from "crypto";
import "dotenv/config";
import userCollection from "../models/userModel.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userCollection.findOne({
          email: profile.emails[0].value,
        });

        if (user) {
          //check user exist
          return done(null, user);
        }

        //if user doesnot exist in db create a new user
        const newUser = new userCollection({
          username: profile.displayName,
          googleID: profile.id,
          email: profile.emails && profile.emails[0].value,
          referalID: crypto.randomBytes(16).toString("hex"),
        });

        await newUser.save();

        done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (id, done) => {
  try {
    let user = await userCollection.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
