import express from 'express';
import { confirmPayment, handleWebhook, processPayment } from '../controllers/paymentControllers.js';

const router = express.Router();

// ✅ Route to initiate payment
router.post('/payment/initiate', processPayment);

// ✅ Route to handle Stripe webhook
router.post('/payment/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  console.log('✅ Webhook called:', req.headers, req.body);
  next();
}, handleWebhook);

router.post('/payment/confirm', confirmPayment)

export default router;
