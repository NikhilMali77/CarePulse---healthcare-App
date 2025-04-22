import React, { useEffect, useRef, useContext, useState } from 'react';
import { VideoRoomContext } from './VideoRoomContext';
import './videoroom.css';
import { LocalDataTrack } from 'twilio-video';
import { useNavigate } from 'react-router-dom';

const VideoRoom = () => {
  const {
    room,
    localTracks,
    identity,
    remoteParticipants,
    addRemoteParticipant,
    removeRemoteParticipant,
    disconnectRoom
  } = useContext(VideoRoomContext);

  const localVideoRef = useRef(null);
  const remoteVideoContainerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const showLocalVideoRef = useRef(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showLocalVideo, setShowLocalVideo] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [dataTrack, setDataTrack] = useState(null);
  const navigate = useNavigate();

  // Keep ref in sync with state
  useEffect(() => {
    showLocalVideoRef.current = showLocalVideo;
  }, [showLocalVideo]);

  // ✅ Fix: Re-attach local video track when showing local video again
  useEffect(() => {
    if (showLocalVideo && localVideoRef.current && localTracks) {
      const localVideoTrack = localTracks.find(track => track.kind === 'video');
      if (localVideoTrack) {
        localVideoTrack.attach(localVideoRef.current);
      }
    }
  }, [showLocalVideo, localTracks]);

  useEffect(() => {
    const enterFullScreen = () => {
      const elem = document.documentElement;
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
          console.error("Error attempting to enable full-screen mode:", err);
        });
      }
    };

    enterFullScreen();

    if (!room || !localTracks) return;

    const localVideoTrack = localTracks.find(track => track.kind === 'video');
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.attach(localVideoRef.current);
    }

    const newDataTrack = new LocalDataTrack();
    room.localParticipant.publishTrack(newDataTrack).then(() => {
      setDataTrack(newDataTrack);
    });

    room.participants.forEach(attachRemoteParticipantTracks);

    room.on('participantConnected', attachRemoteParticipantTracks);
    room.on('participantDisconnected', participant => {
      cleanupRemoteVideoTracks(participant);
      removeRemoteParticipant(participant);
    });

    return () => {
      if (dataTrack && room?.localParticipant) {
        room.localParticipant.unpublishTrack(dataTrack).catch(console.error);
      }
      disconnectRoom();
    };
  }, [room, localTracks]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const attachRemoteParticipantTracks = (participant) => {
    participant.tracks.forEach(publication => {
      if (publication.track && publication.isSubscribed) {
        const track = publication.track;
        track.kind === 'data' ? handleDataTrack(track, participant.identity) : attachTrackToContainer(track);
      }
    });

    participant.on('trackSubscribed', track => {
      track.kind === 'data' ? handleDataTrack(track, participant.identity) : attachTrackToContainer(track);
    });

    participant.on('trackUnsubscribed', track => {
      if (track.kind !== 'data') detachTrackFromContainer(track);
    });

    addRemoteParticipant({ identity: participant.identity });
  };

  const handleDataTrack = (track, participantIdentity) => {
    track.on('message', data => {
      const message = {
        sender: participantIdentity,
        text: data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, message]);
    });
  };

  const attachTrackToContainer = (track) => {
    if (track.kind === 'video') {
      const existing = Array.from(remoteVideoContainerRef.current.children);
      if (existing.some(el => el.dataset.trackSid === track.sid)) return;

      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      wrapper.style.margin = '8px';
      wrapper.style.borderRadius = '12px';
      wrapper.style.overflow = 'hidden';
      wrapper.dataset.trackSid = track.sid;

      // ⬇️ Set width dynamically based on showLocalVideo
      if (!showLocalVideoRef.current) {
        wrapper.style.width = '800px';
      }

      const videoElement = document.createElement('video');
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      videoElement.style.borderRadius = '12px';
      track.attach(videoElement);

      const fullscreenBtn = document.createElement('div');
      fullscreenBtn.innerHTML = '🔍';
      fullscreenBtn.title = 'Fullscreen';
      fullscreenBtn.style.position = 'absolute';
      fullscreenBtn.style.bottom = '8px';
      fullscreenBtn.style.right = '8px';
      fullscreenBtn.style.background = 'rgba(0, 0, 0, 0.5)';
      fullscreenBtn.style.color = '#fff';
      fullscreenBtn.style.padding = '4px 6px';
      fullscreenBtn.style.borderRadius = '6px';
      fullscreenBtn.style.cursor = 'pointer';
      fullscreenBtn.style.fontSize = '16px';

      fullscreenBtn.onclick = () => {
        if (videoElement.requestFullscreen) videoElement.requestFullscreen();
      };

      wrapper.appendChild(videoElement);
      wrapper.appendChild(fullscreenBtn);
      remoteVideoContainerRef.current.appendChild(wrapper);
    }
    if (track.kind === 'audio') {
      // ✅ Attach audio track
      const audioElement = track.attach();
      audioElement.autoplay = true;
      remoteVideoContainerRef.current.appendChild(audioElement);
    }
  };

  const detachTrackFromContainer = (track) => {
    const videoElements = Array.from(remoteVideoContainerRef.current.children);
    videoElements.forEach(el => {
      if (el.dataset.trackSid === track.sid) el.remove();
    });
  };

  const cleanupRemoteVideoTracks = (participant) => {
    const videoElements = Array.from(remoteVideoContainerRef.current.children);
    videoElements.forEach(el => {
      if (el.srcObject?.id === participant.sid) el.remove();
    });
  };

  const toggleMute = () => {
    if (!room) return;
    room.localParticipant.audioTracks.forEach(trackPublication => {
      const track = trackPublication.track;
      track.isEnabled ? track.disable() : track.enable();
      setIsMuted(!track.isEnabled);
    });
  };

  const toggleVideo = () => {
    if (!room) return;
    room.localParticipant.videoTracks.forEach(trackPublication => {
      const track = trackPublication.track;
      track.isEnabled ? track.disable() : track.enable();
      setIsVideoOff(!track.isEnabled);
    });
  };

  const toggleLocalVideoDisplay = () => {
    setShowLocalVideo(prev => !prev);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && dataTrack) {
      dataTrack.send(newMessage);
      const message = {
        sender: identity,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleLeaveRoom = () => {
    disconnectRoom();
    if (localTracks) {
      localTracks.forEach(track => track.stop());
    }
    navigate('/chat');
  };

  return (
    <div className="video-room-container">
      <h2 className="video-room-title">Video Room</h2>
      <div className={`video-grid ${!showLocalVideo ? 'full-remote' : ''}`}>
        {showLocalVideo && (
          <div className="local-video-container">
            <h3>Your Video</h3>
            <p className="identity-label">{identity}</p>
            <video ref={localVideoRef} autoPlay muted={isMuted} playsInline className="local-video" />
          </div>
        )}
        <div className="remote-container" style={{ textAlign: showLocalVideo === false && 'center' }} ref={remoteVideoContainerRef}>
          <h3>Remote Participant</h3>
          {remoteParticipants.length === 0 ? (
            <p>No remote participant connected</p>
          ) : (
            remoteParticipants.map((participant, index) => (
              <div key={index} className="remote-participant">
                <p>{participant.identity}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="controls">
        <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
        <button onClick={toggleVideo}>{isVideoOff ? 'Turn Video On' : 'Turn Video Off'}</button>
        <button onClick={toggleLocalVideoDisplay}>{showLocalVideo ? 'Hide Your Video' : 'Show Your Video'}</button>
        <button onClick={() => setShowChat(prev => !prev)}>{showChat ? 'Hide Chat' : 'Show Chat'}</button>
        <button onClick={handleLeaveRoom}>Leave Room</button>
      </div>

      {showChat && (
        <div className="chat-panel">
          <h3>Chat</h3>
          <div className="chat-messages" ref={chatContainerRef}>
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.sender === identity ? 'sent' : 'received'}`}
              >
                <span className="chat-sender">{msg.sender}</span>: {msg.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VideoRoom;
