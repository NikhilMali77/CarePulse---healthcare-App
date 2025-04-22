import mongoose from "mongoose";

const doctorCredentialsSchema = new mongoose.Schema({
  doctorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  key: { type: String, required: true },
  isUsed: { type: Boolean, default: false },
  adminAssigned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  doctor: {type: mongoose.Schema.Types.ObjectId, ref: 'Doctor'}
});

const DoctorCredentials = mongoose.model('DoctorCredentials', doctorCredentialsSchema);
export default DoctorCredentials;
