import passport from "passport";

export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({message: 'Unauthorized. Please log in'});
  }
};

export const checkProfileCompletion = (req, res, next) => {
  if (req.user.isComplete) {
    // Profile already complete, so redirect to home or send a 403 response
    return res.redirect('http://localhost:5173/');
    // Alternatively, if you don't want a redirect:
    // return res.status(403).json({ message: 'Profile already complete. Access denied.' });
  }

  // Profile is incomplete, continue to the next middleware/route handler
  next();
};


export const authenticate = (req, res, next) => {
  passport.authenticate('session', (err, user, info) => {
    if (err) {
      return next(err)
    } 
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;
    next();
  }) (req,res,next)
}