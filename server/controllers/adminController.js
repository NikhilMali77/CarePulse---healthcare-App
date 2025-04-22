import Admin from "../models/Admin.js";
import Appointment from "../models/appointment.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import Twilio from "twilio";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";

dotenv.config();

// Initialize Twilio client using environment variables
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Email credentials from environment variables
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

export const adminSignup = async (req, res) => {
  const { name, email, phone, authCode, specialization } = req.body;
  try {
    const newAdmin = new Admin({ name, email, phone, authCode, specialization });
    newAdmin.isComplete = true;
    await newAdmin.save();
    res.status(201).json({ message: "Admin Created" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminLogin = async (req, res) => {
  const { email, authCode } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (authCode === admin.authCode[0]) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "3d" });
      return res.status(200).json({ token, message: "Admin Login success" });
    }
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  const { userId, name, email, phone, specialization } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User not authenticated" });
  }
  try {
    const userToUpdate = await Admin.findById(userId);

    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's details
    userToUpdate.name = name || userToUpdate.name;
    userToUpdate.email = email || userToUpdate.email;
    userToUpdate.phone = phone || userToUpdate.phone;
    userToUpdate.specialization = specialization || userToUpdate.specialization;
    userToUpdate.isComplete = true;
    await userToUpdate.save();

    res.status(200).json(userToUpdate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const scheduleAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Fetch appointment details (with doctor and createdBy)
    const appointment = await Appointment.findById(appointmentId)
      .populate("doctor")
      .populate("createdBy");
    if (!appointment) return res.status(404).json({ message: "No appointment found" });

    // Check if this is a paid consultation.
    const isPaidConsultation = appointment.isPaidConsultation;

    if (isPaidConsultation) {
      // For paid consultations, keep status as pending and send payment link.
      appointment.status = "pending";
      await appointment.save();

      const paymentLink = `http://localhost:5173/payment/${appointmentId}`;

      // Send Payment Link to the patient via email.
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const patientMailOptions = {
        from: emailUser,
        to: appointment.createdBy.email,
        subject: "Payment Link for Your Video Consultation",
        text: `Dear ${appointment.createdBy.name},\n\nYour appointment with Dr. ${appointment.doctor.name} requires payment to confirm the booking.\n\nPlease complete your payment using the following link:\n\n${paymentLink}\n\nOnce payment is successful, your appointment will be confirmed.\n\nBest Regards,\nCarePulse Team`,
      };

      transporter.sendMail(patientMailOptions, (error, info) => {
        if (error) {
          console.error("Error sending payment email:", error);
        } else {
          console.log("Payment email sent:", info.response);
        }
      });

      return res.status(200).json({ message: "Payment link sent to user", paymentLink });
    } else {
      // For free consultations, proceed as before:
      const roomId = `room-${appointmentId}-${Date.now()}`;

      // Create a new room in Twilio
      await twilioClient.video.v1.rooms.create({ uniqueName: roomId });

      // Update the appointment with the new room ID and mark as scheduled
      appointment.status = "scheduled";
      appointment.roomId = roomId;
      await appointment.save();

      const user = await User.findById(appointment.createdBy._id);
      user.roomIds.push(roomId);
      const doctor = await Doctor.findById(appointment.doctor._id);
      doctor.roomIds.push(roomId);
      doctor.appointments.push(appointmentId);
      await user.save();
      await doctor.save();

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const doctorMailOptions = {
        from: emailUser,
        to: appointment.doctor.email,
        subject: "New Appointment Scheduled",
        text: `Dear Dr. ${appointment.doctor.name},\n\nYou have a new appointment scheduled.\n\nDetails:\n- Patient: ${appointment.createdBy.name}\n- Date & Time: ${new Date(appointment.appointmentDate).toLocaleString()}\n- Reason: ${appointment.reason}\n- Room ID: ${roomId}\n\nPlease prepare for the appointment.\n\nBest Regards,\nCarePulse Team`,
      };

      const patientMailOptions = {
        from: emailUser,
        to: appointment.createdBy.email,
        subject: "New Appointment Scheduled",
        text: `Dear ${appointment.createdBy.name},\n\nYour appointment with Dr. ${appointment.doctor.name} has been scheduled.\n\nDetails:\n- Date & Time: ${new Date(appointment.appointmentDate).toLocaleString()}\n- Reason: ${appointment.reason}\n- Room ID: ${roomId}\n\nPlease be available at the scheduled time.\n\nBest Regards,\nCarePulse Team`,
      };

      transporter.sendMail(doctorMailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Doctor Email sent:", info.response);
        }
      });

      transporter.sendMail(patientMailOptions, (error, info) => {
        if (error) {
          console.error("Error sending patient email:", error);
        } else {
          console.log("Patient email sent:", info.response);
        }
      });

      return res.status(200).json({ message: "Appointment scheduled and notifications sent", roomId });
    }
  } catch (error) {
    console.error("Error in scheduling appointment:", error);
    res.status(500).json({ message: "Failed to schedule appointment", error });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: "cancelled" },
      { new: true }
    )
      .populate("doctor")
      .populate("createdBy");

    if (!updatedAppointment)
      return res.status(404).json({ message: "Appointment not found" });

    // Notify the doctor and patient via email about the cancellation
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "carepulse35@gmail.com",
        pass: "lgjeofyafnemhmkv",
      },
    });

    const doctorMailOptions = {
      from: "carepulse35@gmail.com",
      to: updatedAppointment.doctor.email,
      subject: "Appointment Cancelled",
      text: `Dear Dr. ${updatedAppointment.doctor.name},\n\nThe following appointment has been cancelled:\n\n- Patient: ${updatedAppointment.createdBy.name}\n- Date & Time: ${new Date(updatedAppointment.appointmentDate).toLocaleString()}\n- Reason: ${updatedAppointment.reason}\n\nBest Regards,\nCarePulse Team`,
    };

    const patientMailOptions = {
      from: "carepulse35@gmail.com",
      to: updatedAppointment.createdBy.email,
      subject: "Appointment Cancelled",
      text: `Dear ${updatedAppointment.createdBy.name},\n\nYour appointment with Dr. ${updatedAppointment.doctor.name} has been cancelled.\n\nDetails:\n- Date & Time: ${new Date(updatedAppointment.appointmentDate).toLocaleString()}\n- Reason: ${updatedAppointment.reason}\n\nWe apologize for any inconvenience caused.\n\nBest Regards,\nCarePulse Team`,
    };

    transporter.sendMail(doctorMailOptions, (error, info) => {
      if (error) {
        console.error("Error sending doctor email:", error);
      } else {
        console.log("Doctor email sent:", info.response);
      }
    });

    transporter.sendMail(patientMailOptions, (error, info) => {
      if (error) {
        console.error("Error sending patient email:", error);
      } else {
        console.log("Patient email sent:", info.response);
      }
    });

    res.status(200).json({ message: "Appointment cancelled and notifications sent" });
  } catch (error) {
    console.error("Error in cancelling appointment:", error);
    res.status(500).json({ message: "Failed to cancel appointment", error });
  }
};
