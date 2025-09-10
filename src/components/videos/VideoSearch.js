// src/components/videos/VideoSearch.js
import React, { useState } from 'react';

const VideoSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <div className="mb-6">
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder="Buscar videos por título..."
        className="border p-2 rounded w-full"
      />
    </div>
  );
};

export default VideoSearch;
