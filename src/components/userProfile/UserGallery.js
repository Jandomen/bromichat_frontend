import React, { useState } from 'react';

const UserGallery = ({ photos = [], scrollToTop }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);

  if (!Array.isArray(photos)) {
   // console.warn('UserGallery: photos prop is not an array:', photos);
    return <p>No hay fotos.</p>;
  }

  const validPhotos = photos.filter(
    (photo) => photo && typeof photo === 'object' && photo.imageUrl
  );

  if (!validPhotos.length) {
    return <p>No hay fotos.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {validPhotos.map((photo, index) => (
          <div key={photo._id || index} className="relative">
            <img
              src={photo.imageUrl || '/default-image.png'}
              alt={photo.description || `Foto ${index + 1}`}
              className="w-full h-48 object-cover rounded cursor-pointer"
              onClick={() => setSelectedMedia({ ...photo, type: 'photo' })}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 text-right">
        <button
          onClick={scrollToTop}
          className="px-4 py-2 rounded text-white font-semibold bg-blue-600 hover:bg-blue-700"
        >
          Volver Arriba
        </button>
      </div>

      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative bg-white p-4 rounded max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedMedia.imageUrl || '/default-image.png'}
              alt={selectedMedia.description || 'Foto'}
              className="w-full rounded mb-2 max-h-[80vh] object-contain"
            />
            <p className="mb-2">{selectedMedia.description || 'Sin descripción'}</p>
            <button
              className="absolute top-2 right-2 text-white text-2xl font-bold"
              onClick={() => setSelectedMedia(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserGallery;