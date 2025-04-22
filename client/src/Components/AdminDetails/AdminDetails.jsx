import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import './admindetails.css'
import {useNavigate} from 'react-router-dom'
const AdminDetails = ({user}) => {
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [experience, setExperience] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [expPara, setExpPara] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate()
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (e.target.name === 'profilePic') {
        setProfilePic(file);
      } else if (e.target.name === 'idProof') {
        setIdProof(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let profilePicUrl = '';
    let idProofUrl = '';

    // Upload profile picture to Cloudinary
    if (profilePic) {
      const profilePicData = new FormData();
      profilePicData.append('file', profilePic);
      profilePicData.append('upload_preset', 'ml_default');

      try {
        const profilePicUpload = await fetch('https://api.cloudinary.com/v1_1/dmx577ow7/image/upload', {
          method: 'POST',
          body: profilePicData,
        });
        if (!profilePicUpload.ok) throw new Error('Failed to upload profile picture');
        const profilePicResponse = await profilePicUpload.json();
        profilePicUrl = profilePicResponse.secure_url;
      } catch (error) {
        setError('Failed to upload profile picture. Please try again.');
        return;
      }
    }

    // Upload identity proof to Cloudinary
    if (idProof) {
      const idProofData = new FormData();
      idProofData.append('file', idProof);
      idProofData.append('upload_preset', 'ml_default');

      try {
        const idProofUpload = await fetch('https://api.cloudinary.com/v1_1/dmx577ow7/image/upload', {
          method: 'POST',
          body: idProofData,
        });
        if (!idProofUpload.ok) throw new Error('Failed to upload identity proof');
        const idProofResponse = await idProofUpload.json();
        idProofUrl = idProofResponse.secure_url;
      } catch (error) {
        setError('Failed to upload identity proof. Please try again.');
        return;
      }
    }

    // Prepare payload
    const payload = {
      admin: user._id,
      dob,
      address,
      experience,
      expPara,
      profilePic: profilePicUrl,
      idProof: idProofUrl,
    };

    try {
      const response = await axios.post('http://localhost:5000/app/details/admin', payload);
      setSuccess('Admin details updated successfully.');
      setError('');
      navigate('/admin-dashboard')
    } catch (error) {
      setError('Failed to update admin details. Please try again.');
      console.log(error)
      setSuccess('');
    }
  };

  return (
    <div className="details-container">
      <div className="admin-details-container">
      <h1 className="heading">Hey Admin, Fill Your Details</h1>
        <form className='form-grp' onSubmit={handleSubmit}>
          <div className="input-grp">
            <label>Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>

          <div className="input-grp">
            <label>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Street, City, State, Zip"
              required
            />
          </div>

          <div className="input-grp">
            <label>Experience (in years)</label>
            <input
              type="number"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g., 5 years"
              required
            />
          </div>

          <div className="input-grp">
            <label>Experience (In words)</label>
            <input
              type="text"
              value={expPara}
              onChange={(e) => setExpPara(e.target.value)}
              placeholder="Write your working journey here"
              required
            />
          </div>

          <div className="input-grp">
            <label>Profile Picture (Upload)</label>
            <input type="file" name="profilePic" onChange={handleFileChange} required />
          </div>

          <div className="input-grp">
            <label>ID Proof (Upload)</label>
            <input type="file" name="idProof" onChange={handleFileChange} required />
          </div>

          <button type="submit" className="submit-btn">Submit</button>
          {success && <p className="success-message">{success}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default AdminDetails;
