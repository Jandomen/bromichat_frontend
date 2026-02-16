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
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8">
      <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <FaFilm /> Subir Nuevo Video
        </h2>
        <p className="text-red-100 mt-1 opacity-80">Comparte tus mejores momentos con la comunidad.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">

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
              <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCloudUploadAlt size={32} />
              </div>
              <p className="text-gray-700 font-medium text-lg">Arrastra y suelta tu video aquí</p>
              <p className="text-gray-400 text-sm mt-1">o haz clic para explorar tus archivos</p>
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
          <div className="relative">
            <input
              type="text"
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="peer w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-transparent placeholder-transparent"
              placeholder="Título del video"
              required
            />
            <label
              htmlFor="video-title"
              className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-red-500"
            >
              Título del Video
            </label>
          </div>

          <div className="relative">
            <textarea
              id="video-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="peer w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-transparent placeholder-transparent resize-none"
              placeholder="Descripción"
            />
            <label
              htmlFor="video-desc"
              className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-red-500"
            >
              Descripción (Opcional)
            </label>
          </div>

          {/* Category Selector */}
          <div className="relative">
            <select
              id="video-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="peer w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-transparent appearance-none"
            >
              {VIDEO_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <label
              htmlFor="video-category"
              className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-500 transition-all"
            >
              Categoría (Opcional)
            </label>
            <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700">Video Privado</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={allowFeed}
                  onChange={(e) => setAllowFeed(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700">Compartir en Feed (Shorts)</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !videoFile || !title}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 ${loading || !videoFile || !title
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-red-500/30'
            }`}
        >
          {loading ? 'Subiendo video...' : 'Publicar Video'}
        </button>

      </form>
    </div>
  );
};

export default VideoUpload;
