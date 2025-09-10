import React, { useState, useEffect, useContext } from 'react';
import Header from './Header';
import Footer from './Footer';
import VideoUpload from './videos/VideoUpload';
import VideoList from './videos/VideoList';
import VideoSearch from './videos/VideoSearch';
import { AuthContext } from '../context/AuthContext';
import { searchVideosByTitle, uploadVideo as uploadVideoService } from '../services/videoService';
import axios from 'axios';

const Videos = () => {
  const { token, user } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchVideos = async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/videos/user/videos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(res.data);
    } catch (err) {
     // console.error('[Videos.js] Error al cargar videos del usuario:', err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [token]);

  const handleUpload = async (formData) => {
    try {
      await uploadVideoService(formData, token);
      fetchVideos(); 
    } catch (err) {
     // console.error('[Videos.js] Error al subir video:', err);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);

    if (!term) {
      fetchVideos();
      return;
    }

    try {
      const res = await searchVideosByTitle(term, token);
     
      const userVideos = res.data.filter(v => v.user?._id === user?._id);
      setVideos(userVideos);
    } catch (err) {
     // console.error('[Videos.js] Error al buscar videos:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl text-gray-600 mb-4">Mis Videos</h1>

        <VideoUpload onUpload={handleUpload} />

        <VideoSearch onSearch={handleSearch} />

        <VideoList videos={videos} setVideos={setVideos} token={token} />
      </main>
      <Footer />
    </div>
  );
};

export default Videos;
