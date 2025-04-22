import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './payment.css';

const PaymentGateway = () => {
  const { appointmentId } = useParams(); // ✅ Extract appointment ID from URL
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/app/appointment/${appointmentId}`);
        setAppointment(response.data);
      } catch (err) {
        console.error("❌ Error fetching appointment:", err);
        setError('Failed to load appointment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handlePayment = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/payment/initiate`, { appointmentId });
      console.log(response.data)
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
        console.log('wedwd', response.data)
        // ✅ Redirect to Stripe Checkout
      } else {
        throw new Error("Invalid payment URL");
      }
    } catch (err) {
      console.error("❌ Payment error:", err);
      setError('Payment failed. Please try again.');
    }
  };

  if (loading) return <p className="loading">Loading appointment details...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="payment-container">
      {console.log(appointment)}
      <h1>Complete Your Payment</h1>
      <div className="main-div">
        <p><strong>Doctor:</strong> {appointment?.doctor?.name || "N/A"}</p>
        <p><strong>Appointment Date:</strong> {new Date(appointment?.appointmentDate).toLocaleString()}</p>
        <p><strong>Reason:</strong> {appointment?.reason}</p>
        <p className="price"><strong>Amount:</strong> ₹500</p>
      </div>

      {appointment?.paymentStatus === 'paid' ? (
        <p className="success">✅ Payment already completed! Your appointment is confirmed.</p>
      ) : (
        <button className="pay-btn" onClick={handlePayment}>
          Pay Now
        </button>
      )}
    </div>
  );
};

export default PaymentGateway;
