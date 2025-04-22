import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const AdminDetailsSchema = new Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
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
  experience: {
    type: String, // A brief medical history description
    required: true,
  },
  profilePic: {
    type: String,
    required: true // Policy number
  },
  expPara: {
    type: String, 
    required: true
  },
}, { timestamps: true });

const AdminDetails = mongoose.model('AdminDetails', AdminDetailsSchema);
export default AdminDetails;
