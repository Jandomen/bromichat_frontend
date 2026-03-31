import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PhotoUpload from './photos/PhotoUpload';
import PhotoList from './photos/PhotoList';
import { AuthContext } from '../context/AuthContext';
import photoService from '../services/photoService';
import { useUI } from '../context/UIContext';

import PhotoFeed from './photos/PhotoFeed';
import { LayoutGrid, Image as ImageIcon } from 'lucide-react';

import PhotoSearch from './photos/PhotoSearch';
import { Search, RefreshCcw } from 'lucide-react';

const Gallery = () => {
  const { photoId } = useParams();
  const { token, user } = useContext(AuthContext);
  const { showConfirm, showToast } = useUI();
  const [photos, setPhotos] = useState([]);
  const [discoverPhotos, setDiscoverPhotos] = useState([]);

  const [view, setView] = useState('discover');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Mundo');

  const fetchUserPhotos = React.useCallback(async () => {
    if (!token || !user?._id) return;
    try {
      const data = await photoService.getUserPhotos(user._id, token);
      setPhotos(Array.isArray(data) ? data : []);
    } catch (err) { }
  }, [token, user?._id]);

  const fetchGlobalFeed = React.useCallback(async (cat = selectedCategory) => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await photoService.getPhotoFeed(token, cat);
      setDiscoverPhotos(data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [token, selectedCategory]);

  useEffect(() => {
    fetchUserPhotos();
  }, [fetchUserPhotos]);

  useEffect(() => {
    fetchGlobalFeed();
  }, [fetchGlobalFeed]);

  const handleDelete = React.useCallback(async (photoId) => {
    showConfirm(
      'Eliminar foto',
      '¿Seguro que quieres eliminar esta foto?',
      async () => {
        try {
          await photoService.deletePhoto(photoId, token);
          showToast('Foto eliminada', 'success');
          fetchUserPhotos();
        } catch (err) {
          showToast('Error al eliminar foto', 'error');
        }
      }
    );
  }, [token, showConfirm, showToast, fetchUserPhotos]);

  const handleUpdateDescription = React.useCallback(async (photoId, description) => {
    try {
      await photoService.updatePhoto(photoId, { description }, token);
      fetchUserPhotos();
    } catch (err) { }
  }, [token, fetchUserPhotos]);

  const handleSearch = React.useCallback(async (term) => {
    if (!token) return;

    if (!term) {
      if (view === 'my') fetchUserPhotos();
      else fetchGlobalFeed();
      return;
    }

    setLoading(true);
    try {
      const results = await photoService.searchPhotos(term, token);
      if (view === 'my') {
        setPhotos(results.filter(p => p.user?._id === user?._id));
      } else {
        setDiscoverPhotos(results);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [token, view, user?._id, fetchUserPhotos, fetchGlobalFeed]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-2 py-4 xs:px-4 xs:py-6 sm:py-8 space-y-4 xs:space-y-6 sm:space-y-10 max-w-7xl animate-fade-in pb-24 lg:pb-12">

        {/* Professional Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-100 pb-10">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tighter flex items-center gap-4">
              <span className="text-indigo-600 bg-indigo-50 p-4 rounded-3xl shadow-inner text-3xl sm:text-4xl">📸</span>
              Galería Elite
            </h1>
            <p className="text-zinc-400 font-bold ml-1 uppercase tracking-[0.3em] text-[10px] sm:text-xs">Estudio de Curación Visual</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
            {/* View Switching Professional Tabs */}
            <div className="flex p-1.5 bg-zinc-100 rounded-2xl w-full sm:w-auto shadow-inner border border-zinc-200/50">
              {[
                { id: 'discover', label: 'Explorar', icon: <Search size={18} /> },
                { id: 'feed', label: 'Feed', icon: <ImageIcon size={18} /> },
                { id: 'my', label: 'Mi Galería', icon: <LayoutGrid size={18} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-500 ${view === tab.id ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50 scale-105' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/30'}`}
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
            <PhotoSearch
              onSearch={handleSearch}
              placeholder={view === 'my' ? "Busca en tus fotos..." : "Busca fotos en toda la comunidad..."}
            />

            {view === 'discover' && (
              <div className="flex gap-1.5 xs:gap-2 sm:gap-3 overflow-x-auto pb-2 xs:pb-3 sm:pb-4 px-2 xs:px-4 max-w-4xl mx-auto no-scrollbar scroll-smooth">
                {['Mundo', 'Arte', 'Naturaleza', 'Retratos', 'Viajes', 'Comida', 'Moda', 'Arquitectura'].map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      fetchGlobalFeed(cat);
                    }}
                    className={`whitespace-nowrap px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 rounded-lg xs:rounded-xl text-[8.5px] xs:text-[9.5px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="min-h-[60vh] relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {view === 'my' && (
            <div className="space-y-6 xs:space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <PhotoUpload token={token} onUpload={fetchUserPhotos} />
              <div className="pt-2 xs:pt-4 sm:pt-6">
                <h3 className="text-[10px] xs:text-[11px] sm:text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 xs:mb-6 sm:mb-8 flex items-center gap-2 xs:gap-3">
                  <div className="w-4 xs:w-6 sm:w-8 h-[1.5px] xs:h-[2px] bg-indigo-600 rounded-full"></div>
                  Tu Galería Personal
                </h3>
                <PhotoList
                  photos={photos}
                  setPhotos={setPhotos}
                  authUser={user}
                  onDelete={handleDelete}
                  onUpdateDescription={handleUpdateDescription}
                  initialPhotoId={photoId}
                  token={token}
                />
              </div>
            </div>
          )}

          {view === 'discover' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex flex-wrap items-center justify-between gap-y-2 mb-4 xs:mb-6 sm:mb-8">
                <h3 className="text-[10px] xs:text-[11px] sm:text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 xs:gap-3">
                  <div className="w-4 xs:w-6 sm:w-8 h-[1.5px] xs:h-[2px] bg-indigo-600 rounded-full"></div>
                  Descubrimientos Populares
                </h3>
                <button
                  onClick={fetchGlobalFeed}
                  className="px-2 py-1.5 xs:p-2 hover:bg-zinc-100 rounded-lg xs:rounded-xl text-zinc-400 hover:text-indigo-600 transition-all flex items-center gap-1.5 xs:gap-2 font-bold text-[8.5px] xs:text-[9.5px] sm:text-[10px] uppercase tracking-widest"
                >
                  <RefreshCcw size={12} className={`sm:w-[14px] sm:h-[14px] ${loading ? 'animate-spin' : ''}`} />
                  Actualizar Feed
                </button>
              </div>
              <PhotoList
                photos={discoverPhotos}
                setPhotos={setDiscoverPhotos}
                authUser={user}
                onDelete={handleDelete}
                onUpdateDescription={handleUpdateDescription}
                token={token}
                type="pinterest"
              />
            </div>
          )}

          {view === 'feed' && (
            <div className="animate-in fade-in zoom-in-95 duration-700 max-w-lg mx-auto">
              <PhotoFeed />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;