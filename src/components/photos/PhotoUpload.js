import React, { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaImage, FaTimes, FaCheck } from 'react-icons/fa';
import { useUI } from '../../context/UIContext';
import photoService from '../../services/photoService';

const PhotoUpload = ({ token, onUpload }) => {
  const { showToast } = useUI();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowFeed, setAllowFeed] = useState(true);
  const [category, setCategory] = useState('Mundo');

  const PHOTO_CATEGORIES = ['Mundo', 'Arte', 'Naturaleza', 'Retratos', 'Viajes', 'Comida', 'Moda', 'Arquitectura'];

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
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      showToast('Solo se permiten imágenes', 'warning');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('description', description);
    formData.append('isPrivate', isPrivate);
    formData.append('allowFeed', allowFeed);
    formData.append('category', category);

    setLoading(true);
    try {
      await photoService.uploadPhoto(formData, token);
      setFile(null);
      setDescription('');
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onUpload) onUpload();
      showToast('Foto subida con éxito.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al subir la foto. Intenta de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-4 xs:mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3 xs:p-4 sm:p-6 text-white">
        <h2 className="text-sm xs:text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
          <FaImage className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" /> Subir Nueva Foto
        </h2>
        <p className="text-blue-100 mt-0.5 xs:mt-1 font-semibold text-[8px] xs:text-[10px] sm:text-sm opacity-80">Comparte tus recuerdos con la comunidad.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-3 xs:p-5 sm:p-8 space-y-3 xs:space-y-4 sm:space-y-6">

        {/* Drag and Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300 ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : file
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />

          {!file ? (
            <div className="text-center pointer-events-none">
              <div className="bg-blue-100 text-blue-600 w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-4">
                <FaCloudUploadAlt className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8" />
              </div>
              <p className="text-gray-700 font-black text-[10px] xs:text-xs sm:text-lg uppercase tracking-tight">Arrastra y suelta tu foto aquí</p>
              <p className="text-gray-400 font-bold text-[8px] xs:text-[9.5px] sm:text-sm mt-0.5 xs:mt-1 uppercase tracking-widest">o explora tus archivos</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-green-700">
                  <span className="bg-green-100 p-2 rounded-full"><FaCheck /></span>
                  <span className="font-semibold truncate max-w-xs">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-red-500 transition z-10 relative"
                >
                  <FaTimes size={18} />
                </button>
              </div>
              <div className="aspect-square max-w-sm mx-auto bg-gray-100 rounded-lg overflow-hidden shadow-sm relative group">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Description Input */}
        <div className="flex flex-col gap-1.5 xs:gap-2 relative">
          <label htmlFor="photo-desc" className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            Descripción o Título
          </label>
          <textarea
            id="photo-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-300 resize-none min-h-[80px]"
            placeholder="Añade un texto atractivo..."
          />
        </div>

        {/* Category Selector */}
        <div className="flex flex-col gap-1.5 xs:gap-2 relative">
          <label htmlFor="photo-category" className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            Categoría (Opcional)
          </label>
          <div className="relative">
            <select
              id="photo-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none font-semibold text-gray-700"
            >
              {PHOTO_CATEGORIES.map(cat => (
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

        {/* Action Toggles */}
        <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-xs sm:text-sm font-bold text-gray-700">Ocultar de mi perfil público</span>
            <div className="relative shrink-0">
              <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="sr-only peer" />
              <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
            </div>
          </label>

          <div className="h-px bg-gray-200 w-full" />

          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-xs sm:text-sm font-bold text-gray-700">Compartir en Feed Global</span>
            <div className="relative shrink-0">
              <input type="checkbox" checked={allowFeed} onChange={(e) => setAllowFeed(e.target.checked)} className="sr-only peer" />
              <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full py-3.5 sm:py-4 mt-2 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 ${loading || !file
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30'
            }`}
        >
          {loading ? 'Subiendo Archivo...' : 'Publicar Ahora'}
        </button>

      </form>
    </div>
  );
};

export default PhotoUpload;