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
      <main className="flex-grow container mx-auto px-2 py-4 xs:px-4 xs:py-6 sm:py-8 space-y-4 xs:space-y-6 sm:space-y-10 max-w-7xl animate-fade-in pb-24 lg:pb-12">

        {/* Corporate Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-100 pb-10">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tighter flex items-center gap-4">
              <span className="text-red-600 bg-red-50 p-4 rounded-3xl shadow-inner text-3xl sm:text-4xl">🎬</span>
              Multimedia Pro
            </h1>
            <p className="text-zinc-400 font-bold ml-1 uppercase tracking-[0.3em] text-[10px] sm:text-xs">Centro de Transmisión Corporativa</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
            {/* Professional Tabs */}
            <div className="flex p-1.5 bg-zinc-100 rounded-2xl w-full sm:w-auto shadow-inner border border-zinc-200/50">
              {[
                { id: 'discover', label: 'Explorar', icon: <PlayCircle size={18} /> },
                { id: 'feed', label: 'Shorts', icon: <PlayCircle size={18} /> },
                { id: 'my', label: 'Mis Videos', icon: <LayoutGrid size={18} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-500 ${view === tab.id ? 'bg-white text-red-600 shadow-xl shadow-red-100/50 scale-105' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/30'}`}
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
          <div className="animate-slide-up space-y-3 xs:space-y-4 sm:space-y-6">
            <VideoSearch
              onSearch={handleSearch}
              placeholder={view === 'my' ? "Busca en tus videos..." : "Busca videos en toda la plataforma estilo YouTube..."}
            />

            {view === 'discover' && (
              <div className="flex gap-1.5 xs:gap-2 sm:gap-3 overflow-x-auto pb-2 xs:pb-3 sm:pb-4 px-2 xs:px-4 max-w-4xl mx-auto no-scrollbar scroll-smooth">
                {['Todos', 'Tendencias', 'Música', 'Gaming', 'Educación', 'Deportes', 'Tecnología', 'Cine'].map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      fetchGlobalFeed(cat);
                    }}
                    className={`whitespace-nowrap px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 rounded-lg xs:rounded-xl text-[8.5px] xs:text-[9.5px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
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
            <div className="space-y-6 xs:space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <VideoUpload onUpload={handleUpload} />
              <div className="pt-2 xs:pt-4 sm:pt-6">
                <h3 className="text-[10px] xs:text-[11px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 xs:mb-6 sm:mb-8 flex items-center gap-2 xs:gap-3">
                  <div className="w-4 xs:w-6 sm:w-8 h-[1.5px] xs:h-[2px] bg-red-600 rounded-full"></div>
                  Tu Galería Personal
                </h3>
                <VideoList videos={videos} setVideos={setVideos} token={token} />
              </div>
            </div>
          )}

          {view === 'discover' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex flex-wrap items-center justify-between gap-y-2 mb-4 xs:mb-6 sm:mb-8">
                <h3 className="text-[10px] xs:text-[11px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 xs:gap-3">
                  <div className="w-4 xs:w-6 sm:w-8 h-[1.5px] xs:h-[2px] bg-red-600 rounded-full"></div>
                  Recomendados para ti
                </h3>
                <button
                  onClick={fetchGlobalFeed}
                  className="px-2 py-1.5 xs:p-2 hover:bg-gray-100 rounded-lg xs:rounded-xl text-gray-400 hover:text-red-600 transition-all flex items-center gap-1.5 xs:gap-2 font-bold text-[8.5px] xs:text-[9.5px] sm:text-[10px] uppercase tracking-widest"
                >
                  <PlayCircle size={12} className={`sm:w-[14px] sm:h-[14px] ${loading ? 'animate-spin' : ''}`} />
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
