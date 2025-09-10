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
      //console.warn('Token o userId no disponibles, socket no inicializado');
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

    const joinRooms = async () => {
      s.emit('join', user._id);
      //console.log(`Unido a la sala privada: ${user._id}`);

      try {
        const res = await fetch(`${process.env.REACT_APP_API_BACKEND}/group/groups`, {
  headers: { Authorization: `Bearer ${token}` },
});



        const data = await res.json();
        const groups = data.groups || data; 
        groups.forEach(group => {
          s.emit('join_group', { groupId: group._id });
          //console.log(`Unido a la sala del grupo: ${group._id}`);
        });
      } catch (err) {
        //console.error('Error al obtener grupos:', err);
      }
    };

    s.on('connect', () => {
      //console.log('Conectado al servidor de sockets:', s.id);
      joinRooms();
    });

    s.on('connect_error', (err) => {
      //console.error('Error de conexión al socket:', err.message);
    });

    s.on('disconnect', (reason) => {
      //console.warn('Desconectado del servidor de sockets:', reason);
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [token, user?._id]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
