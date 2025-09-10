import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import api from '../../services/api';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';

const MyBlockedUsersList = ({ onUnblockUser }) => {
  const { user: currentUser, token } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyBlockedUsers = async () => {
      if (!token || !currentUser?._id) {
        setError('Debes iniciar sesión para ver tus usuarios bloqueados');
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/friend/blocked', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlockedUsers(res.data.blockedUsers || []);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Error al cargar tus usuarios bloqueados'
        );
        setLoading(false);
      }
    };

    fetchMyBlockedUsers();
  }, [token, currentUser]);

  useEffect(() => {
    if (!socket || !currentUser) return;

    socket.on('userBlocked', ({ targetId, blockedUsers }) => {
      if (currentUser._id === blockedUsers[0]?.owner) {
        setBlockedUsers(blockedUsers);
      }
    });

    socket.on('userUnblocked', ({ targetId, blockedUsers }) => {
      if (currentUser._id === blockedUsers[0]?.owner) {
        setBlockedUsers(blockedUsers);
      }
    });

    return () => {
      socket.off('userBlocked');
      socket.off('userUnblocked');
    };
  }, [socket, currentUser]);

  if (loading) {
    return <p className="text-center text-gray-600">Cargando usuarios bloqueados...</p>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2 text-gray-900">Mis Usuarios Bloqueados</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {blockedUsers.length > 0 ? (
        <ul className="space-y-2">
          {blockedUsers.map((user) => (
            <li
              key={user._id}
              className="flex items-center justify-between p-2 hover:bg-gray-100"
            >
              <div
                className="flex items-center cursor-pointer"
                onClick={() => navigate(`/user/${user._id}`)}
              >
                <img
                  src={getFullImageUrl(user.profilePicture || defaultProfile)}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-600">
                    {user.name} {user.lastName}
                  </p>
                </div>
              </div>
              {onUnblockUser && (
                <button
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                  onClick={() => onUnblockUser(user._id)}
                >
                  Desbloquear
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No tienes usuarios bloqueados.</p>
      )}
    </div>
  );
};

export default MyBlockedUsersList;