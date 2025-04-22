import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './useroptions.css';

const UserOptions = ({ user }) => {
  const [userDetailsFilled, setUserDetailsFilled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.detailsFilled) {
      setUserDetailsFilled(true);
    }
  }, [user]);

  const handleScheduleAppointment = () => navigate('/new-appointment');
  const handleChat = () => navigate('/chatbot');
  const handleVideoCall = () => navigate('/chat');
  const handleViewBlogs = () => navigate('/blogs');

  return (
    <div className="option-container">
      <div className="welcome-section animate-fade-in">
        <h2>Welcome, {user.name}!</h2>
        <p>Your journey to better health starts here. How may we assist you today?</p>
      </div>

      <div className="option-buttons animate-slide-up">
        <button className="option-btn" onClick={handleScheduleAppointment}>
          <span className="btn-icon">📅</span> Schedule Appointment
        </button>
        <button className="option-btn" onClick={handleVideoCall}>
          <span className="btn-icon">🎥</span> Video Consultation
        </button>
        <button className="option-btn" onClick={handleViewBlogs}>
          <span className="btn-icon">📖</span> Health Blogs
        </button>
        <button className="option-btn" onClick={handleChat}>
          <span className="btn-icon">🤖</span> AI Assistant
        </button>
      </div>

      <div className="info-section animate-fade-in">
        <div className="info-box">
          <h3>Our Services</h3>
          <p>
            Experience healthcare redefined with CarePulse. From AI-driven symptom analysis to instant video consultations with certified doctors, we bring quality care to your fingertips.
          </p>
        </div>
        <div className="info-box">
          <h3>Why CarePulse?</h3>
          <ul>
            <li><span className="check-icon">✔</span> AI-Powered Insights</li>
            <li><span className="check-icon">✔</span> Expert Doctors On-Demand</li>
            <li><span className="check-icon">✔</span> HIPAA-Compliant Security</li>
            <li><span className="check-icon">✔</span> 24/7 Access</li>
          </ul>
        </div>
      </div>

      <blockquote className="testimonial animate-slide-up">
        "CarePulse made healthcare effortless and personal. The video consultation felt like a visit to the doctor’s office!" — Jessica R.
      </blockquote>
    </div>
  );
};

export default UserOptions;