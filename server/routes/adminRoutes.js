import express from "express";
import { 
  adminLogin, 
  adminSignup, 
  cancelAppointment, 
  getAdmin, 
  getAdmins, 
  scheduleAppointment, 
  updateAdmin, 
  // confirmPaymentAndSchedule, // New endpoint for payment confirmation
  // approveAppointment // New endpoint for user approval
} from "../controllers/adminController.js";

const router = express.Router();

// Existing routes
router.post('/admin-signup', adminSignup);
router.post('/admin-login', adminLogin);
router.patch('/update', updateAdmin);
router.get('/', getAdmins);
router.get('/:adminId', getAdmin);
router.post('/:appointmentId/schedule', scheduleAppointment);
router.post('/:appointmentId/cancel', cancelAppointment);

// // New routes
// router.post('/:appointmentId/confirm-payment', confirmPaymentAndSchedule); // Route for confirming payment
// router.get('/approve-appointment/:token', approveAppointment); // Route for user to approve the appointment

export default router;

// import express from "express"
// import { adminLogin, adminSignup, cancelAppointment, getAdmin, getAdmins, scheduleAppointment, updateAdmin } from "../controllers/adminController.js"

// const router = express.Router()

// router.post('/admin-signup', adminSignup)
// router.post('/admin-login', adminLogin)
// router.patch('/update', updateAdmin)
// router.get('/', getAdmins)
// router.get('/:adminId', getAdmin)
// router.post('/:appointmentId/schedule', scheduleAppointment)
// router.post('/:appointmentId/cancel', cancelAppointment)

// export default router;