import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import defaultProfile from '../../assets/default-profile.png';
import debounce from 'lodash.debounce';
import { getFullImageUrl } from '../../utils/getProfilePicture';

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
      <div className="mb-3 text-center lowercase">
        <h2 className="text-sm xs:text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-black mb-1">
          buscar usuarios
        </h2>
        <p className="text-gray-500 text-[8.5px] xs:text-[10px] sm:text-xs uppercase tracking-widest">Encuentra compas y conecta con nuevas personas</p>
      </div>

      <div className="relative mb-4 max-w-[260px] xs:max-w-lg mx-auto group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-3 w-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Busca compas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 xs:py-2.5 bg-white border border-gray-200 rounded-lg xs:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-700 placeholder-gray-400 text-[10px] xs:text-sm"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 animate-fadeIn">
          {results.map((u) => (
            <div
              key={u._id}
              onClick={() => navigate(`/user/${u._id}`)}
              className="bg-white rounded-xl p-2 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md sm:hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 pointer-events-none"></div>

              <div className="relative mb-1 flex-shrink-0">
                <div className="absolute inset-0 bg-red-50 rounded-full transform rotate-6 scale-0 group-hover:scale-110 transition-transform duration-300"></div>
                <img
                  src={getFullImageUrl(u.profilePicture)}
                  alt={`Perfil de ${u.username}`}
                  className="w-10 h-10 xs:w-16 xs:h-16 rounded-xl object-cover border border-white shadow-sm relative z-10 group-hover:scale-105 transition-transform"
                  onError={(e) => { e.target.src = defaultProfile; }}
                />
              </div>

              <div className="flex-grow min-w-0 w-full mb-1">
                <h3 className="font-black text-gray-900 text-[10px] xs:text-sm truncate lowercase tracking-tighter">@{u.username}</h3>
                <p className="text-[9px] xs:text-sm text-gray-500 truncate mb-1">{u.name} {u.lastName}</p>
                
                <div className="flex flex-col gap-0.5 mb-1">
                  <span className="text-[7.5px] xs:text-[9px] font-bold text-gray-400 bg-gray-50 px-1 py-0.5 rounded-full border border-gray-100 uppercase tracking-tighter">{u.friends?.length || 0} Compas</span>
                  <span className="text-[7.5px] xs:text-[9px] font-bold text-gray-400 bg-gray-50 px-1 py-0.5 rounded-full border border-gray-100 uppercase tracking-tighter">{u.followers?.length || 0} Segus</span>
                </div>
              </div>

              <div className="flex gap-1 items-center w-full justify-center" onClick={(e) => e.stopPropagation()}>
                <button
                  className="flex-1 py-1 bg-gray-50 text-gray-700 text-[8px] xs:text-[10px] font-bold uppercase rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200"
                  onClick={() => navigate(`/user/${u._id}`)}
                >
                  Perfil
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && searchTerm.trim() && (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300 max-w-sm mx-auto shadow-sm">
            <svg className="mx-auto h-8 w-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No encontramos usuarios</p>
          </div>
        )
      )}
    </div>
  );
};

export default UserSearch;
