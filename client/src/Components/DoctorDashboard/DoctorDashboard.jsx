import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './doctordashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage, faVideo, faEdit, faTrash, faUserCircle, faCalendarCheck, faBlog } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { htmlToText } from 'html-to-text';

const DoctorDashboard = ({ doctor }) => {
  const [appointments, setAppointments] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`app/doctor/${doctor._id}`);
        const data = response.data.doctor;
        setAppointments(data.appointments.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)));
        setBlogs(data.Blogs || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    if (doctor._id) fetchData();
  }, [doctor._id]);

  const handleEditBlog = (blogId) => {
    navigate(`/edit-blog/${blogId}`);
  };

  const handleJoinRoom = (roomId) => {
    navigate('/doctor-chat', { state: { roomId } });
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      await axios.delete(`/app/doctor/delete-blog/${blogId}`);
      setBlogs(blogs.filter(blog => blog._id !== blogId));
    } catch (err) {
      setError('Failed to delete blog');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleViewIdProof = (idProofUrl) => {
    window.open(idProofUrl, '_blank');
  };

  if (loading) return <div className="loading">Loading data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="doctor-dashboard">
      {/* Header with Doctor Profile */}
      <header className="doctor-dashboard-header animate-fade-in">
        <div className="doctor-profile">
          <FontAwesomeIcon icon={faUserCircle} className="doctor-profile-icon" />
          <div className="doctor-profile-info">
            <h2>Welcome, Dr. {doctor.name} 👨‍⚕️</h2>
            <p>Doctor Dashboard</p>
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <section className="doctor-statistics-cards animate-slide-up">
        <div className="doctor-card">
          <FontAwesomeIcon icon={faCalendarCheck} className="card-icon" />
          <h3>{appointments.length}</h3>
          <p>Total Appointments</p>
        </div>
        <div className="doctor-card">
          <FontAwesomeIcon icon={faBlog} className="card-icon" />
          <h3>{blogs.length}</h3>
          <p>Your Blogs</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="doctor-tabs animate-slide-up">
        <button
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => handleTabChange('appointments')}
        >
          Appointments
        </button>
        <button
          className={`tab-btn ${activeTab === 'blogs' ? 'active' : ''}`}
          onClick={() => handleTabChange('blogs')}
        >
          Your Blogs
        </button>
      </section>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <section className="doctor-appointment-table animate-slide-up">
          <h3 className="table-title">Appointment Management</h3>
          {appointments.length === 0 ? (
            <div className="no-appointments">
              <p>No appointments found.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Status</th>
                    <th>Date & Time</th>
                    <th>Reason</th>
                    <th>Room ID</th>
                    <th>Room</th>
                    <th>ID Proof</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="table-row">
                      <td>{appointment.createdBy?.name || 'Unknown'}</td>
                      <td>
                        <span className={`doctor-status ${appointment?.status}`}>
                          {appointment?.status.charAt(0).toUpperCase() + appointment?.status.slice(1)}
                        </span>
                      </td>
                      <td>{new Date(appointment.appointmentDate).toLocaleString()}</td>
                      <td>{appointment.reason || 'N/A'}</td>
                      <td>{appointment.roomId || 'N/A'}</td>
                      <td>
                        {appointment?.isPaidConsultation ? 
                        <button
                        className="actn-btn schedule"
                        onClick={() => handleJoinRoom(appointment.roomId)}
                      >
                        <FontAwesomeIcon icon={faVideo} /> Join Room
                      </button> :
                      <p style={{}}>Offline consultation</p>}
                      </td>
                      <td>
                        {appointment.createdBy?.userDetails?.idProof ? (
                          <button
                            onClick={() => handleViewIdProof(appointment.createdBy.userDetails.idProof)}
                            className="doctor-view-id-proof-btn"
                          >
                            <FontAwesomeIcon icon={faFileImage} /> View
                          </button>
                        ) : (
                          <span className="no-id-proof">No ID</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Blogs Tab */}
      {activeTab === 'blogs' && (
        <section className="doctor-blog-section animate-slide-up">
          <div className="blog-header">
            <h3 className="table-title">Your Blogs</h3>
            <button className="actn-btn add-blog-btn" onClick={() => navigate('/add-blog')}>
              Add New Blog
            </button>
          </div>
          <div className="doctor-blog-list">
            {blogs.length > 0 ? (
              blogs.map((blog) => {
                const plainTextContent = htmlToText(blog.content, { limits: { maxInputLength: 100000 }, preserveNewlines: false }).replace(/--+/g, ' ');
                const truncatedContent = plainTextContent.split(" ").slice(0, 20).join(" ") + '...';

                return (
                  <div key={blog._id} className="blog-card">
                    {blog.imageURL ? (
                      <img src={blog.imageURL} alt="Blog Cover" className="blog-image" />
                    ) : (
                      <div className="blog-image-placeholder">No Image</div>
                    )}
                    <div className="blog-content">
                      <h3 className="blog-title">{blog.title}</h3>
                      <p className="blog-date">{new Date(blog.createdAt).toLocaleDateString()}</p>
                      <p className="blog-text">{truncatedContent}</p>
                      <div className="blog-actions">
                        <button className="actn-btn edit" onClick={(e) => { e.stopPropagation(); handleEditBlog(blog._id); }}>
                          <FontAwesomeIcon icon={faEdit} /> Edit
                        </button>
                        <button className="actn-btn delete" onClick={(e) => { e.stopPropagation(); handleDeleteBlog(blog._id); }}>
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-blogs">
                <p>No blogs available. Start sharing your insights!</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default DoctorDashboard;