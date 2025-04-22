import React, { useState, useEffect, useContext } from 'react';
import Video from 'twilio-video';
import { useNavigate, useLocation } from 'react-router-dom';
import { VideoRoomContext } from './VideoRoomContext';
import './chatwithdoctor.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faCamera } from '@fortawesome/free-solid-svg-icons';

let globalLocalTracks = null;

const ChatWithDoctor = ({ user }) => {
  const location = useLocation();
  const [roomId, setRoomId] = useState(user?.credentials ? location.state?.roomId || '' : '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { joinRoom } = useContext(VideoRoomContext);
  const navigate = useNavigate();
  const [selectedCamera, setSelectedCamera] = useState('');
  const [videoDevices, setVideoDevices] = useState([]);

  const getVideoDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      setVideoDevices(videoInputs);
      if (videoInputs.length > 0) setSelectedCamera(videoInputs[0].deviceId);
    } catch (error) {
      setError('Error accessing video devices: ' + error.message);
    }
  };

  const createOrReuseLocalTracks = async () => {
    if (globalLocalTracks) return globalLocalTracks;
    try {
      const localTracks = await Video.createLocalTracks({
        audio: true,
        video: { width: 640, deviceId: selectedCamera ? { exact: selectedCamera } : undefined },
      });
      globalLocalTracks = localTracks;
      return localTracks;
    } catch (error) {
      setError('Failed to create local tracks: ' + error.message);
      return null;
    }
  };

  const joinRoomHandler = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setError('Please enter a valid Room ID.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/app/twilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, userId: user?.email }),
      });

      if (!response.ok) throw new Error('Failed to get token from server.');
      const data = await response.json();
      const localTracks = await createOrReuseLocalTracks();
      if (!localTracks) return;

      const room = await Video.connect(data.token, { name: roomId, tracks: localTracks });
      
      joinRoom(room, localTracks, user.email);
      navigate('/video-room');
    } catch (err) {
      setError('Error joining the room: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getVideoDevices();
  }, []);

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-box animate-slide-in">
        <h1 className="chat-title">
          Chat with {user?.credentials ? 'Patient' : 'Doctor'} <FontAwesomeIcon icon={faVideo} />
        </h1>
        <form onSubmit={joinRoomHandler} className="chat-form">
          <div className="input-group">
            <label className="input-label" htmlFor="roomId">Room ID</label>
            <input
              id="roomId"
              className="chat-input"
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              readOnly={user?.credentials} // Read-only for doctors
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="cameraSelect">Select Camera</label>
            <div className="select-wrapper">
              <FontAwesomeIcon icon={faCamera} className="select-icon" />
              <select
                id="cameraSelect"
                className="camera-select"
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
              >
                {videoDevices.length === 0 ? (
                  <option value="">No cameras available</option>
                ) : (
                  videoDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId}`}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          <button type="submit" className="join-button" disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join Room'}
          </button>
        </form>
        {error && <p className="error-message animate-fade-in">{error}</p>}
      </div>
    </div>
  );
};

export default ChatWithDoctor;