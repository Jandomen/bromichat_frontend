import React, { useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FaPaperclip, FaTimes } from 'react-icons/fa';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const { token } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const maxFiles = 10;
  const maxImagePdfSize = 10 * 1024 * 1024; 
  const maxVideoSize = 50 * 1024 * 1024;   

  const handleFileChange = (e) => {
    const files = [...e.target.files];
    processFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = [...e.dataTransfer.files];
    processFiles(files);
  };

  const processFiles = (files) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf'
    ];
    const allowedExtensions = ['jpg','jpeg','png','gif','webp','mp4','webm','ogg','pdf'];

    const validFiles = files.filter((file) => {
      const fileExt = file.name.split('.').pop().toLowerCase();

    //  console.log('Procesando archivo:', file.name, 'Tipo:', file.type, 'Ext:', fileExt, 'Tamaño:', file.size);

      const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExt);
      if (!isValidType) {
        setError(`Archivo "${file.name}" no permitido. Solo imágenes, videos o PDFs.`);
        return false;
      }

      const maxSize = file.type.startsWith('video') || ['mp4','webm','ogg'].includes(fileExt)
        ? maxVideoSize
        : maxImagePdfSize;

      if (file.size > maxSize) {
        setError(`Archivo "${file.name}" excede el tamaño máximo permitido (${maxSize / (1024 * 1024)}MB).`);
        return false;
      }

      return true;
    });

    if (mediaFiles.length + validFiles.length > maxFiles) {
      setError(`No puedes subir más de ${maxFiles} archivos.`);
      return;
    }

    setMediaFiles((prev) => [...prev, ...validFiles]);
    setError(null);
  };

  const handleRemoveFile = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    setError(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && mediaFiles.length === 0) {
      setError('Debes escribir algo o subir al menos una imagen.');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    mediaFiles.forEach((file) => {
      formData.append('media', file);
    });

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BACKEND}/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setContent('');
      setMediaFiles([]);
      setError(null);
      if (onPostCreated) onPostCreated(res.data);
    } catch (error) {
      setError(`Error creando la publicación: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 space-y-4 bg-white p-6 rounded-lg shadow-md"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <textarea
        placeholder="¿Qué tienes en mente :) ...?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="4"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div
        className={`relative border-2 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-4 text-center transition-colors duration-200`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*,video/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <label
          htmlFor="file-upload"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors duration-200 mx-auto"
        >
          <FaPaperclip className="text-blue-700" />
          <span className="font-medium">
            {mediaFiles.length > 0
              ? `${mediaFiles.length} archivo${mediaFiles.length > 1 ? 's' : ''} seleccionado${mediaFiles.length > 1 ? 's' : ''}`
              : 'Adjuntar archivos'}
          </span>
        </label>
        {dragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-100 bg-opacity-75 text-blue-700 font-semibold">
            Suelta los archivos aquí
          </div>
        )}
      </div>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {mediaFiles.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden group"
            >
              {file.type.startsWith('image') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : file.type.startsWith('video') ? (
                <video
                  src={URL.createObjectURL(file)}
                  className="w-full h-full object-cover"
                  muted
                  controls
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600">
                  <span className="text-xs text-center break-words p-2">PDF: {file.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemoveFile(idx)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label={`Eliminar ${file.name}`}
              >
                <FaTimes size={12} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        Publicar
      </button>
    </form>
  );
};

export default CreatePost;
