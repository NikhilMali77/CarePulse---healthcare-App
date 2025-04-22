import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './admindashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage, faUserCircle, faCalendarCheck, faClock, faBan } from '@fortawesome/free-solid-svg-icons';

const AdminDashboard = ({ admin }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`/app/admin/${admin._id}`);
        const sortedAppointments = response.data.appointments.sort(
          (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
        );
        setAppointments(sortedAppointments);
        setLoading(false);
      } catch (err) {
        setError('Failed to load appointments.');
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [admin._id]);

  const handleSchedule = async (appointmentId) => {
    try {
      const response = await axios.post(`/app/admin/${appointmentId}/schedule`);
      if (response.status === 200) {
        setAppointments(prevAppointments =>
          prevAppointments.map(app =>
            app._id === appointmentId ? { ...app, status: 'scheduled' } : app
          )
        );
      }
    } catch (error) {
      console.error('Failed to schedule the appointment:', error);
    }
  };

  const handleCancel = async (appointmentId) => {
    try {
      const response = await axios.post(`/app/admin/${appointmentId}/cancel`);
      if (response.status === 200) {
        setAppointments(prevAppointments =>
          prevAppointments.map(app =>
            app._id === appointmentId ? { ...app, status: 'cancelled' } : app
          )
        );
      }
    } catch (error) {
      console.error('Failed to cancel the appointment:', error);
    }
  };

  const handleViewIdProof = (idProofUrl) => {
    window.open(idProofUrl, '_blank');
  };

  if (loading) return <div className="loading">Loading appointments...</div>;
  if (error) return <div className="error">{error}</div>;

  return admin?.authCode ? (
    <div className="admin-dashboard-container">
      {/* Header with Admin Profile */}
      <header className="admin-dashboard-header animate-fade-in">
        <div className="admin-profile">
          <FontAwesomeIcon icon={faUserCircle} className="admin-profile-icon" />
          <div className="admin-profile-info">
            <h2>Welcome, {admin.name} ✨</h2>
            <p>Admin Dashboard</p>
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <section className="admin-statistics-cards animate-slide-up">
        <div className="admin-card">
          <FontAwesomeIcon icon={faCalendarCheck} className="card-icon" />
          <h3>{appointments.filter(app => app.status === 'scheduled').length}</h3>
          <p>Scheduled</p>
        </div>
        <div className="admin-card">
          <FontAwesomeIcon icon={faClock} className="card-icon" />
          <h3>{appointments.filter(app => app.status === 'pending').length}</h3>
          <p>Pending</p>
        </div>
        <div className="admin-card">
          <FontAwesomeIcon icon={faBan} className="card-icon" />
          <h3>{appointments.filter(app => app.status === 'cancelled').length}</h3>
          <p>Cancelled</p>
        </div>
      </section>

      {/* Appointments Table */}
      <section className="admin-appointment-table animate-slide-up">
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
                  <th>Doctor</th>
                  <th>ID Proof</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="table-row">
                    <td>{appointment.createdBy?.name || 'Unknown'}</td>
                    <td>
                      <span className={`status ${appointment?.status}`}>
                        {appointment?.status.charAt(0).toUpperCase() + appointment?.status.slice(1)}
                      </span>
                    </td>
                    <td>{new Date(appointment?.appointmentDate).toLocaleString()}</td>
                    <td>{appointment?.doctor?.name || 'N/A'}</td>
                    <td>
                      {appointment?.createdBy?.userDetails?.idProof ? (
                        <button
                          onClick={() => handleViewIdProof(appointment.createdBy.userDetails.idProof)}
                          className="admin-view-id-proof-btn"
                        >
                          <FontAwesomeIcon icon={faFileImage} /> View
                        </button>
                      ) : (
                        <span className="no-id-proof">No ID</span>
                      )}
                    </td>
                    <td>{appointment?.reason || 'N/A'}</td>
                    <td>
                      {appointment?.status === 'pending' && (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleSchedule(appointment?._id)}
                            className="admin-action-btn schedule"
                          >
                            Schedule
                          </button>
                          <button
                            onClick={() => handleCancel(appointment?._id)}
                            className="admin-action-btn cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  ) : (
    <div className="no-user">
      <h1>No Admin Found 😔</h1>
      <p>Please log in with admin credentials to access the dashboard.</p>
    </div>
  );
};

export default AdminDashboard;