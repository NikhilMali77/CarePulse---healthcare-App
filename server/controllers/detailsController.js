import nodemailer from 'nodemailer';
import DoctorCredentials from '../models/doctorCredentials.js';
import Doctor from '../models/Doctor.js';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';
dotenv.config();  // Load the environment variables from .env file

export const createDoctor = async (req, res) => {
  try {
    const { name, email, specialization, contact, address, admin } = req.body;

    // Create the new doctor
    const newDoctor = await Doctor.create({
      name, email, specialization, contact, address, admin
    });

    // Find the selected admin and update their doctors list
    const selectedAdmin = await Admin.findById(admin);
    if (!selectedAdmin) {
      return res.status(404).json({ message: 'No admin found' });
    }

    selectedAdmin.doctors = selectedAdmin.doctors || []; // Ensure it's an array
    selectedAdmin.doctors.push(newDoctor._id);
    await selectedAdmin.save();

    // Find the doctor credentials and set isUsed to true
    const doctorCredentials = await DoctorCredentials.findOne({ doctorId: email }); // Assuming doctorId is email
    if (doctorCredentials) {
      doctorCredentials.isUsed = true;  // Set to true when used
      doctorCredentials.doctor = newDoctor._id;
      await doctorCredentials.save();

      // Add doctor credentials info to the Doctor collection
      newDoctor.credentials = doctorCredentials._id;
      await newDoctor.save();
    } else {
      console.error('Doctor credentials not found');
    }

    // Create email transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // Use SSL for secure connection
      auth: {
        user: process.env.EMAIL_USER,  // Load email user from environment variable
        pass: process.env.EMAIL_PASS   // Load email pass from environment variable
      },
    });

    // Set up mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,  // Sender's email
      to: selectedAdmin.email,       // Admin's email
      subject: 'You have been assigned as an admin',
      text: `Hello ${selectedAdmin.name},\n\nYou have been assigned as the admin for Dr. ${newDoctor.name}, specializing in ${newDoctor.specialization}.\n\nPlease log in to the admin dashboard to manage their appointments and details.\n\nBest regards,\nCarePulse Team`,
    };

    // Send email to admin
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    return res.status(201).json({ message: 'Doctor created, admin notified, and credentials updated' });
  } catch (error) {
    console.error('Error creating doctor:', error);
    return res.status(500).json({ error: 'Failed to create doctor' });
  }
};
