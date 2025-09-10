import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';

const FriendsList = () => {
  const { userId } = useParams(); 
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await api.get(`/friend/friends/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(res.data.friends || []);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Error al cargar la lista de amigos'
        );
        setLoading(false);
      }
    };

    if (token) {
      fetchFriends();
    } else {
      setError('Debes iniciar sesión para ver la lista de amigos');
      setLoading(false);
    }
  }, [userId, token]);

  if (loading) {
    return <p className="text-center text-gray-600">Cargando amigos...</p>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Amigos</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {friends.length > 0 ? (
        <ul className="space-y-2">
          {friends.map((friend) => (
            <li
              key={friend._id}
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate(`/user/${friend._id}`)}
            >
              <img
                src={getFullImageUrl(friend.profilePicture || defaultProfile)}
                alt={friend.username}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div>
                <p className="font-semibold">{friend.username}</p>
                <p className="text-sm text-gray-600">
                  {friend.name} {friend.lastName}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No hay amigos para mostrar.</p>
      )}
    </div>
  );
};

export default FriendsList;