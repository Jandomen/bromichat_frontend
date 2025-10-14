import React, { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';

const VideoSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = debounce((term) => {
    onSearch(term.trim());
  }, 400);

  useEffect(() => {
    debouncedSearch(searchTerm);

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  return (
    <div className="mb-6">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar videos por título..."
        className="border p-2 rounded w-full"
      />
    </div>
  );
};

export default VideoSearch;
