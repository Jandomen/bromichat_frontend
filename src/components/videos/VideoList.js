import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Menu } from '@headlessui/react';

const getFullVideoUrl = (path) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${process.env.REACT_APP_API_BACKEND}${path}`;
};

const VideoList = ({ videos, setVideos, token }) => {
  const { user } = useContext(AuthContext);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [lightboxVideo, setLightboxVideo] = useState(null);
  const videoRefs = useRef({});

  // Pausar todos los videos si hay un video activo o se abre lightbox
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, videoEl]) => {
      if (!videoEl) return;
      if (lightboxVideo || id !== activeVideoId) {
        videoEl.pause();
      }
    });
  }, [activeVideoId, lightboxVideo]);

  const handleDelete = async (videoPublicId) => {
    if (!window.confirm('¿Seguro que quieres eliminar este video?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_BACKEND}/videos/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { publicId: videoPublicId },
      });
      setVideos((prev) => prev.filter((v) => v.publicId !== videoPublicId));
    } catch (err) {
      console.error('Error al eliminar video:', err);
    }
  };

  const handleVideoClick = (e, video) => {
    e.stopPropagation();
    setLightboxVideo(video);
    setActiveVideoId(null);
  };

  const handleCloseLightbox = (e) => {
    e.stopPropagation();
    setLightboxVideo(null);
    setActiveVideoId(null);
  };

  if (!videos || videos.length === 0) {
    return <p className="text-center text-gray-500 mt-6">No hay videos disponibles.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video._id} className="relative">
            <video
              ref={(el) => { if (el) videoRefs.current[video._id] = el; }}
              src={getFullVideoUrl(video.videoUrl)}
              controls
              className="w-full rounded shadow cursor-pointer"
              onClick={(e) => handleVideoClick(e, video)}
              onPlay={() => setActiveVideoId(video._id)}
            />

            {video.user?._id === user?._id && (
              <div className="absolute top-2 right-2">
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button className="px-2 py-1 bg-gray-700 text-white rounded-full hover:bg-gray-800">
                    ⋮
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-3 py-2 text-sm`}
                          onClick={() => handleDelete(video.publicId)}
                        >
                          Eliminar
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              </div>
            )}

            <div className="mt-1">
              <h3 className="font-bold">{video.title}</h3>
              <p className="text-sm text-gray-500">{video.description}</p>
            </div>
          </div>
        ))}
      </div>

      {lightboxVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={handleCloseLightbox}
        >
          <video
            src={getFullVideoUrl(lightboxVideo.videoUrl)}
            controls
            autoPlay
            className="max-w-3xl max-h-full rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default VideoList;
