import React from "react";
import { deleteVideo } from "../../services/videoService";

const VideoItem = ({ video, authUser, fetchVideos }) => {
  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que quieres eliminar este video?")) return;
    try {
      await deleteVideo(video.publicId);
      fetchVideos();
    } catch (err) {
     // console.error("Error al eliminar video", err);
    }
  };

  return (
    <div className="relative bg-white rounded shadow p-2">
      <video src={video.videoUrl} controls className="w-full rounded" />
      <h3 className="mt-2 font-bold">{video.title}</h3>
      <p className="text-sm text-gray-600">{video.description}</p>
      {video.user?._id === authUser?._id && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
        >
          Eliminar
        </button>
      )}
    </div>
  );
};

export default VideoItem;
