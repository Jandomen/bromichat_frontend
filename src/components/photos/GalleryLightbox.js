import React from 'react';

const GalleryLightbox = ({ photo, onClose, authUser, onDelete, onUpdateDescription }) => {
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative bg-white rounded shadow-lg max-w-3xl w-full p-4">
        {/* Botón de cerrar */}
        <button
          className="absolute top-2 right-2 text-gray-700 font-bold text-xl"
          onClick={onClose}
        >
          ×
        </button>

        {/* Imagen */}
        <img
          src={photo.imageUrl}
          alt={photo.description || 'Foto'}
          className="w-full h-auto rounded"
        />

        {/* Descripción */}
        <p className="mt-2 text-gray-700">{photo.description}</p>

        {/* Menú de tres puntitos */}
        {authUser && photo.user?._id === authUser._id && (
          <div className="absolute top-2 right-10">
            <button className="text-gray-700 bg-gray-200 px-2 py-1 rounded" onClick={() => {
              const newDesc = prompt('Editar descripción', photo.description);
              if (newDesc !== null && onUpdateDescription) {
                onUpdateDescription(photo._id, newDesc);
              }
            }}>
              ⋮
            </button>
            <button
              className="ml-2 text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700"
              onClick={() => onDelete(photo._id)}
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryLightbox;
