import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './appointmentform.css';

const AppointmentForm = ({ user }) => {
  const [doc, setDoc] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isPaidConsultation, setIsPaidConsultation] = useState(false); // New state

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/app/doctors');
        setDoctors(response.data);
      } catch (error) {
        setError('Failed to load doctors. Please try again.');
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      doctor: doc,
      appointmentDate,
      reason,
      createdBy: user._id,
      isPaidConsultation, // Include the payment preference
    };

    try {
      const response = await axios.post('http://localhost:5000/app/user/new-appointment', payload);
      setSuccess('Appointment created successfully!');
      setError('');
      console.log(response.data);

      // Reset form after success
      setDoc('');
      setAppointmentDate('');
      setReason('');
      setIsPaidConsultation(false);
    } catch (err) {
      setError('Failed to create appointment. Please try again.');
      setSuccess('');
      console.error(err);
    }
  };

  useEffect(() => {
    console.log("usss", user);
  }, [user]);

  return user?.password === "" || user?.password ? (
    <div className="appointment-form">
      <div className="form-container animate-fade-in">
        <h1>Book a New Appointment</h1>
        <p>Schedule your consultation with ease</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="doctor">Select Doctor</label>
            <select
              id="doctor"
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
              className="form-control"
              required
            >
              <option value="">Choose a Doctor</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="appointmentDate">Appointment Date & Time</label>
            <input
              id="appointmentDate"
              type="datetime-local"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Appointment</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your reason for the appointment"
              className="form-control"
              required
            />
          </div>

          {/* New Paid Consultation Option */}
          <div className="form-group">
            <input
              type="checkbox"
              id="paidConsultation"
              checked={isPaidConsultation}
              onChange={() => setIsPaidConsultation(!isPaidConsultation)}
            />
            <label htmlFor="paidConsultation">I want a paid video consultation</label>
          </div>

          <button type="submit" className="submit-btn">
            Schedule Appointment
          </button>

          {success && <p className="success-message animate-fade-in">{success}</p>}
          {error && <p className="error-message animate-fade-in">{error}</p>}
        </form>
      </div>
    </div>
  ) : (
    <div className="no-user">
      <h1>No User Found 😔</h1>
      <p>Please log in to book an appointment.</p>
    </div>
  );
};

export default AppointmentForm;
