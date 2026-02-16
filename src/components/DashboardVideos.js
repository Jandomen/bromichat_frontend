// DashboardVideos.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import VideoList from './videos/VideoList';
import axios from 'axios';

const DashboardVideos = () => {
  const { token } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/videos/feed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(res.data);
    } catch (err) {
      console.error('[DashboardVideos] Error al cargar feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchFeed();
  }, [token]);

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 p-8 hover:shadow-2xl hover:shadow-primary-100/20 transition-all duration-500 overflow-hidden relative group">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-100/50 transition-colors"></div>

      <div className="flex items-center justify-between mb-8 relative">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-primary-50 rounded-xl group-hover:rotate-12 transition-transform duration-500">
            <span className="text-2xl">📺</span>
          </div>
          Videos Relevantes
        </h2>
        <button
          onClick={fetchFeed}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-primary-600 transition-all disabled:opacity-50"
          title="Actualizar Feed"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      <div className="animate-fade-in relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}
        <VideoList videos={videos} setVideos={setVideos} token={token} />
      </div>
    </div>
  );
};

export default DashboardVideos;
