import React, { useState } from 'react';
import './userdetails.css';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import {useNavigate}  from 'react-router-dom'

const UserDetails = ({user}) => {
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [idProof, setIdProof] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [insuranceDetails, setInsuranceDetails] = useState('');
  const [provider, setProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [isHealthInsurance, setIsHealthInsurance] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate()
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdProof(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let uploadedUrl = '';

    if (idProof) {
      const formData = new FormData();
      formData.append('file', idProof);
      formData.append('upload_preset', 'ml_default' );

      try {
        const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dmx577ow7/image/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          console.error('Upload error details', errorData);
          throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
        }
        
        const uploadedData = await uploadResponse.json();
        uploadedUrl = uploadedData.secure_url;
      } catch (error) {
        setError('Failed to upload ID proof. Please try again.');
        return;
      }
    }

    const payload = {
      user: user._id,
      dob,
      address,
      idProof: uploadedUrl,
      ...(isHealthInsurance && { insuranceDetails: { provider, policyNumber } }),
      medicalHistory,
      emergencyContact,
    };

    try {
      const response = await axios.post('http://localhost:5000/app/details/user', payload);
      setSuccess('User details updated successfully.');
      setError('');
      navigate('/user/page')
    } catch (error) {
      setError('Failed to update user details. Please try again.');
      console.log(error)
      setSuccess('');
    }
  };

  const handleCheckBox = () => {
    setIsHealthInsurance(!isHealthInsurance);
  };

  return (
    <div className="details-container">
      <div className="user-details-container">
        <h2>Enter Your Details for Appointment</h2>
        <form className='form-grp' onSubmit={handleSubmit}>
          <div className="details-input">
            <label>Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>

          <div className="details-input">
            <label>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Street, City, State, Zip"
              required
            />
          </div>

          <div className="details-input">
            <label>ID Proof (Upload)</label>
            <input type="file" onChange={handleFileChange} required />
          </div>

          <div className="details-input">
            <label>Medical History</label>
            <textarea
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="List any chronic conditions or allergies"
            ></textarea>
          </div>

          <div className="details-input">
            <label>Emergency Contact</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Emergency Contact Number"
              required
            />
          </div>

          <div className="details-input">
            <label>Do you have health Insurance</label>
            <input
              type="checkbox"
              className='check'
              onChange={handleCheckBox}
            />
          </div>

          {isHealthInsurance && (
            <>
              <div className="details-input">
                <label>Health Insurance Provider</label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="Provider Name"
                />
              </div>
              <div className="details-input">
                <label>Policy Number</label>
                <input
                  type="text"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  placeholder="Policy Number"
                />
              </div>
            </>
          )}
          <button type="submit" className="submit-btn">Submit</button>
          {success && <p className="success-message">{success}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default UserDetails;
