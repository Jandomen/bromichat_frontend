import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import api from '../../services/api';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';
import Layout from '../Layout/Layout';
import { FaSearch, FaUserFriends, FaUsers, FaUserPlus } from 'react-icons/fa';

const FriendsList = ({ minimal = false }) => {
  const { userId: paramId } = useParams();
  const { token, user: activeUser } = useContext(AuthContext);
  const { onlineUsers } = useContext(SocketContext);
  const navigate = useNavigate();


  const userId = paramId || activeUser?._id;

  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (friend.name + ' ' + friend.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Content = (
    <div className={`max-w-4xl mx-auto p-4 animate-fade-in ${minimal ? 'p-0' : ''}`}>
      <div className={`bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden ${minimal ? 'shadow-none border-none rounded-none' : ''}`}>
        {/* Header & Tabs */}
        {!minimal && (
          <div className="p-8 border-b border-gray-50 bg-gray-50/20">
            <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FaUserFriends /></span>
              Conexiones
            </h2>

            <div className="flex gap-4 mb-6">
              <Link to={`/user/${userId}/friends`} className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/30 flex items-center gap-2">
                <FaUserFriends /> Amigos
              </Link>
              <Link to={`/user/${userId}/followers`} className="px-6 py-3 rounded-2xl bg-white text-gray-400 hover:text-gray-900 font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
                <FaUsers /> Seguidores
              </Link>
              <Link to={`/user/${userId}/following`} className="px-6 py-3 rounded-2xl bg-white text-gray-400 hover:text-gray-900 font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
                <FaUserPlus /> Siguiendo
              </Link>
            </div>

            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <FaSearch className="text-gray-300 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>
        )}

        <div className={`${minimal ? 'p-0' : 'p-8'}`}>
          {minimal && (
            <div className="mb-6 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-300 group-focus-within:text-primary-500 transition-colors text-xs" />
              </div>
              <input
                type="text"
                placeholder="Filtrar conexiones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all text-xs font-medium"
              />
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 font-medium">Buscando en el círculo...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-2xl">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          ) : filteredFriends.length > 0 ? (
            <div className={`grid grid-cols-1 ${minimal ? 'sm:grid-cols-2' : 'md:grid-cols-2'} gap-4`}>
              {filteredFriends.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center p-4 bg-gray-50/50 hover:bg-white border border-transparent hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 rounded-3xl cursor-pointer transition-all duration-300 group"
                  onClick={() => navigate(`/user/${friend._id}`)}
                >
                  <div className="relative">
                    <img
                      src={getFullImageUrl(friend.profilePicture)}
                      alt={friend.username}
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-md group-hover:scale-110 transition-transform"
                      onError={(e) => (e.target.src = defaultProfile)}
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-4 border-white rounded-full shadow-sm ${onlineUsers.has(friend._id.toString()) ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                      <span className="bg-yellow-400/20 px-2 py-0.5 rounded-lg border border-yellow-400/10">
                        @{friend.username}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 font-medium">
                      {friend.name} {friend.lastName}
                    </p>
                  </div>
                  {!minimal && (
                    <div className="p-3 bg-white rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-lg">👋</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50/30 rounded-[2rem] border border-dashed border-gray-200">
              <div className="text-5xl mb-4">🙊</div>
              <p className="text-gray-400 font-medium">No se encontraron amigos en esta lista.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (minimal) return Content;

  return (
    <Layout>
      {Content}
    </Layout>
  );
};

export default FriendsList;