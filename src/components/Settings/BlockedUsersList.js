import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';

const BlockedUsersList = () => {
  const { token, user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
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
          'Error al cargar la lista de usuarios bloqueados'
        );
        setLoading(false);
      }
    };

    if (token) {
      fetchBlockedUsers();
    } else {
      setError('Debes iniciar sesión para ver la lista de usuarios bloqueados');
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <p className="text-center text-gray-600">Cargando usuarios bloqueados...</p>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Usuarios Bloqueados</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {blockedUsers.length > 0 ? (
        <ul className="space-y-2">
          {blockedUsers.map((user) => (
            <li
              key={user._id}
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
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
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No hay usuarios bloqueados para mostrar.</p>
      )}
    </div>
  );
};

export default BlockedUsersList;