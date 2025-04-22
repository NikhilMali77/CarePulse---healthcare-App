import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './doctorDetails.css';
import { useNavigate } from 'react-router-dom';

const DoctorDetails = () => {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [isNewDoctor, setIsNewDoctor] = useState(false); 
  const [loading, setLoading] = useState(true); // NEW loading state
  const navigate = useNavigate();

  useEffect(() => {
    const checkDocAuthStatus = async () => {
      try {
        const token = localStorage.getItem('doctorToken');
        if (token) {
          const response = await axios.get('http://localhost:5000/check-doc-auth', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.data.isNewDoctor) {
            setIsNewDoctor(true);
            setEmail(response.data.decoded.doctorId); // Prefill email
          } else {
            setDoctorData(response.data.doctor); // Set existing doctor data
          }
        }
      } catch (error) {
        console.error('Error checking doctor authentication status:', error);
        setDoctorData(null);
      } finally {
        setLoading(false); // Stop loading after fetching data
      }
    };

    checkDocAuthStatus();
  }, []);

  // Redirect to dashboard if doctor data is found
  useEffect(() => {
    if (doctorData && doctorData.email) {
      navigate('/doctor-dashboard');
    }
  }, [doctorData, navigate]);

  // Fetch admin data for dropdown
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get('http://localhost:5000/app/admin');
        setAdmins(response.data);
      } catch (error) {
        setError('Failed to load admins. Please try again.');
      }
    };

    fetchAdmins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      specialization,
      email, 
      contact,
      address,
      admin: selectedAdmin?._id,
    };

    try {
      const response = await axios.post('http://localhost:5000/app/details/doctor', payload);
      setSuccess('Doctor details submitted successfully.');
      setError('');
      navigate('/doctor-dashboard');
    } catch (error) {
      console.log(error);
      setError('Failed to submit doctor details. Please try again.');
      setSuccess('');
    }
  };

  const handleSelectAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowDropdown(false);
  };

  // Display loading screen while checking authentication status
  if (loading) {
    return <h1>Loading...</h1>;
  }

  // Render form if new doctor or no existing doctor data
  return isNewDoctor || doctorData === null ? (
    <div className="doctor-details-container">
      <form className="doctor-form-grp" onSubmit={handleSubmit}>
        <h1 className="heading">Enter Your Details</h1>

        <div className="doctor-input-grp">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Doctor's Name"
            required
          />
        </div>

        <div className="doctor-input-grp">
          <label>Email</label>
          <input
            type="email"
            value={email}
            readOnly 
            required
          />
        </div>

        <div className="doctor-input-grp">
          <label>Specialization</label>
          <input
            type="text"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="Specialization"
            required
          />
        </div>

        <div className="doctor-input-grp">
          <label>Contact</label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Contact Number"
            required
          />
        </div>

        <div className="doctor-input-grp">
          <label>Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Street, City, State, Zip"
            required
          />
        </div>

        <div className="doctor-input-grp">
          <label>Select Admin</label>
          <div className="custom-dropdown">
            <div className="selected-admin" onClick={() => setShowDropdown(!showDropdown)}>
              {selectedAdmin ? (
                <>
                  <img
                    src={selectedAdmin?.adminDetails?.profilePic || 'https://via.placeholder.com/50'}
                    alt={`${selectedAdmin.name}'s profile`}
                    className="admin-pfp"
                  />
                  <p className="admin-name">{selectedAdmin.name}</p>
                </>
              ) : (
                <p>Select an Admin</p>
              )}
            </div>

            {showDropdown && (
              <div className="dropdown-menu">
                {admins.map((admin) => (
                  <div
                    key={admin._id}
                    className="admin-option"
                    onClick={() => handleSelectAdmin(admin)}
                  >
                    <img
                      src={admin?.adminDetails?.profilePic || 'https://via.placeholder.com/50'}
                      alt={`${admin.name}'s profile`}
                      className="admin-pfp"
                    />
                    <p className="admin-name">{admin.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="submit-btn">Submit</button>

        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  ) : (
    <h1>Loading...</h1>
  );
};

export default DoctorDetails;
