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
    <div className={`max-w-4xl mx-auto p-2 xs:p-4 animate-fade-in ${minimal ? 'p-0' : ''}`}>
      <div className={`bg-white rounded-[1.5rem] xs:rounded-[2rem] shadow-sm sm:shadow-xl border border-gray-100 overflow-hidden ${minimal ? 'shadow-none border-none rounded-none' : ''}`}>
        {/* Header & Tabs */}
        {!minimal && (
          <div className="p-2 xs:p-5 border-b border-gray-50 bg-gray-50/20">
            <h2 className="text-[12px] xs:text-xl sm:text-3xl font-black text-gray-900 mb-4 flex items-center gap-2 lowercase tracking-tighter">
              <span className="p-1 xs:p-2 bg-purple-50 text-purple-600 rounded-lg"><FaUsers size={12} /></span>
              conexiones
            </h2>

            <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar pb-1">
              <Link to={`/user/${userId}/friends`} className="px-3 py-1.5 rounded-lg bg-white text-gray-400 hover:text-gray-900 font-black text-[9px] uppercase tracking-tighter transition-all flex-shrink-0 flex items-center gap-1">
                <FaUserFriends size={10} /> Compas
              </Link>
              <Link to={`/user/${userId}/followers`} className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-black text-[9px] uppercase tracking-tighter shadow-sm flex-shrink-0 flex items-center gap-1">
                <FaUsers size={10} /> Seguidores
              </Link>
              <Link to={`/user/${userId}/following`} className="px-3 py-1.5 rounded-lg bg-white text-gray-400 hover:text-gray-900 font-black text-[9px] uppercase tracking-tighter transition-all flex-shrink-0 flex items-center gap-1">
                <FaUserPlus size={10} /> Siguiendo
              </Link>
            </div>

            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 xs:pl-5 flex items-center pointer-events-none">
                <FaSearch size={8} className="text-gray-300 group-focus-within:text-purple-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Buscar seguidores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 xs:pl-12 pr-4 py-1.5 xs:py-2.5 bg-white border border-gray-200 rounded-lg xs:rounded-xl shadow-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-[9.5px] xs:text-sm font-medium"
              />
            </div>
          </div>
        )}

        <div className={`${minimal ? 'p-0' : 'p-3 xs:p-8'}`}>
          {minimal && (
            <div className="mb-3 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch size={8} className="text-gray-300 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Filtrar seguidores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 xs:py-2.5 bg-gray-50 border border-gray-100 rounded-lg xs:rounded-xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all text-[9.5px] xs:text-sm font-medium"
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
            <div className={`grid grid-cols-1 ${minimal ? 'sm:grid-cols-2' : 'md:grid-cols-2'} gap-1.5 xs:gap-2`}>
              {filteredFollowers.map((follower) => (
                <div
                  key={follower._id}
                  className="flex items-center p-1.5 xs:p-2 bg-gray-50/50 hover:bg-white border border-transparent hover:border-purple-100 hover:shadow-xl hover:shadow-purple-500/5 rounded-xl xs:rounded-2xl cursor-pointer transition-all duration-300 group"
                  onClick={() => navigate(`/user/${follower._id}`)}
                >
                  <div className="relative">
                    <img
                      src={getFullImageUrl(follower.profilePicture)}
                      alt={follower.username}
                      className="w-8 h-8 xs:w-10 xs:h-10 rounded-lg xs:rounded-xl object-cover ring-1 ring-white shadow-sm group-hover:scale-105 transition-transform"
                      onError={(e) => (e.target.src = defaultProfile)}
                    />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full shadow-sm ${follower.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="ml-1.5 xs:ml-2.5 flex-1 min-w-0">
                    <p className="font-black text-gray-900 group-hover:text-purple-600 transition-colors text-[9px] xs:text-[11px] truncate lowercase tracking-tighter">
                      @{follower.username}
                    </p>
                    <p className="text-[8px] xs:text-[10px] text-gray-400 font-bold truncate tracking-widest uppercase">
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