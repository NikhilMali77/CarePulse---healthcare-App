import React, { useState } from 'react';
import Modal from 'react-modal';
import './adminlogin.css'; // Import CSS for modal styling
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
Modal.setAppElement('#root');

const AdminLogin = ({ onRequestClose, isOpen }) => {
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('');
  const [code, setCode] = useState(["", "", "", ""])
  const navigate = useNavigate()
  const handleGoogleSignIn = (role) => {
    window.location.href = `http://localhost:5000/auth/google/${role}`; // Directly navigate to the backend OAuth route
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const authCode = code.join('')
    try {
      const response = await axios.post('/app/admin/admin-login', {
        email,
        authCode
      })
      console.log(response)
      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token)
        console.log(response.data)
        onRequestClose()
        window.location.href = 'http://localhost:5173/complete-profile?role=admin'
        // navigate('/complete-profile?role=admin')
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed');
    }
  };

  const handleCodeChange = (element, index) => {
    const value = element.value.replace(/[^0-9]/g, '')
    if (value.length <= 1) {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)
      if (value && index < 3) {
        document.getElementById(`code-${index + 1}`).focus()
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Admin Login"
      className="modal"
      overlayClassName="overlay"
    >
      <h2 style={{ color: 'white' }}>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="admin-email">Email</label>
          <input
            type="email"
            id="admin-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="code-0">Authentication code</label>
          <div className="otp-container">
            {code.map((digit, index) => (
              <input
                key={index}
                type='text'
                id={`code-${index}`}
                maxLength={1}
                value={digit}
                required
                onChange={(e) => handleCodeChange(e.target, index)}
                className='otp-input'
              />
            ))}
          </div>
          
        </div>
        <div className="google-signup">
          {/* <h2>Or</h2> */}
          <button className='google-btn' onClick={() => handleGoogleSignIn('admin')}>
            <FontAwesomeIcon icon={faGoogle} className='google-icon' />
            <p> Sign up using Google (Admin)</p>
          </button>
        </div>
        <div className="btnClass">
          <button className="modBtn" type="submit">Submit</button>
          <button className="modBtn" type="button" onClick={onRequestClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminLogin;
