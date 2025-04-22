import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userDetailsSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  address: {
    type : String,
    required: true
  },
  idProof: {
    type: String, // URL or file path to the uploaded ID proof
    required: true,
  },
  medicalHistory: {
    type: String, // A brief medical history description
    required: false,
  },
  insuranceDetails: {
    provider: { type: String, required: false }, // Insurance provider name
    policyNumber: { type: String, required: false }, // Policy number
  },
  emergencyContact: {
    type: String, 
    required: true
  },
}, { timestamps: true });

const UserDetails = mongoose.model('UserDetails', userDetailsSchema);
export default UserDetails;
