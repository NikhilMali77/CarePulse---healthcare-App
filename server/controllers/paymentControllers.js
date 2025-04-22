import Stripe from 'stripe';
import Appointment from '../models/appointment.js';
import Doctor from '../models/Doctor.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Stripe Init
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Nodemailer Init
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Process Payment
export const processPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate('createdBy');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const userEmail = appointment.createdBy?.email;
    if (!userEmail) return res.status(400).json({ message: 'User email not found' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: { name: 'Video Consultation' },
          unit_amount: 50000, // ₹500
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?appointmentId=${appointmentId}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-failed?appointmentId=${appointmentId}`,
      metadata: { appointmentId },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Complete Your Appointment Payment',
      text: `Please complete your payment for the appointment by clicking the link:\n\n${session.url}\n\nThank you.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ paymentUrl: session.url });

  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Failed to process payment', error: error.message });
  }
};

// ✅ Handle Stripe Webhook
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const appointmentId = session.metadata.appointmentId;

      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { paymentStatus: 'scheduled', status: 'scheduled' },
        { new: true }
      ).populate('createdBy');

      if (!updatedAppointment) return res.status(404).json({ message: 'Appointment not found' });

      const userEmail = updatedAppointment.createdBy.email;
      const joiningLink = `https://meet.example.com/${appointmentId}`; // Replace with actual link

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Your Appointment is Confirmed',
        text: `Dear User,\n\nYour consultation is scheduled.\n\nDate: ${updatedAppointment.appointmentDate}\nDoctor: ${updatedAppointment.doctor}\n\nJoin: ${joiningLink}`,
      };

      await transporter.sendMail(mailOptions);
      res.json({ received: true });
    }

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

// ✅ Confirm Payment (Manual fallback)
export const confirmPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) return res.status(400).json({ message: 'Appointment ID is required' });

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { paymentStatus: 'scheduled', status: 'scheduled' },
      { new: true }
    ).populate('createdBy doctor');

    if (!updatedAppointment) return res.status(404).json({ message: 'Appointment not found' });

    const userEmail = updatedAppointment.createdBy?.email;
    const doctorEmail = updatedAppointment.doctor?.email;
    const doctorId = updatedAppointment.doctor?._id;

    const joiningLink = `https://meet.example.com/${appointmentId}`;

    await Doctor.findByIdAndUpdate(
      doctorId,
      { $push: { appointments: appointmentId } },
      { new: true }
    );

    const mailOptions = (recipient, role) => ({
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: `Your ${role} Consultation is Confirmed`,
      text: `Dear ${role},\n\nYour video consultation is scheduled.\nDate: ${updatedAppointment.appointmentDate}\nDoctor: ${updatedAppointment.doctor.name}\n\nJoin: ${joiningLink}`,
    });

    await transporter.sendMail(mailOptions(userEmail, 'Patient'));
    await transporter.sendMail(mailOptions(doctorEmail, 'Doctor'));

    res.status(200).json({ message: 'Appointment confirmed and emails sent.' });

  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    res.status(500).json({ message: 'Failed to confirm payment', error: error.message });
  }
};
