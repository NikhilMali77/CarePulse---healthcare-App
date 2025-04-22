import User from "../models/User.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Appointment from "../models/appointment.js";
import Doctor from "../models/Doctor.js";
import Admin from "../models/Admin.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import Blog from "../models/Blog.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

export const userSignup = async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, phone, password: hashedPassword });
    await newUser.save();
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '3d' });
    res.status(201).json({ message: 'User Created', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.password) {
      return res.status(400).json({ message: 'Signed up with Google. Use Google Sign-In.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '3d' });

    if (req.cookies['connect.sid']) {
      res.clearCookie('connect.sid');
    }

    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { userId, name, email, phone } = req.body;
  if (!userId) return res.status(400).json({ message: 'User not authenticated' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.isComplete = true;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("userDetails");
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
      status: 'pending',
      createdBy,
      isPaidConsultation: isPaidConsultation || false,
      paymentStatus: isPaidConsultation ? 'pending' : 'not required',
    });

    await newAppointment.save();

    const doctorData = await Doctor.findById(doctor).populate("admin");
    const admin = doctorData?.admin;

    if (admin) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: EMAIL_USER,
        to: admin.email,
        subject: 'New Appointment Request',
        text: `You have a new appointment request for Dr. ${doctorData.name} on ${appointmentDate}.
        
Reason: ${reason}

Please review and manage the appointment on your dashboard.`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Email sending failed:", err);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      await Admin.findByIdAndUpdate(admin._id, {
        $push: { appointments: newAppointment._id },
      });
    }

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Create Appointment Error:", error);
    res.status(500).json({ message: 'Failed to create appointment', error: error.message });
  }
};
