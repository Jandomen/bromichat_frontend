// DashboardVideos.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import VideoSearch from './videos/VideoSearch';
import VideoList from './videos/VideoList';
import axios from 'axios';

const DashboardVideos = () => {
  const { token } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);

  const handleSearch = async (term) => {
    if (!term) {
      setVideos([]); // limpia la lista si no hay término
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/videos/search`, {
        params: { title: term },
        headers: { Authorization: `Bearer ${token}` },
      });

      setVideos(res.data); // muestra todos los videos que coincidan
    } catch (err) {
     // console.error('[DashboardVideos] Error al buscar videos:', err);
    }
  };

  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-2">Buscar Videos</h2>
      <VideoSearch onSearch={handleSearch} />
      <VideoList videos={videos} setVideos={setVideos} token={token} />
    </div>
  );
};

export default DashboardVideos;
