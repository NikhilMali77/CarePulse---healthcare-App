import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import axios from 'axios';

// Route Imports
import googleRoutes from './routes/googleRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoute from './routes/authRoute.js';
import detailsRoutes from './routes/detailsRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import twilioRoutes from './routes/twilioRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

// Model Imports
import Doctor from './models/Doctor.js';

// Config
import './config/passport.js';

// Load environment variables
dotenv.config();

// Environment Variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const HF_API_KEY = process.env.HF_API_KEY;
const SESSION_SECRET = process.env.SESSION_SECRET;
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'];

const app = express();

// Middleware Setup
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true } // Set `secure: true` in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('Mongoose Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use(googleRoutes);
app.use('/app/admin', adminRoutes);
app.use('/app/user', userRoutes);
app.use(authRoute);
app.use('/app/details', detailsRoutes);
app.use('/app/doctor', doctorRoutes);
app.use('/', paymentRoutes);
app.use('/app', appointmentRoutes);
app.use(twilioRoutes);

// Debug Cookie
app.get('/', (req, res) => {
  const connectSid = req.cookies['connect.sid'];
  console.log('connect.sid:', connectSid);
  res.send('Hello from Telemed Backend!');
});

// Get All Doctors
app.get('/app/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({}).populate('admin');
    if (!doctors) return res.status(404).json({ message: 'Doctors not found' });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Check Symptoms API (HuggingFace)
app.post("/check-symptoms", async (req, res) => {
  try {
    const symptoms = req.body.symptoms;

    if (!symptoms || typeof symptoms !== "string") {
      return res.status(400).json({ error: "Invalid input: symptoms must be a non-empty string." });
    }

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/Zabihin/Symptom_to_Diagnosis",
      { inputs: symptoms },
      { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
    );

    let results = response.data.flat();

    results = results
      .filter((item) => item.score > 0.02)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => ({
        name: item.label,
        probability: (item.score * 100).toFixed(2) + "%",
      }));

    res.json({ results });
  } catch (error) {
    console.error("AI Prediction Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch AI prediction" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
