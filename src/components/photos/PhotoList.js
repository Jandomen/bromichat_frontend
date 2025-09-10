import React, { useState } from 'react';

const PhotoList = ({ photos = [], authUser, onDelete, onUpdateDescription }) => {
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  //console.log('Photos in PhotoList:', photos); 

  if (!Array.isArray(photos) || photos.length === 0) {
    return <p>No hay fotos disponibles.</p>;
  }

  const isOwner = (photo) => {
    const photoUserId =
      typeof photo.user === 'object' ? photo.user?._id?.toString() : photo.user?.toString();
    return photoUserId === authUser?._id;
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo._id} className="relative">
            <img
              src={photo.imageUrl || 'default-image.png'}
              alt={photo.description || 'Foto'}
              className="w-full rounded shadow object-cover cursor-pointer"
              onClick={() => setLightboxPhoto(photo)}
            />
            {authUser && isOwner(photo) && (
              <div className="absolute top-2 right-2">
                <button
                  className="text-gray-700 bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  onClick={() => {
                    const newDesc = prompt('Editar descripción', photo.description || '');
                    if (newDesc !== null && newDesc !== photo.description && onUpdateDescription) {
                      onUpdateDescription(photo._id, newDesc);
                    }
                  }}
                >
                  ⋮
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative bg-white p-4 rounded max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhoto.imageUrl || 'default-image.png'}
              alt={lightboxPhoto.description || 'Foto'}
              className="w-full rounded mb-2"
            />
            <p className="mb-2">{lightboxPhoto.description}</p>

            {authUser && isOwner(lightboxPhoto) && (
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => {
                    const newDesc = prompt('Editar descripción', lightboxPhoto.description || '');
                    if (newDesc !== null && newDesc !== lightboxPhoto.description && onUpdateDescription) {
                      onUpdateDescription(lightboxPhoto._id, newDesc);
                      setLightboxPhoto({ ...lightboxPhoto, description: newDesc });
                    }
                  }}
                >
                  Editar
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => {
                    if (!window.confirm('¿Seguro que quieres eliminar esta foto?')) return;
                    onDelete(lightboxPhoto._id);
                    setLightboxPhoto(null);
                  }}
                >
                  Eliminar
                </button>
              </div>
            )}

            <button
              className="absolute top-2 right-2 text-white text-2xl font-bold"
              onClick={() => setLightboxPhoto(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoList;