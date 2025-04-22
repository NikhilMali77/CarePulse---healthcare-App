import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './completeprofile.css';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
function CompleteProfile({user}) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get('role');
  // const { user } = useAuth()
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('')
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate()
  useEffect(() => {
    console.log('rolllle', role)
  })
  // useEffect(() => {
  //   // Fetch existing user details on component mount
  //   const fetchUserDetails = async () => {
  //     try {
  //       const endpoint = role === 'admin' ? '/api/admin/profile' : '/api/user/profile';
  //       const response = await axios.get(endpoint, { withCredentials: true });

  //       if (response.status === 200) {
  //         const { name, email, phone, authCode } = response.data;
  //         setFullName(name);
  //         setEmail(email);
  //         setPhone(phone);
  //         if (role === 'admin') {
  //           setAuthCode(authCode || ''); // Provide default value if authCode is not present
  //         }
  //       } else {
  //         // Handle response error
  //         setError('Failed to fetch user details. Please try again.');
  //       }
  //     } catch (err) {
  //       setError('Failed to fetch user details. Please try again.');
  //       console.error('Error fetching user details:', err);
  //     }
  //   };

  //   fetchUserDetails();
  // }, [role]); // Dependency array, runs whenever `role` changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        userId: user._id ,
        name: user.name,
        email: user.email,
        phone,
        ...(user.authCode && { specialization })
      };
      const response = await axios.patch(`app/${role}/update`, payload);
      console.log(response)
      setSuccess('Profile completed successfully!');
      if (role === 'user'){
        navigate('/details')
      } else {
        navigate('/details')
      }
      setError('');
    } catch (err) {
      setError('Failed to complete profile. Please try again.');
      console.log(err)
      setSuccess('');
    }
  };

  return (
    user ? (
      <div className="complete-profile-container">
      <div className="complete-profile-box">
        <div className="form-box">
          <h2 className="complete-profile-title">Complete Your Profile</h2>
          <p className="complete-profile-subtitle">Please provide your phone number to continue</p>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="fullName">
                Full name
              </label>
              <input
                className="input-field"
                id="fullName"
                type="text"
                value={user.name}
                disabled
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="email">
                Email
              </label>
              <input
                className="input-field"
                id="email"
                type="email"
                value={user.email}
                disabled
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@gmail.com"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="phone">
                Phone number
              </label>
              <input
                className="input-field"
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91"
                required
              />
            </div>
            {user?.authCode && (
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
                placeholder="Your qualification / specialization"
                required
              />
            </div>
            )}

            <button className="submit" type="submit">
              Complete Profile
            </button>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
          </form>
        </div>
      </div>
    </div>
    ) : (
      <div className='no-user'>
      <h1>No {user} found :(</h1>
    </div>
    )
  );
}

export default CompleteProfile;
