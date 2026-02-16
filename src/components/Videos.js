import React, { useState, useEffect, useContext, useCallback } from 'react';
import Header from './Header';
import Footer from './Footer';
import VideoUpload from './videos/VideoUpload';
import VideoList from './videos/VideoList';
import VideoSearch from './videos/VideoSearch';
import { AuthContext } from '../context/AuthContext';
import { searchVideosByTitle, uploadVideo as uploadVideoService } from '../services/videoService';
import axios from 'axios';

import VideoFeed from './videos/VideoFeed';
import { LayoutGrid, PlayCircle } from 'lucide-react';

const Videos = () => {
  const { token, user } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);
  const [discoverVideos, setDiscoverVideos] = useState([]);
  const [view, setView] = useState('discover'); // 'feed' (Shorts), 'my' (Gallery), 'discover' (Grid)
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const fetchUserVideos = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/videos/user/videos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(res.data);
    } catch (err) { }
  }, [token]);

  const fetchGlobalFeed = useCallback(async (cat = selectedCategory) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/videos/feed?category=${cat}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscoverVideos(res.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [token, selectedCategory]);

  useEffect(() => {
    fetchUserVideos();
    fetchGlobalFeed();
  }, [fetchUserVideos, fetchGlobalFeed]);

  const handleUpload = async (formData) => {
    try {
      await uploadVideoService(formData, token);
      fetchUserVideos();
    } catch (err) { }
  };

  const handleSearch = async (term) => {
    if (!token) return;

    if (!term) {
      if (view === 'my') fetchUserVideos();
      else fetchGlobalFeed();
      return;
    }

    setLoading(true);
    try {
      const res = await searchVideosByTitle(term, token);
      if (view === 'my') {
        setVideos(res.data.filter(v => v.user?._id === user?._id));
      } else {
        setDiscoverVideos(res.data);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-10 max-w-7xl animate-fade-in">

        {/* YT Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-gray-100 pb-10">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
              <span className="text-red-600 bg-red-50 p-4 rounded-3xl shadow-inner animate-pulse-slow">📺</span>
              Video Central
            </h1>
            <p className="text-gray-500 font-bold ml-1 uppercase tracking-widest text-xs opacity-60">Explora lo mejor de la comunidad</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
            {/* Navigation Tabs */}
            <div className="flex p-1.5 bg-gray-100 rounded-[1.5rem] w-full sm:w-auto shadow-inner border border-gray-200/50">
              {[
                { id: 'discover', label: 'Explorar', icon: <PlayCircle size={18} /> },
                { id: 'feed', label: 'Shorts', icon: <PlayCircle size={18} /> },
                { id: 'my', label: 'Mis Videos', icon: <LayoutGrid size={18} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 ${view === tab.id ? 'bg-white text-red-600 shadow-xl shadow-red-100 scale-105 active:scale-95' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        {(view === 'discover' || view === 'my') && (
          <div className="animate-slide-up space-y-6">
            <VideoSearch
              onSearch={handleSearch}
              placeholder={view === 'my' ? "Busca en tus videos..." : "Busca videos en toda la plataforma estilo YouTube..."}
            />

            {view === 'discover' && (
              <div className="flex gap-3 overflow-x-auto pb-4 px-4 max-w-4xl mx-auto no-scrollbar scroll-smooth">
                {['Todos', 'Tendencias', 'Música', 'Gaming', 'Educación', 'Deportes', 'Tecnología', 'Cine'].map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      fetchGlobalFeed(cat);
                    }}
                    className={`whitespace-nowrap px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Content Areas */}
        <div className="min-h-[60vh] relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          )}

          {view === 'my' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <VideoUpload onUpload={handleUpload} />
              <div className="pt-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                  <div className="w-8 h-[2px] bg-red-600 rounded-full"></div>
                  Tu Galería Personal
                </h3>
                <VideoList videos={videos} setVideos={setVideos} token={token} />
              </div>
            </div>
          )}

          {view === 'discover' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                  <div className="w-8 h-[2px] bg-red-600 rounded-full"></div>
                  Recomendados para ti
                </h3>
                <button
                  onClick={fetchGlobalFeed}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-red-600 transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"
                >
                  <PlayCircle size={14} className={loading ? 'animate-spin' : ''} />
                  Actualizar Feed
                </button>
              </div>
              <VideoList videos={discoverVideos} setVideos={setDiscoverVideos} token={token} type="youtube" />
            </div>
          )}

          {view === 'feed' && (
            <div className="animate-in fade-in zoom-in-95 duration-700 max-w-lg mx-auto">
              <VideoFeed />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Videos;
