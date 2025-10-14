import React, { useState } from "react";
import { deleteVideo } from "../../services/videoService";

const getFullVideoUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${process.env.REACT_APP_API_BACKEND}${path}`;
};

const VideoItem = ({ video, authUser, fetchVideos }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que quieres eliminar este video?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteVideo(video.publicId);
      fetchVideos();
    } catch (err) {
      setError("No se pudo eliminar el video.");
     // console.error("Error al eliminar video", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white rounded shadow p-2">
      <video
        src={getFullVideoUrl(video.videoUrl)}
        controls
        className="w-full rounded"
        onError={(e) => (e.target.src = "")}
      />
      <h3 className="mt-2 font-bold">{video.title || "Sin título"}</h3>
      <p className="text-sm text-gray-600">{video.description || "Sin descripción"}</p>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {video.user?._id === authUser?._id && (
        <button
          onClick={handleDelete}
          disabled={loading}
          className={`absolute top-2 right-2 px-2 py-1 rounded text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Eliminando..." : "Eliminar"}
        </button>
      )}
    </div>
  );
};

export default VideoItem;
