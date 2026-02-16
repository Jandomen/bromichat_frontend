import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';
import { useUI } from '../../context/UIContext';

const UserVideos = ({ videos = [], authUser, onDelete, scrollToTop }) => {
  const { showToast, showConfirm } = useUI();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);

  const validVideos = useMemo(() => {
    if (!Array.isArray(videos)) return [];
    return videos.filter(
      (video) => video && typeof video === 'object' && video.videoUrl
    );
  }, [videos]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedMediaIndex === null) return;
      if (e.key === 'Escape') setSelectedMediaIndex(null);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMediaIndex((prev) => (prev + 1) % validVideos.length);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMediaIndex((prev) => (prev - 1 + validVideos.length) % validVideos.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMediaIndex, validVideos]);

  const getFullVideoUrl = (videoUrl) => {
    if (!videoUrl) return '';
    if (videoUrl.startsWith('http')) return videoUrl;
    return `${process.env.REACT_APP_API_BACKEND}${videoUrl}`;
  };

  const handleDeleteVideo = (videoId) => {
    showConfirm(
      'Eliminar Video',
      '¿Estás seguro de que quieres eliminar este video permanentemente?',
      async () => {
        try {
          await api.delete('/videos/delete', {
            headers: {
              Authorization: `Bearer ${authUser.token}`,
            },
            data: { publicId: videoId },
          });
          showToast('Video eliminado con éxito', 'success');
          if (onDelete) {
            onDelete();
          }
        } catch (err) {
          console.error('[UserVideos.js] Error al eliminar video:', err);
          showToast('No se pudo eliminar el video', 'error');
        }
      }
    );
  };

  if (!Array.isArray(videos)) {
    return <p>No hay videos.</p>;
  }

  if (!validVideos.length) {
    return <p>No hay videos disponibles.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {validVideos.map((video) => (
          <div key={video._id} className="group flex flex-col bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">

            {/* Thumbnail Area */}
            <div
              className="relative aspect-video bg-black cursor-pointer overflow-hidden"
              onClick={() => setSelectedMediaIndex(validVideos.findIndex(v => v._id === video._id))}
            >
              <video
                src={getFullVideoUrl(video.videoUrl)}
                poster={video.thumbnailUrl || ''}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                preload="metadata"
              />

              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ring-1 ring-white/50">
                  <svg className="w-6 h-6 text-white fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>

            </div>

            {/* Info Area */}
            <div className="p-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate" title={video.title || 'Video sin título'}>{video.title || 'Video sin título'}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{video.description || 'Sin descripción'}</p>
                </div>

                {/* Action Menu */}
                {authUser && video.user && video.user._id === authUser._id && (
                  <div className="relative shrink-0">
                    <button
                      className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === video._id ? null : video._id);
                      }}
                    >
                      <span className="text-lg font-bold leading-none transform rotate-90 inline-block">⋯</span>
                    </button>
                    {openMenuId === video._id && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white shadow-xl rounded-lg border border-gray-100 z-10 py-1 animated-fade-in">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                          onClick={() => handleDeleteVideo(video.publicId)}
                        >
                          <span>🗑️</span> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {validVideos.length > 6 && (
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
            <video
              key={validVideos[selectedMediaIndex]._id}
              src={getFullVideoUrl(validVideos[selectedMediaIndex].videoUrl)}
              controls
              autoPlay
              className="max-w-full max-h-screen shadow-2xl bg-black"
            />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white px-8 py-5 rounded-3xl border border-white/10 max-w-[80%] text-center shadow-2xl">
              {validVideos[selectedMediaIndex].title && (
                <h3 className="text-lg font-black uppercase tracking-tight mb-1">{validVideos[selectedMediaIndex].title}</h3>
              )}
              {validVideos[selectedMediaIndex].description && (
                <p className="text-zinc-300 text-sm font-medium">{validVideos[selectedMediaIndex].description}</p>
              )}
            </div>

            {/* Nav Arrows (Desktop) */}
            <button
              className="hidden md:block absolute left-4 p-4 text-white/20 hover:text-white transition-colors"
              onClick={() => setSelectedMediaIndex((prev) => (prev - 1 + validVideos.length) % validVideos.length)}
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              className="hidden md:block absolute right-4 p-4 text-white/20 hover:text-white transition-colors"
              onClick={() => setSelectedMediaIndex((prev) => (prev + 1) % validVideos.length)}
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserVideos;