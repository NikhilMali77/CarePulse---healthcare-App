import express from 'express';
import passport from 'passport';
import { ensureAuthenticated, checkProfileCompletion, authenticate } from '../config/middleware.js';
const router = express.Router();

// Google OAuth route for admins
router.get('/auth/google/admin', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account',
  state: JSON.stringify({ role: 'admin' }) // Pass role as state
}));

// Google OAuth route for users
router.get('/auth/google/user', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account',
  state: JSON.stringify({ role: 'user' }) // Pass role as state
}));

// Google OAuth callback URL
router.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  session: true // Enable session for logged-in user
}), (req, res) => {
  // Successful authentication
  if (req.isAuthenticated()) {
    // console.log()
    const role = JSON.parse(req.query.state).role
    res.redirect(`/complete-profile?role=${role}`);
  } else {
    res.redirect('http://localhost:5173');
  }
});

// Protect the /complete-profile route using middleware
router.get('/complete-profile', authenticate, ensureAuthenticated, (req, res) => {
  // Only accessible if authenticated and profile is incomplete
  if (!req.user.isComplete) {

    // If the profile is incomplete, redirect to the frontend profile completion page

    const role = req.query.role
    // console.log('heeeeeyy')
    return res.redirect(`http://localhost:5173/complete-profile?role=${role}`);
  } else {
    // console.log('hello')
    // console.log(req.user)

    // If the profile is already complete, redirect to another protected page (e.g., /pass)
    return res.redirect('http://localhost:5173/details');
  }
});


export default router;
