import React, { createContext, useState } from 'react';

export const VideoRoomContext = createContext();

export const VideoRoomProvider = ({ children }) => {
  const [room, setRoom] = useState(null);
  const [localTracks, setLocalTracks] = useState(null);
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [identity, setIdentity] = useState('');

  const joinRoom = (newRoom, tracks, userIdentity) => {
    setRoom(newRoom);
    console.log('joined room')
    setLocalTracks(tracks);
    setIdentity(userIdentity);
  };

  const addRemoteParticipant = (participant) => {
    setRemoteParticipants((prev) => [...prev, participant]);
  };

  const removeRemoteParticipant = (participant) => {
    setRemoteParticipants((prev) => prev.filter((p) => p.identity !== participant.identity));
  };

  const disconnectRoom = () => {
    if (room) {
      room.disconnect();
    }
    setRoom(null);
    setLocalTracks(null);
    setRemoteParticipants([]);
    setIdentity('');
  };

  return (
    <VideoRoomContext.Provider
      value={{
        room,
        localTracks,
        identity,
        remoteParticipants,
        joinRoom,
        addRemoteParticipant,
        removeRemoteParticipant,
        disconnectRoom,
      }}
    >
      {children}
    </VideoRoomContext.Provider>
  );
};
