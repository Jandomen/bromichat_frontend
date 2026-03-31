import React, { useState, useRef } from 'react';
import { useUI } from '../../context/UIContext';
import { FaCloudUploadAlt, FaFilm, FaTimes, FaCheck } from 'react-icons/fa';

const VideoUpload = ({ onUpload }) => {
  const { showToast } = useUI();
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowFeed, setAllowFeed] = useState(true);
  const [category, setCategory] = useState('Todos');

  const VIDEO_CATEGORIES = ['Todos', 'Tendencias', 'Música', 'Gaming', 'Educación', 'Deportes', 'Tecnología', 'Cine'];

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      showToast('Solo se permiten archivos de video.', 'warning');
      return;
    }
    setVideoFile(file);
  };

  const handleRemoveFile = () => {
    setVideoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return;

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('isPrivate', isPrivate);
    formData.append('allowFeed', allowFeed);
    formData.append('category', category);

    setLoading(true);
    try {
      await onUpload(formData);
      setVideoFile(null);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
      showToast('Error al subir el video', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-4 xs:mb-8">
      <div className="bg-gradient-to-r from-red-600 to-red-800 p-3 xs:p-4 sm:p-6 text-white">
        <h2 className="text-sm xs:text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
          <FaFilm className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" /> Subir Nuevo Video
        </h2>
        <p className="text-red-100 mt-0.5 xs:mt-1 font-semibold text-[8px] xs:text-[10px] sm:text-sm opacity-80">Comparte tus mejores momentos con la comunidad.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-3 xs:p-5 sm:p-8 space-y-3 xs:space-y-4 sm:space-y-6">

        {/* Drag and Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300 ${isDragging
            ? 'border-red-500 bg-red-50'
            : videoFile
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />

          {!videoFile ? (
            <div className="text-center pointer-events-none">
              <div className="bg-red-100 text-red-600 w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-4">
                <FaCloudUploadAlt className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8" />
              </div>
              <p className="text-gray-700 font-black text-[10px] xs:text-xs sm:text-lg uppercase tracking-tight">Arrastra y suelta tu video aquí</p>
              <p className="text-gray-400 font-bold text-[8px] xs:text-[9.5px] sm:text-sm mt-0.5 xs:mt-1 uppercase tracking-widest">o explora tus archivos</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-green-700">
                  <span className="bg-green-100 p-2 rounded-full"><FaCheck /></span>
                  <span className="font-semibold truncate max-w-xs">{videoFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-red-500 transition z-10 relative"
                >
                  <FaTimes size={18} />
                </button>
              </div>
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-sm relative group">
                <video
                  src={URL.createObjectURL(videoFile)}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-medium">Vista Previa</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5 xs:gap-2 relative">
            <label htmlFor="video-title" className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest px-1">
              Título del Video
            </label>
            <input
              type="text"
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-semibold text-gray-800"
              placeholder="Un título pegadizo..."
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 xs:gap-2 relative">
            <label htmlFor="video-desc" className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest px-1">
              Descripción Corta
            </label>
            <textarea
              id="video-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all placeholder-gray-300 resize-none min-h-[60px]"
              placeholder="Añade algún detalle..."
            />
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-1.5 xs:gap-2 relative">
            <label htmlFor="video-category" className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest px-1">
              Categoría Temática
            </label>
            <div className="relative">
              <select
                id="video-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all appearance-none font-semibold text-gray-700"
              >
                {VIDEO_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs sm:text-sm font-bold text-gray-700">Video Privado (Ocultar)</span>
              <div className="relative shrink-0">
                <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="sr-only peer" />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 shadow-inner"></div>
              </div>
            </label>

            <div className="h-px bg-gray-200 w-full" />

            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs sm:text-sm font-bold text-gray-700">Aparecer en Feed Global Shorts</span>
              <div className="relative shrink-0">
                <input type="checkbox" checked={allowFeed} onChange={(e) => setAllowFeed(e.target.checked)} className="sr-only peer" />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !videoFile || !title}
          className={`w-full py-3.5 sm:py-4 mt-2 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 ${loading || !videoFile || !title
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-500/30'
            }`}
        >
          {loading ? 'Preparando Video...' : 'Publicar Video'}
        </button>

      </form>
    </div>
  );
};

export default VideoUpload;
