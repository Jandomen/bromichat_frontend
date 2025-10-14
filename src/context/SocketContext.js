import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext({ socket: null });

export const SocketProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token || !user?._id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      console.warn('Token or userId not available, socket not initialized');
      return;
    }

    const s = io(process.env.REACT_APP_API_BACKEND, {
      transports: ['websocket'],
      auth: { token },
      query: { userId: user._id },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    s.on('connect', () => {
      console.log('Connected to socket server:', s.id);
    });

    s.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    s.on('disconnect', (reason) => {
      console.warn('Disconnected from socket server:', reason);
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [token, user?._id]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};