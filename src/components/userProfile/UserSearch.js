import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import defaultProfile from '../../assets/default-profile.png';
import debounce from 'lodash.debounce';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import SendMessageButton from '../../buttons/SendMessageButton';

const UserSearch = () => {
  const { token } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const debouncedSearch = useMemo(
    () =>
      debounce(async (term) => {
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
      }, 500),
    [token]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  return (
    <div className="max-w-4xl mx-auto p-0">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-black mb-2">
          Buscar Usuarios
        </h2>
        <p className="text-gray-500">Encuentra amigos y conecta con nuevas personas</p>
      </div>

      <div className="relative mb-6 max-w-2xl mx-auto group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Busca por nombre o usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-700 placeholder-gray-400 text-lg"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg max-w-2xl mx-auto animate-fadeIn">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {results.map((u) => (
            <div
              key={u._id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

              <div className="relative mb-4">
                <div className="absolute inset-0 bg-blue-100 rounded-full transform rotate-6 scale-0 group-hover:scale-110 transition-transform duration-300"></div>
                <img
                  src={getFullImageUrl(u.profilePicture)}
                  alt={`Perfil de ${u.username}`}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md relative z-10 cursor-pointer"
                  onClick={() => navigate(`/user/${u._id}`)}
                  onError={(e) => { e.target.src = defaultProfile; }}
                />
              </div>

              <h3 className="font-bold text-gray-900 text-lg mb-1">{u.username}</h3>
              <p className="text-sm text-gray-500 mb-6">{u.name} {u.lastName}</p>

              <div className="flex gap-3 w-full mt-auto">
                <button
                  className="flex-1 py-2 px-3 bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200"
                  onClick={() => navigate(`/user/${u._id}`)}
                >
                  Perfil
                </button>
                <SendMessageButton recipientId={u._id} variant="full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && searchTerm.trim() && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 max-w-2xl mx-auto shadow-sm">
            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No encontramos usuarios con ese nombre</p>
            <p className="text-gray-400 text-sm mt-1">Prueba verificando la ortografía</p>
          </div>
        )
      )}
    </div>
  );
};

export default UserSearch;
