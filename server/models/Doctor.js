import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true,
  },
  contact: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  appointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin', // Referencing the Admin model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  roomIds: [{
    type: String // Stores Twilio room IDs for appointments
  }],
  credentials: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorCredentials'
  },
  Blogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }]
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor
