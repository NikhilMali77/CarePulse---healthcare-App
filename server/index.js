import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import googleRoutes from './routes/googleRoutes.js'; // Import Google routes
import dotenv from 'dotenv';
import './config/passport.js'; // Import Passport configuration
import adminRoutes from './routes/adminRoutes.js'
import userRoutes from './routes/userRoutes.js'
import authRoute from './routes/authRoute.js'
import detailsRoutes from './routes/detailsRoutes.js'
import Doctor from './models/Doctor.js';
import doctorRoutes from './routes/doctorRoutes.js'
import cookieParser from 'cookie-parser';
import twilioRoutes from './routes/twilioRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import axios from 'axios'
dotenv.config();

const app = express();
const HF_API_KEY = "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"
// Middleware setup
app.use(bodyParser.json());

// CORS configuration
// Commenting out the existing CORS setup for reference
// app.use(cors({
//   origin: 'http://localhost:5173', // Previous origin for frontend
//   credentials: true
// }));

// New CORS configuration to allow both Ngrok URLs for frontend access
app.use(cors({
  origin: ['http://localhost:5173', 'https://warm-states-follow.loca.lt'], // Update this with your Ngrok URL
  credentials: true
}));

// Session and Passport initialization
app.use(cookieParser());
app.use(session({
  secret: 'secret', // Ensure this is set
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true } // Set secure to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/telemed')
  .then(() => console.log('Mongoose Connected'))
  .catch(err => console.log('Error occurred', err));

// Routes
app.use(googleRoutes);
app.use('/app/admin', adminRoutes);
app.use('/app/user', userRoutes);
app.use(authRoute);
app.use('/app/details', detailsRoutes);
app.use('/app/doctor', doctorRoutes);
app.use('/', paymentRoutes)
app.use('/app', appointmentRoutes)
app.use(twilioRoutes);

// Use the googleRoutes for auth
// app.get('/', (req, res) => res.send('Hello World!'));
app.get('/', (req, res) => {
  const connectSid = req.cookies['connect.sid'];
  console.log('connect.sid:', connectSid);
  // Use the cookie value as needed
});

app.get('/app/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({}).populate('admin');
    if (!doctors) return res.status(404).json({message: 'Admins not found'});
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({message: 'Internal server error', error});
  }
});

// app.post("/check-symptoms", async (req, res) => {
//   try {
//     const symptoms = req.body.symptoms;

//     if (!symptoms || typeof symptoms !== "string") {
//       return res.status(400).json({ error: "Invalid input: symptoms must be a non-empty string." });
//     }

//     const response = await axios.post(
//       "https://api-inference.huggingface.co/models/Zabihin/Symptom_to_Diagnosis",
//       { inputs: symptoms },
//       { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
//     );

//     let results = response.data.flat();
//     console.log("Raw API Response:", results);
//       res.json({ prediction: response.data });
//   } catch (error) {
//       console.error("Error:", error.response?.data || error.message);
//       res.status(500).json({ error: "Failed to fetch AI prediction" });
//   }
// });

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
    console.log("Raw API Response:", results);

    results = results
      .filter((item) => item.score > 0.02) // Remove low-confidence results
      .sort((a, b) => b.score - a.score) // Sort by highest probability
      .slice(0, 5) // Keep top 5 results
      .map((item) => ({
        name: item.label,
        probability: (item.score * 100).toFixed(2) + "%",
      }));

    console.log("Processed Results:", results);

    res.json({ results });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch AI prediction" });
  }
});

// Listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
