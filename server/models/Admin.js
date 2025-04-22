import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const adminSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,  // Changed to String for flexibility
    default: '',  // Default value should match the field type
  },
  authCode: {
    type: [String],  // Changed to String if you need a single auth code
    default: '',  // Default value should match the field type
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
  specialization: {
    type: String,
    default: ''
  },
  googleId: {
    type: String,
    default: '',  // Default value should match the field type
  },
  adminDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminDetails'
  },
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }],
  appointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }]
});

// Optional: Add pre-save middleware for hashing auth codes or other logic

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
