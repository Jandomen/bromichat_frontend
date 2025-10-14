import React, { useEffect, useState } from "react";
import { getVideoById } from "../../services/videoService";

const getFullVideoUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${process.env.REACT_APP_API_BACKEND}${path}`;
};

const VideoDetail = ({ videoId }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getVideoById(videoId);
        setVideo(data);
      } catch (err) {
        setError("No se pudo cargar el video.");
       // console.error("Error al obtener video", err);
      } finally {
        setLoading(false);
      }
    };

    if (videoId) fetchVideo();
  }, [videoId]);

  if (loading) return <p className="text-gray-500">Cargando video...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!video) return <p className="text-gray-500">Video no encontrado.</p>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <video
        src={getFullVideoUrl(video.videoUrl)}
        controls
        className="w-full rounded"
        onError={(e) => (e.target.src = "")}
      />
      <h2 className="text-xl font-bold mt-2">{video.title || "Sin título"}</h2>
      <p className="text-gray-600">{video.description || "Sin descripción"}</p>
      <p className="text-sm mt-2">
        Subido por: {video.user?.username || "Desconocido"}
      </p>
    </div>
  );
};

export default VideoDetail;

