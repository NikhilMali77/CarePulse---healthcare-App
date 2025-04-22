import User from '../models/User.js';
import UserDetails from '../models/UserDetails.js'
import Admin from '../models/Admin.js';
import AdminDetails from '../models/adminDetails.js';
import Doctor from '../models/Doctor.js';
import nodemailer from 'nodemailer';
import DoctorCredentials from '../models/doctorCredentials.js';
import { FlowValidateInstance } from 'twilio/lib/rest/studio/v2/flowValidate.js';

export const userDetails = async (req, res) => {
  try {
    // const userId = req.user._id;
    const { user, dob, address, idProof, medicalHistory, emergencyContact, insuranceDetails } = req.body;
    const userDetails = new UserDetails({
      user, dob, address, idProof, medicalHistory, emergencyContact, insuranceDetails
    })

    await userDetails.save()
    await User.findByIdAndUpdate(user, { userDetails: userDetails._id })
    res.status(201).json({
      message: 'User details added successfully',
      data: userDetails
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error saving user details',
      error: error.message
    });
  }
}


export const adminDetails = async (req, res) => {
  try {
    // const userId = req.user._id;
    const { admin, dob, address, idProof, expPara, experience, profilePic } = req.body;
    const adminDetails = new AdminDetails({
      admin, dob, address, idProof, expPara, experience, profilePic
    })

    await adminDetails.save()
    await Admin.findByIdAndUpdate(admin, { adminDetails: adminDetails._id })
    res.status(201).json({
      message: 'User details added successfully',
      data: adminDetails
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error saving user details',
      error: error.message
    });
  }
}
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
      doctorCredentials.isUsed = false;
      doctorCredentials.doctor = newDoctor._id;
      await doctorCredentials.save();

      // Add doctor credentials info to the Doctor collection
      newDoctor.credentials = doctorCredentials._id;

      await newDoctor.save();
    } else {
      console.error('Doctor credentials not found');
    }

    // Send an email to the selected admin
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587, // Use 465 for SSL
      secure: false,
      auth: {
        user: 'carepulse35@gmail.com',
        pass: 'lgjeofyafnemhmkv'
      },
    });

    const mailOptions = {
      from: 'carepulse35@gmail.com',
      to: selectedAdmin.email, // Admin's email
      subject: 'You have been assigned as an admin',
      text: `Hello ${selectedAdmin.name},\n\nYou have been assigned as the admin for Dr. ${newDoctor.name}, specializing in ${newDoctor.specialization}.\n\nPlease log in to the admin dashboard to manage their appointments and details.\n\nBest regards,\nCarePulse Team`,
    };

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
