import React, { useState } from 'react';
import api from '../../services/api';

const UserVideos = ({ videos = [], authUser, onDelete, scrollToTop }) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const getFullVideoUrl = (videoUrl) => {
    if (!videoUrl) return '';
    if (videoUrl.startsWith('http')) return videoUrl;
    return `${process.env.REACT_APP_API_BACKEND}${videoUrl}`;
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('¿Seguro que quieres eliminar este video?')) return;
    try {
      await api.delete('/videos/delete', {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
        data: { publicId: videoId },
      });
      if (onDelete) {
        onDelete();
      }
    } catch (err) {
     // console.error('[UserVideos.js] Error al eliminar video:', err);
      alert('Error al eliminar el video. Intenta de nuevo.');
    }
  };

  if (!Array.isArray(videos)) {
   // console.warn('UserVideos: videos prop is not an array:', videos);
    return <p>No hay videos.</p>;
  }

  const validVideos = videos.filter(
    (video) => video && typeof video === 'object' && video.videoUrl
  );

  if (!validVideos.length) {
    return <p>No hay videos disponibles.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {validVideos.map((video) => (
          <div key={video._id} className="relative">
            <video
              src={getFullVideoUrl(video.videoUrl)}
              poster={video.thumbnailUrl || '/default-image.png'}
              className="w-full rounded cursor-pointer"
              style={{ maxWidth: '320px', height: 'auto' }}
              onClick={() => setSelectedMedia({ ...video, type: 'video' })}
            />
            {authUser && video.user && video.user._id === authUser._id && (
              <div className="absolute top-2 right-2">
                <button
                  className="text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70"
                  onClick={() => setOpenMenuId(openMenuId === video._id ? null : video._id)}
                >
                  ⋮
                </button>
                {openMenuId === video._id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded z-10">
                    <button
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      onClick={() => handleDeleteVideo(video.publicId)}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="mt-1">
              <h3 className="font-bold text-sm truncate">{video.title}</h3>
              <p className="text-xs text-gray-500 truncate">{video.description}</p>
            </div>
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
            <video
              src={getFullVideoUrl(selectedMedia.videoUrl)}
              controls
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

export default UserVideos;