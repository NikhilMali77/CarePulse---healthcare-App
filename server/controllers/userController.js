import User from "../models/User.js"
// import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import Appointment from "../models/appointment.js"
import Doctor from "../models/Doctor.js"
import Admin from "../models/Admin.js"
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import Blog from "../models/Blog.js"
dotenv.config()

export const userSignup = async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const newUser = new User({ name, email, phone, password });
    await newUser.save()
    const token = jwt.sign({email}, 'secret', {expiresIn: '3d'}); 
    res.status(201).json({ message: 'User Created', token })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.password === '' || !user.password) {
      return res.status(400).json({ message: 'This user signed in via Google OAuth. Please use Google Sign-In.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({email}, 'secret', {expiresIn: '3d'}); 
    console.log(token)
    if (req.cookies['connect.sid']) {
      res.clearCookie('connect.sid'); // Clear the cookie
    }
    res.status(200).json({token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const updateUser = async (req, res) => {
  const { userId, name, email, phone } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'User not authenticated' });
  }
  try {
    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's details
    userToUpdate.name = name || userToUpdate.name;
    userToUpdate.email = email || userToUpdate.email;
    userToUpdate.phone = phone || userToUpdate.phone;
    userToUpdate.isComplete = true;
    await userToUpdate.save();

    res.status(200).json(userToUpdate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export const getUser = async (req,res) => {
  try {
    const {userId} = req.params;
    const user = await User.findById(userId).populate('userDetails');
    res.status(200).json(user)
  } catch (error) {
    
  }
}

export const createAppointment = async (req, res) => {
  try {
    const { doctor, appointmentDate, reason, createdBy, isPaidConsultation } = req.body;
    if (!doctor || !appointmentDate || !reason || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newAppointment = new Appointment({
      doctor,
      appointmentDate,
      reason,
      status: 'pending', // Default status
      createdBy,
      isPaidConsultation: isPaidConsultation || false, // Store whether payment is required
      paymentStatus: isPaidConsultation ? 'pending' : 'not required', // Payment status handling
    });

    await newAppointment.save();

    const doctorData = await Doctor.findById(doctor).populate('admin');
    const admin = doctorData?.admin;

    if (admin) {
      // Notify the admin via email
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'carepulse35@gmail.com',
          pass: 'lgjeofyafnemhmkv',
        },
      });

      const mailOptions = {
        from: 'carepulse35@gmail.com',
        to: admin.email,
        subject: 'New Appointment Request',
        text: `You have a new appointment request for Dr. ${doctorData.name} on ${appointmentDate}.
        
Reason: ${reason}
        
Please review and manage the appointment on your dashboard.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    // Add appointment to admin's list
    await Admin.findByIdAndUpdate(admin._id, {
      $push: { appointments: newAppointment._id },
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: newAppointment,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      message: 'Failed to create appointment',
      error: error.message,
    });
  }
};
