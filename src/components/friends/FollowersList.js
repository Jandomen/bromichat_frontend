import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';
import Layout from '../Layout/Layout';
import { FaSearch, FaUserFriends, FaUsers, FaUserPlus } from 'react-icons/fa';

const FollowersList = ({ minimal = false }) => {
  const { userId: paramId } = useParams();
  const { token, user: activeUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Si no hay paramId, usamos el del usuario activo
  const userId = paramId || activeUser?._id;

  const [followers, setFollowers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await api.get(`/friend/followers/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowers(res.data.followers || []);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Error al cargar la lista de seguidores'
        );
        setLoading(false);
      }
    };

    if (token) {
      fetchFollowers();
    } else {
      setError('Debes iniciar sesión para ver la lista de seguidores');
      setLoading(false);
    }
  }, [userId, token]);

  const filteredFollowers = followers.filter(follower =>
    follower.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (follower.name + ' ' + follower.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Content = (
    <div className={`max-w-4xl mx-auto p-4 animate-fade-in ${minimal ? 'p-0' : ''}`}>
      <div className={`bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden ${minimal ? 'shadow-none border-none rounded-none' : ''}`}>
        {/* Header & Tabs */}
        {!minimal && (
          <div className="p-8 border-b border-gray-50 bg-gray-50/20">
            <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><FaUsers /></span>
              Conexiones
            </h2>

            <div className="flex gap-4 mb-6">
              <Link to={`/user/${userId}/friends`} className="px-6 py-3 rounded-2xl bg-white text-gray-400 hover:text-gray-900 font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
                <FaUserFriends /> Amigos
              </Link>
              <Link to={`/user/${userId}/followers`} className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-500/30 flex items-center gap-2">
                <FaUsers /> Seguidores
              </Link>
              <Link to={`/user/${userId}/following`} className="px-6 py-3 rounded-2xl bg-white text-gray-400 hover:text-gray-900 font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
                <FaUserPlus /> Siguiendo
              </Link>
            </div>

            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <FaSearch className="text-gray-300 group-focus-within:text-purple-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm font-medium"
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
                placeholder="Filtrar seguidores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all text-xs font-medium"
              />
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="text-gray-500 font-medium">Cargando seguidores...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-2xl">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          ) : filteredFollowers.length > 0 ? (
            <div className={`grid grid-cols-1 ${minimal ? 'sm:grid-cols-2' : 'md:grid-cols-2'} gap-4`}>
              {filteredFollowers.map((follower) => (
                <div
                  key={follower._id}
                  className="flex items-center p-4 bg-gray-50/50 hover:bg-white border border-transparent hover:border-purple-100 hover:shadow-xl hover:shadow-purple-500/5 rounded-3xl cursor-pointer transition-all duration-300 group"
                  onClick={() => navigate(`/user/${follower._id}`)}
                >
                  <div className="relative">
                    <img
                      src={getFullImageUrl(follower.profilePicture)}
                      alt={follower.username}
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-md group-hover:scale-110 transition-transform"
                      onError={(e) => (e.target.src = defaultProfile)}
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-4 border-white rounded-full shadow-sm ${follower.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-black text-gray-900 group-hover:text-purple-600 transition-colors">@{follower.username}</p>
                    <p className="text-sm text-gray-500 font-medium">
                      {follower.name} {follower.lastName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50/30 rounded-[2rem] border border-dashed border-gray-200">
              <div className="text-5xl mb-4">🙊</div>
              <p className="text-gray-400 font-medium">Aún no tienes seguidores.</p>
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

export default FollowersList;