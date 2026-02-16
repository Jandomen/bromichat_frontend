import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const ConversationSearch = ({ onResults }) => {
  const { token } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BACKEND}/conversation/search`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { query },
        }
      );
      onResults(res.data);
    } catch (err) {
      // console.error('Error al buscar conversaciones:', err);
      onResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-3 bg-white border-b sticky top-0 z-20">
      <div className="relative flex items-center w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
          placeholder="Buscar conversaciones..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value === '') onResults(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationSearch;
