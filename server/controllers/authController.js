import jwt from 'jsonwebtoken'
import User from '../models/User.js';
import Admin from '../models/Admin.js';
export const checkAuth = async (req, res) => {
  try {
    // console.log("Current User:", req.user);

    if (req.user) {
      return res.status(200).json({ user: req.user, isAuthenticated: true });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, 'secret'); // Use environment variable for secret
      console.log('Decoded Token:', decoded);

      const user = await User.findOne({ email: decoded.email }) || await Admin.findOne({ email: decoded.email });
      console.log('Found User:', user);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ user, isAuthenticated: true });
    }

    return res.status(401).json({ message: 'Unauthorized: No token provided' });

  } catch (error) {
    console.error('Error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }

    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
// export const checkAuth = (req,res) => {
//  try {
//   if(req.user){
//     console.log('meri ammi hai', req.user)
//     return res.status(200).json({user: req.user, isAuthenticated: true})
//   } 
//  } catch (error) {
//   console.error('Error:', error);

//  }
// }
// export const checkDocAuth = (req, res) => {
//   // Extract the token from the Authorization header
//   const authHeader = req.headers.authorization;
//   const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer token'

//   if (!token) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   try {
//     // Verify the token
//     const decoded = jwt.verify(token, 'secret');
//     res.status(200).json({ user: decoded });
//   } catch (error) {
//     console.error('Token verification error:', error);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// import jwt from 'jsonwebtoken';
import Doctor from '../models/Doctor.js'; // Assuming you have a Doctor model
export const checkDocAuth = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer token'

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, 'secret'); // Ensure to use an env variable for the secret
    console.log(decoded);

    // Try to find the doctor by the decoded token's `doctorId`
    const doctor = await Doctor.findOne({ email: decoded.doctorId });
    console.log(doctor);

    if (!doctor) {
      // If the doctor is not found, return decoded token and flag to create a new profile
      return res.status(200).json({ isNewDoctor: true, decoded });
    }

    // If doctor exists, return the full doctor object
    return res.status(200).json({ doctor, isAuthenticated: true });

  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
