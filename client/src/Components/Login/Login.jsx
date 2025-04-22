import React, { useState } from 'react';
import './login.css';
import { Link, useNavigate } from 'react-router-dom';
import AdminLogin from './Admin/AdminLogin';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import DoctorLogin from './Doctor/DoctorLogin';

function Login() {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const openAdminModal = () => setIsAdminModalOpen(true);
  const closeAdminModal = () => setIsAdminModalOpen(false);
  const openDoctorModal = () => setIsDoctorModalOpen(true);
  const closeDoctorModal = () => setIsDoctorModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/app/user/user-login', { email, password });
      if (response.status === 200) {
        console.log('Login successful:', response.data);
        if (response.data.token) {
          localStorage.setItem('userToken', response.data.token);
          window.location.href = 'http://localhost:5173/complete-profile?role=user';
        }
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || 'Login error');
      setErrorMessage(error.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleSignIn = (role) => {
    window.location.href = `http://localhost:5000/auth/google/${role}`;
  };

  return (
    <div className="login-container">
      <div className="login-box animate-fade-in">
        <div className="form-box">
          <div className="form-header">
            <h2 className="login-title">Welcome Back 👋</h2>
            <p className="login-subtitle">Sign in to access your CarePulse account</p>
          </div>

          <form className="log-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">
                Email Address
              </label>
              <input
                className="input-fld"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@gmail.com"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">
                Password
              </label>
              <input
                className="input-fld"
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMessage && (
              <p className="error-message animate-fade-in">{errorMessage}</p>
            )}

            <button className="submit-button" type="submit">
              Sign In
            </button>
          </form>

          <div className="google-login">
            <button
              className="google-btn"
              onClick={() => handleGoogleSignIn('user')}
            >
              <FontAwesomeIcon icon={faGoogle} className="google-icon" />
              <span>Sign in with Google</span>
            </button>
          </div>

          <div className="signup-link">
            Don't have an account?{' '}
            <Link to="/signup" className="signup-link-text">
              Sign Up
            </Link>
          </div>

          <div className="role-login-links">
            <button onClick={openAdminModal} className="role-login-btn">
              Admin Login
            </button>
            <AdminLogin isOpen={isAdminModalOpen} onRequestClose={closeAdminModal} />
            <button onClick={openDoctorModal} className="role-login-btn">
              Doctor Login
            </button>
            <DoctorLogin isOpen={isDoctorModalOpen} onRequestClose={closeDoctorModal} />
          </div>
        </div>

        <div className="img-box">
          {/* <div className="img-overlay"></div> */}
          <img
            src="https://png.pngtree.com/png-vector/20210115/ourmid/pngtree-flat-wind-blue-doctor-reception-illustration-png-image_2739382.jpg"
            alt="Doctor Illustration"
          />
          {/* <div className="desk"></div> */}
        </div>
      </div>
    </div>
  );
}

export default Login;