import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import api from '../services/api';
import MyFriendsList from './MyFriendsList';
import Header from './Header';
import Footer from './Footer';

const Friends = () => {
  const { user: currentUser, token, setUser: setCurrentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRemoveFriend = async (friendId) => {
    if (!token || !currentUser) {
      setError('Debes iniciar sesión para eliminar amigos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.delete(`/friend/remove/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // La lista se actualiza vía Socket.IO
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'No se pudo eliminar amigo';
      setError(errorMessage);
     // console.error('Error al eliminar amigo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !currentUser) return;

    socket.on('friendAdded', ({ friendId, friends }) => {
      if (currentUser._id === friends[0]?.owner) {
        setCurrentUser((prev) => ({ ...prev, friends }));
      }
    });

    socket.on('friendRemoved', ({ friendId, friends }) => {
      if (currentUser._id === friends[0]?.owner) {
        setCurrentUser((prev) => ({ ...prev, friends }));
      }
    });

    return () => {
      socket.off('friendAdded');
      socket.off('friendRemoved');
    };
  }, [socket, currentUser, setCurrentUser]);

  if (!currentUser) {
    return <p className="text-red-500 text-center">Debes iniciar sesión para ver tus amigos.</p>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <div className="p-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Mis Amigos</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <MyFriendsList onRemoveFriend={handleRemoveFriend} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Friends;


