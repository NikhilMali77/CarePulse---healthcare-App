import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './signup.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

function SignUp() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [code, setCode] = useState(["", "", "", ""]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleCodeChange = (element, index) => {
    const value = element.value.replace(/[^0-9]/g, '');
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 3) {
        document.getElementById(`code-${index + 1}`).focus();
      }
    }
  };

  const handleFocus = () => {
    const codeInput = document.getElementById('code-0');
    if (codeInput) {
      codeInput.focus();
    }
  };

  const checkboxHandler = () => {
    setIsAdmin(!isAdmin);
    if (!isAdmin) {
      handleFocus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isAdmin) {
        const authCode = code.join('');
        const response = await axios.post('/app/admin/admin-signup', {
          name: fullName,
          email,
          phone,
          authCode,
          specialization,
        });
        if (response.data.token) {
          localStorage.setItem('userToken', response.data.token);
          setSuccess('Sign up successful!');
          setError('');
          navigate('/complete-profile');
        }
      } else {
        const response = await axios.post('/app/user/user-signup', {
          name: fullName,
          email,
          phone,
          password,
        });
        if (response.data.token) {
          localStorage.setItem('userToken', response.data.token);
          setSuccess('Sign up successful!');
          setError('');
          navigate('/complete-profile');
        }
      }
    } catch (err) {
      setError('Sign up failed. Please try again.');
      console.log(err);
      setSuccess('');
    }
  };

  const handleGoogleSignIn = (role) => {
    window.location.href = `http://localhost:5000/auth/google/${role}`;
  };

  return (
    <div className="signup-container">
      <div className="signup-box animate-zoom-in">
        <div className="form-signup">
          <h2 className="signup-title">Create Your CarePulse Account 🌟</h2>
          <p className="signup-subtitle">Join us to access personalized healthcare services</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="fullName">
                Full Name
              </label>
              <input
                className="input-field"
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="email">
                Email Address
              </label>
              <input
                className="input-field"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@gmail.com"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="phone">
                Phone Number
              </label>
              <input
                className="input-field"
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 123 456 7890"
                required
              />
            </div>

            {!isAdmin && (
              <div className="input-group">
                <label className="input-label" htmlFor="password">
                  Password
                </label>
                <input
                  className="input-field"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            )}

            <div className="input-group checkbox-group">
              <label className="checkbox-label" htmlFor="admin">
                {isAdmin ? 'Nah I am a user' : 'If you are an admin click me'}
                <input
                  className="checkbox-field"
                  id="admin"
                  type="checkbox"
                  onChange={checkboxHandler}
                />
                <span className="checkbox-custom"></span>
              </label>
            </div>

            {isAdmin && (
              <>
                <div className="input-group">
                  <label className="input-label" htmlFor="spec">
                    Specialization
                  </label>
                  <input
                    className="input-field"
                    id="spec"
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g., Cardiologist"
                    required
                  />
                </div>
                <div className="input-group otp-group">
                  <label className="input-label">Create a 4-Digit Code</label>
                  <div className="otp-container">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        id={`code-${index}`}
                        maxLength={1}
                        value={digit}
                        required
                        onChange={(e) => handleCodeChange(e.target, index)}
                        className="otp-input"
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            <button className="submit" type="submit">
              Sign Up
            </button>

            <div className="google-signup">
              <div className="divider">
                <span>OR</span>
              </div>
              <button
                className="google-btn"
                onClick={() => handleGoogleSignIn(isAdmin ? 'admin' : 'user')}
              >
                <FontAwesomeIcon icon={faGoogle} className="google-icon" />
                <span>Sign up with Google {isAdmin ? '(Admin)' : '(User)'}</span>
              </button>
            </div>

            {error && <p className="error-message animate-fade-in">{error}</p>}
            {success && <p className="success-message animate-fade-in">{success}</p>}
          </form>

          <p className="switch-page">
            Already have an account?{' '}
            <Link to="/" className="switch-page-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;