import React, { useEffect, useState } from "react";
import { getVideoById } from "../../services/videoService";

const VideoDetail = ({ videoId }) => {
  const [video, setVideo] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const data = await getVideoById(videoId);
        setVideo(data);
      } catch (err) {
       // console.error("Error al obtener video", err);
      }
    };
    fetchVideo();
  }, [videoId]);

  if (!video) return <p>Cargando video...</p>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <video src={video.videoUrl} controls className="w-full rounded" />
      <h2 className="text-xl font-bold mt-2">{video.title}</h2>
      <p className="text-gray-600">{video.description}</p>
      <p className="text-sm mt-2">Subido por: {video.user?.username}</p>
    </div>
  );
};

export default VideoDetail;
