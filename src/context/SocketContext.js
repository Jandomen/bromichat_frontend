import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext({ socket: null });

export const SocketProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!token || !user?._id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const s = io(process.env.REACT_APP_API_BACKEND, {
      transports: ['polling', 'websocket'],
      auth: { token },
      query: { userId: user._id },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    s.on('connect', () => {
      // console.log('Connected to socket server:', s.id);
      if (user?._id) {
        s.emit('join', user._id);
        s.emit('getInitialOnlineUsers');
      }
    });

    s.on('initialOnlineUsers', (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    s.on('userStatusChanged', ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (status === 'online') next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && s.connected && user?._id) {
        s.emit('join', user._id);
        s.emit('getInitialOnlineUsers');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    setSocket(s);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      s.disconnect();
      setSocket(null);
    };
  }, [token, user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};