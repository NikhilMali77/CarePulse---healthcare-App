// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        default: '' // Make it optional with a default value
    },
    password: {
        type: String,
        default: '' // Not needed for OAuth users, so make it optional
    },
    googleId: {
        type: String,
        default:''
        // Store Google ID for users who sign up via Google
    },
    // Add other fields as needed...
    isComplete: {
        type: Boolean,
        default: false
    },
    userDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserDetails'
      },
      roomIds: [{
        type: String // Stores Twilio room IDs for appointments
      }]
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next()
})

const User = mongoose.model('User', UserSchema)
export default User;