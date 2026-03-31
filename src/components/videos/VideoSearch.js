import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { Search, X } from 'lucide-react';

const VideoSearch = ({ onSearch, placeholder = "Buscar videos por título..." }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((term) => {
      onSearch(term.trim());
    }, 400),
    [] // Empty dependency array means this function is created once
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  return (
    <div className="relative group max-w-2xl mx-auto w-full px-4">
      <div className="absolute inset-y-0 left-3 xs:left-4 sm:left-8 flex items-center pointer-events-none">
        <Search className={`w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 transition-colors ${searchTerm ? 'text-red-500' : 'text-gray-400'}`} />
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 xs:pl-10 sm:pl-14 pr-9 xs:pr-10 sm:pr-12 py-2 xs:py-2.5 sm:py-4 bg-white border border-gray-200 rounded-xl xs:rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-red-500 transition-all text-gray-700 placeholder-gray-400 text-[10px] xs:text-[11px] sm:text-lg font-medium"
      />

      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute inset-y-0 right-3 xs:right-4 sm:right-8 flex items-center text-gray-400 hover:text-red-500 transition-colors"
        >
          <X className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* Decorative gradient border on focus */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-red-600 to-red-400 rounded-2xl opacity-0 blur-xl group-focus-within:opacity-20 transition-opacity duration-500"></div>
    </div>
  );
};

export default VideoSearch;
