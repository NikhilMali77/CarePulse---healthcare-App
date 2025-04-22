import Stripe from 'stripe';
import Appointment from '../models/appointment.js';
import Doctor from '../models/Doctor.js' 
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe('sk_test_51R7r1oKPsi69BnCcRWdYuKtXWm4BCwQNvM7GwAaIZaaddbZxf3QmK995702CY8f38vgCx6r1QhUR2Io53zmx7dy300SzsiThsV');

// ✅ Process Payment
export const processPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate('createdBy');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const userEmail = appointment.createdBy?.email;
    if (!userEmail) {
      return res.status(400).json({ message: 'User email not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: 'Video Consultation' },
            unit_amount: 50000, // ₹500 in paisa (500 * 100)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/payment-success?appointmentId=${appointmentId}`,
      cancel_url: `http://localhost:5173/payment-failed?appointmentId=${appointmentId}`,
      metadata: { appointmentId },
    });
    console.log(session)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'carepulse35@gmail.com',
        pass: 'lgjeofyafnemhmkv',
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Complete Your Appointment Payment',
      text: `Please complete your payment for the appointment by clicking the link below:\n\n${session.url}\n\nThank you for choosing our telemedicine service.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ paymentUrl: session.url });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Failed to process payment', error: error.message });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      'whsec_fdf95c471206c39ea27fb5e4c758dc03139644ed3c01b62ed528ac00db2b4a95'
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const appointmentId = session.metadata.appointmentId;

      // ✅ Update both `paymentStatus` and `status`
      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        {
          paymentStatus: 'scheduled',
          status: 'scheduled',
        },
        { new: true }
      ).populate('createdBy'); // ✅ Populate to get user's email
      console.log('appodddddd', updatedAppointment)
      if (!updatedAppointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      const userEmail = updatedAppointment.createdBy.email;
      const joiningLink = `https://meet.example.com/${appointmentId}`; // Replace with actual video link

      // ✅ Send email to user
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'carepulse35@gmail.com',
          pass: 'lgjeofyafnemhmkv',
        },
      });

      const mailOptions = {
        from: 'carepulse35@gmail.com',
        to: userEmail,
        subject: 'Your Video Consultation Appointment is Confirmed',
        text: `Dear User,\n\nYour video consultation has been scheduled.\n\n📅 Appointment Date: ${updatedAppointment.appointmentDate}\n🩺 Doctor: ${updatedAppointment.doctor}\n\n🔗 Join the meeting here: ${joiningLink}\n\nThank you for using our telemedicine service.`,
      };
      await transporter.sendMail(mailOptions);
      console.log(`📧 Joining link sent to user: ${userEmail}`);

      res.json({ received: true });
    }
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};


export const confirmPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    // ✅ Update the appointment's payment status
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        paymentStatus: 'scheduled',
        status: 'scheduled',
      },
      { new: true }
    ).populate('createdBy doctor'); // ✅ Populate both user and doctor

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log('✅ Updated Appointment:', updatedAppointment);

    const userEmail = updatedAppointment.createdBy?.email;
    const doctorEmail = updatedAppointment.doctor?.email;
    const doctorId = updatedAppointment.doctor?._id; // ✅ Get doctor ID
    const joiningLink = `https://meet.example.com/${appointmentId}`;

    if (!userEmail || !doctorEmail) {
      return res.status(400).json({ message: 'User or Doctor email not found' });
    }

    // ✅ Update Doctor's Appointments Array
    await Doctor.findByIdAndUpdate(
      doctorId,
      { $push: { appointments: appointmentId } },
      { new: true }
    );

    // ✅ Send email notifications
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'carepulse35@gmail.com',
        pass: 'lgjeofyafnemhmkv',
      },
    });

    const mailOptions = (recipient, recipientType) => ({
      from: 'carepulse35@gmail.com',
      to: recipient,
      subject: `Your ${recipientType} Video Consultation is Confirmed`,
      text: `Dear ${recipientType},\n\nYour video consultation has been scheduled.\n\n📅 Appointment Date: ${updatedAppointment.appointmentDate}\n🩺 Doctor: ${updatedAppointment.doctor.name}\n\n🔗 Join the meeting here: ${joiningLink}\n\nThank you for using our telemedicine service.`,
    });

    await transporter.sendMail(mailOptions(userEmail, 'Patient'));
    await transporter.sendMail(mailOptions(doctorEmail, 'Doctor'));

    console.log(`📧 Joining link sent to user: ${userEmail}`);
    console.log(`📧 Joining link sent to doctor: ${doctorEmail}`);

    res.status(200).json({ message: 'Appointment successfully scheduled, emails sent to user and doctor!' });
  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    res.status(500).json({ message: 'Failed to confirm payment', error: error.message });
  }
};
