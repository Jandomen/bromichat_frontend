import React from 'react';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';
import { useUI } from '../../context/UIContext';

const GalleryLightbox = ({ photo, onClose, authUser, onDelete, onUpdateDescription }) => {
  const { showConfirm, showToast } = useUI();
  if (!photo) return null;

  const isOwner = authUser?._id === photo.user?._id;

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
          src={getFullImageUrl(photo.imageUrl) || defaultProfile}
          alt={photo.description || 'Foto'}
          className="w-full h-auto rounded"
          onError={(e) => { e.target.src = defaultProfile; }}
        />

        {/* Descripción */}
        <p className="mt-2 text-gray-700">{photo.description}</p>

        {/* Menú de edición/eliminación */}
        {isOwner && (
          <div className="absolute top-2 right-10 flex items-center">
            <button
              className="text-gray-700 bg-gray-200 px-2 py-1 rounded"
              onClick={() => {
                const newDesc = prompt('Editar descripción', photo.description || '');
                if (newDesc !== null && newDesc !== photo.description && onUpdateDescription) {
                  onUpdateDescription(photo._id, newDesc);
                }
              }}
            >
              ⋮
            </button>
            <button
              className="ml-2 text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700"
              onClick={() => {
                showConfirm(
                  'Eliminar foto',
                  '¿Seguro que quieres eliminar esta foto?',
                  async () => {
                    try {
                      await onDelete(photo._id);
                      showToast('Foto eliminada', 'success');
                      onClose();
                    } catch (error) {
                      showToast('Error al eliminar foto', 'error');
                    }
                  }
                );
              }}
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
