import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { getFullImageUrl } from '../../utils/getProfilePicture';

const UserGallery = ({ photos = [], scrollToTop }) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);

  const validPhotos = useMemo(() => {
    if (!Array.isArray(photos)) return [];
    return photos.filter(
      (photo) => photo && typeof photo === 'object' && photo.imageUrl
    );
  }, [photos]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedMediaIndex === null) return;
      if (e.key === 'Escape') setSelectedMediaIndex(null);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMediaIndex((prev) => (prev + 1) % validPhotos.length);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMediaIndex((prev) => (prev - 1 + validPhotos.length) % validPhotos.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMediaIndex, validPhotos]);

  if (!Array.isArray(photos)) {
    return <p>No hay fotos.</p>;
  }

  if (!validPhotos.length) {
    return <p>No hay fotos.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 xs:gap-3">
        {validPhotos.map((photo, index) => (
          <div
            key={photo._id || index}
            className="group relative aspect-square overflow-hidden rounded-md bg-gray-100 cursor-pointer shadow-sm hover:shadow-md transition-all"
            onClick={() => setSelectedMediaIndex(index)}
          >
            <img
              src={getFullImageUrl(photo.imageUrl)}
              alt={photo.description || `Foto ${index + 1}`}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 font-semibold text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm transition-opacity">
                Ver Foto
              </span>
            </div>
          </div>
        ))}
      </div>

      {validPhotos.length > 8 && (
        <div className="mt-6 text-center">
          <button
            onClick={scrollToTop}
            className="px-6 py-2 rounded-full text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 transition"
          >
            ↑ Volver Arriba
          </button>
        </div>
      )}

      {selectedMediaIndex !== null && (
        <div
          className="fixed inset-0 bg-black/98 backdrop-blur-3xl flex items-center justify-center z-[200] animate-in fade-in duration-300"
          onClick={() => setSelectedMediaIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedMediaIndex(null)}
            className="absolute top-6 right-6 z-[220] p-4 bg-white/10 hover:bg-red-600 text-white rounded-full backdrop-blur-xl border border-white/20 transition-all shadow-2xl active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative w-screen h-screen flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getFullImageUrl(validPhotos[selectedMediaIndex].imageUrl)}
              alt={validPhotos[selectedMediaIndex].description || 'Foto'}
              className="max-w-full max-h-screen object-contain shadow-2xl transition-transform duration-500"
            />
            {validPhotos[selectedMediaIndex].description && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white px-8 py-4 rounded-3xl border border-white/10 text-sm font-medium max-w-[80%] text-center shadow-2xl">
                {validPhotos[selectedMediaIndex].description}
              </div>
            )}

            {/* Nav Arrows (Desktop) */}
            <button
              className="hidden md:block absolute left-4 p-4 text-white/20 hover:text-white transition-colors"
              onClick={() => setSelectedMediaIndex((prev) => (prev - 1 + validPhotos.length) % validPhotos.length)}
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              className="hidden md:block absolute right-4 p-4 text-white/20 hover:text-white transition-colors"
              onClick={() => setSelectedMediaIndex((prev) => (prev + 1) % validPhotos.length)}
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};


export default UserGallery;