// src/config/passport.config.js

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import crypto from "crypto";

// +++ THE FIX IS HERE +++
// We will explicitly define the callback URL based on the environment.
const googleCallbackURL = process.env.NODE_ENV === 'production'
    ? 'https://goontube.onrender.com/api/v1/users/google/callback'
    : 'http://localhost:3000/api/v1/users/google/callback';

// You can add this log to verify which URL is being used when the server starts.
console.log(`[Passport] Using Google callback URL: ${googleCallbackURL}`);


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // We now pass our explicitly defined variable here.
    callbackURL: googleCallbackURL,
    scope: ["profile", "email"]
},
async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save({ validateBeforeSave: false });
            }
            return done(null, user);
        } else {
            const newUser = await User.create({
                googleId: profile.id,
                fullName: profile.displayName,
                email: profile.emails[0].value,
                username: profile.emails[0].value.split('@')[0].toLowerCase() + crypto.randomBytes(3).toString('hex'),
                avatar: {
                    url: profile.photos[0].value,
                    public_id: profile.id
                },
            });
            return done(null, newUser);
        }
    } catch (error) {
        return done(error, false);
    }
}));

// No changes needed below this line
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, false);
    }
});