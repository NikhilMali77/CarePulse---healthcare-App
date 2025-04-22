import express from 'express';
import { getAppointmentById } from '../controllers/appointmentControllers.js';


const router = express.Router();

// ✅ Route to get appointment details by ID
router.get('/appointment/:appointmentId', getAppointmentById);

export default router;
