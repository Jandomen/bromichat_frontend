import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import defaultProfile from '../../assets/default-profile.png';
import debounce from 'lodash.debounce';

// Helper que soporta Cloudinary y fallback
const getFullImageUrl = (path) => {
  if (!path) return defaultProfile;         // fallback si no hay path
  if (path.startsWith('http')) return path; // URL absoluta (Cloudinary)
  return `${process.env.REACT_APP_API_BACKEND}${path}`; // ruta relativa
};

const UserSearch = () => {
  const { token, user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const debouncedSearch = debounce(async (term) => {
    if (!term.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/user/search?query=${encodeURIComponent(term)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sortedResults = res.data.users.sort((a, b) =>
        a.username.toLowerCase().startsWith(term.toLowerCase()) ? -1 : 1
      );
      setResults(sortedResults);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al buscar usuarios');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, 500);

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, token]);

  const handleStartChat = async (otherUserId) => {
    try {
      const payload = { participantIds: [user._id, otherUserId].sort(), isGroup: false };
      const res = await api.post('/conversation/create', payload);
      const convoId =
        res.data?._id || res.data?.conversation?._id || res.data?.id || null;
      if (!convoId) {
        setError('No se pudo obtener el ID de la conversación');
        return;
      }
      navigate(`/chat/${convoId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'No se pudo iniciar la conversación');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Buscar Usuarios</h2>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Nombre o username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-6 text-center">{error}</p>}

      {results.length > 0 ? (
        <ul className="space-y-4">
          {results.map((u) => (
            <li key={u._id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img
                  src={getFullImageUrl(u.profilePicture)}
                  alt={`Perfil de ${u.username}`}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  onError={(e) => { e.target.src = defaultProfile; }}
                />
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{u.username}</p>
                  <p className="text-sm text-gray-500">{u.name} {u.lastName}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  onClick={() => navigate(`/user/${u._id}`)}
                >
                  Ver perfil
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  onClick={() => handleStartChat(u._id)}
                >
                  Mensaje
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !loading &&
        searchTerm.trim() && (
          <p className="text-center text-gray-500 bg-white p-4 rounded-lg shadow-sm">
            No se encontraron usuarios. Intenta con otro término.
          </p>
        )
      )}
    </div>
  );
};

export default UserSearch;
