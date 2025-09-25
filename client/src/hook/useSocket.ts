import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export const useSocket = (serverUrl: string) => {
  const [socket, setSocket] =  useState<Socket | null>(null);
  const { userInfo } = useAuth();

  useEffect(() => {
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    // If a user is logged in, tell the server who they are
    if (userInfo) {
      newSocket.emit('authenticate', userInfo._id);
    }

    return () => {
      newSocket.disconnect();
    };
  }, [serverUrl, userInfo]);

  return socket;
};