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
    <div className="flex mb-4">
      <input
        type="text"
        className="flex-1 border rounded-l px-3 py-2"
        placeholder="Buscar conversaciones..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-4 py-2 rounded-r"
      >
        {loading ? 'Buscando...' : 'Buscar'}
      </button>
    </div>
  );
};

export default ConversationSearch;
