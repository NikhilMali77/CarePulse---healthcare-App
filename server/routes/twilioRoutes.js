import express from 'express';
import { generateToken } from '../controllers/twilioController.js'; // Adjust the path as necessary

const router = express.Router()

// Use the Twilio routes
router.post('/app/twilio', generateToken);

export default router;