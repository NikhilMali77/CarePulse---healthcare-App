import React, { useState } from 'react';
import Modal from 'react-modal';
import './doctorlogin.css'; // Import CSS for modal styling
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For redirecting after login

Modal.setAppElement('#root');

const DoctorLogin = ({ onRequestClose, isOpen }) => {
  const [doctorId, setDoctorId] = useState('');
  const [key, setKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // React Router's hook for navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/app/doctor/login', {
        doctorId,
        key,
      });

      if (response.data.token) {
        // Store the token in local storage
        localStorage.setItem('doctorToken', response.data.token);

        // Close the modal and navigate to the doctor's details page
        onRequestClose();
        navigate(`/doctor/details`);
      } else {
        setErrorMessage('Login failed');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed');
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Doctor Login"
      className="modal"
      overlayClassName="overlay"
    >
      <h2 style={{ color: 'white' }}>Doctor Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="doctor-id">Doctor ID</label>
          <input
            type="text"
            className='doctor-input'
            id="doctor-id"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="doctor-key">Doctor Key</label>
          <input
            type="password"
            id="doctor-key"
            className='doctor-input'
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
          />
        </div>
        
        <div className="btnClass">
          <button className="modBtn" type="submit">Submit</button>
          <button className="modBtn" type="button" onClick={onRequestClose}>
            Cancel
          </button>
        </div>
        {errorMessage && <p className="error">{errorMessage}</p>}
      </form>
    </Modal>
  );
};

export default DoctorLogin;
