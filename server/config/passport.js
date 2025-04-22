import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

// Google OAuth strategy
passport.use('google', new GoogleStrategy({
  clientID: '981991086747-n8bnedvs5si8dv0vcs8hk2qc4ngs5t9p.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:5000/auth/google/callback',
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  const name = profile.displayName;
  const email = profile.emails?.[0]?.value;
  const googleId = profile.id;

  if (!email || !name || !googleId) {
    console.error('Missing required fields from Google profile');
    return done(new Error('Missing required fields from Google profile'), false);
  }

  try {
    const role = JSON.parse(req.query.state || '{}').role;
    if (role === 'admin') {
      let admin = await Admin.findOne({ email });
      if (!admin) {
        const authCode = ''; // Example auth code

        admin = new Admin({
          googleId,
          name,
          email,
          isComplete: false,
        });
        await admin.save();
        console.log('Admin saved:', admin);
      }
      return done(null, admin);
    } else {
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          googleId,
          name,
          email,
          isComplete: false,
        });
        await user.save();
        console.log('User saved:', user);
      }
      return done(null, user);
    }
  } catch (error) {
    console.error('Error in saving user/admin:', error);
    return done(error, false);
  }
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id) || await Admin.findById(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});
