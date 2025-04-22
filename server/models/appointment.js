import mongoose from "mongoose";
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    default: '',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'pending_approval', 'scheduled', 'cancelled', 'approved', 'rejected'], // Updated enum values
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Assuming this should be required since every appointment needs a creator
  },
  roomId: { // Twilio Room ID
    type: String,
    required: false
  },
  isPaidConsultation: { // Indicates if payment is required
    type: Boolean,
    default: false
  },
  paymentStatus: { // Tracks payment status
    type: String,
    enum: ['pending', 'paid', 'not required', 'scheduled', 'not required'], // Already matches the logic
    default: 'not required'
  },
  approvalToken: { // Stores the JWT token for user approval
    type: String,
    default: null
  }
}, { timestamps: true });

// Indexes for faster queries
appointmentSchema.index({ doctor: 1, appointmentDate: 1 }); // Index for doctor and appointment date
appointmentSchema.index({ status: 1 }); // Index for status
appointmentSchema.index({ createdBy: 1 }); // Index for queries by user
appointmentSchema.index({ approvalToken: 1 }); // Index for approval token lookups

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;

// import mongoose from "mongoose";
// const Schema = mongoose.Schema;

// const appointmentSchema = new Schema({
//   doctor: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Doctor',
//     required: true
//   },
//   appointmentDate: {
//     type: Date,
//     required: true
//   },
//   reason: {
//     type: String,
//     default: '',
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected'],
//     default: 'pending'
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   roomId: { // Twilio Room ID
//     type: String,
//     required: false
//   },
//   isPaidConsultation: { // Indicates if payment is required
//     type: Boolean,
//     default: false
//   },
//   paymentStatus: { // Tracks payment status
//     type: String,
//     enum: ['pending', 'paid', 'not required'],
//     default: 'not required'
//   }
// }, { timestamps: true });

// // Indexes for faster queries
// appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
// appointmentSchema.index({ status: 1 });

// const Appointment = mongoose.model('Appointment', appointmentSchema);
// export default Appointment;

