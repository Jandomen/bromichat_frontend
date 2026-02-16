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
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <FaImage /> Subir Nueva Foto
        </h2>
        <p className="text-blue-100 mt-1 opacity-80">Comparte tus recuerdos con la comunidad.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">

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
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCloudUploadAlt size={32} />
              </div>
              <p className="text-gray-700 font-medium text-lg">Arrastra y suelta tu foto aquí</p>
              <p className="text-gray-400 text-sm mt-1">o haz clic para explorar tus archivos</p>
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
        <div className="relative">
          <input
            type="text"
            id="photo-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="peer w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-transparent placeholder-transparent"
            placeholder="Descripción (opcional)"
          />
          <label
            htmlFor="photo-desc"
            className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-500"
          >
            Descripción (Opcional)
          </label>
        </div>

        {/* Category Selector */}
        <div className="relative">
          <select
            id="photo-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="peer w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-transparent appearance-none"
          >
            {PHOTO_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <label
            htmlFor="photo-category"
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
              <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </div>
            <span className="text-sm font-semibold text-gray-700">Foto Privada</span>
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
            <span className="text-sm font-semibold text-gray-700">Compartir en Feed</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 ${loading || !file
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30'
            }`}
        >
          {loading ? 'Subiendo foto...' : 'Publicar Foto'}
        </button>

      </form>
    </div>
  );
};

export default PhotoUpload;