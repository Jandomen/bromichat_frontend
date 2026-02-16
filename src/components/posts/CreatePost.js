import React, { useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FaPaperclip, FaTimes } from 'react-icons/fa';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';

const CreatePost = ({ onPostCreated, groupId }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const { token, user } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const { addToQueue } = useOfflineQueue();
  const isOnline = window.navigator.onLine;

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
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'ogg', 'pdf'];

    const validFiles = files.filter((file) => {
      const fileExt = file.name.split('.').pop().toLowerCase();


      const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExt);
      if (!isValidType) {
        setError(`Archivo "${file.name}" no permitido. Solo imágenes, videos o PDFs.`);
        return false;
      }

      const maxSize = file.type.startsWith('video') || ['mp4', 'webm', 'ogg'].includes(fileExt)
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

    if (!isOnline) {
      // Guardar en cola offline (Nota: Los archivos físicos no se guardan en localStorage 
      // fácilmente, en una versión Pro usaríamos IndexedDB. Por ahora guardamos el texto)
      addToQueue({
        type: 'CREATE_POST',
        content,
        groupId,
        hasMedia: mediaFiles.length > 0
      });
      setContent('');
      setMediaFiles([]);
      setError(null);
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    mediaFiles.forEach((file) => {
      formData.append('media', file);
    });

    const url = groupId
      ? `${process.env.REACT_APP_API_BACKEND}/communities/${groupId}/posts`
      : `${process.env.REACT_APP_API_BACKEND}/posts`;

    try {
      const res = await axios.post(
        url,
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
    <div className="mb-10 max-w-2xl mx-auto group">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 transition-all duration-300 focus-within:shadow-2xl focus-within:shadow-primary-100/30 relative overflow-hidden"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden ring-2 ring-gray-50 p-0.5">
              <img
                src={getFullImageUrl(user?.profilePicture)}
                alt="Yo"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
          </div>

          <div className="flex-1">
            <textarea
              placeholder="¿Qué tienes en mente hoy?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="2"
              className="w-full p-2 text-slate-900 placeholder-gray-400 bg-transparent border-none focus:ring-0 resize-none text-lg sm:text-xl font-bold leading-tight tracking-tight selection:bg-primary-100 placeholder:font-medium"
            />
          </div>
        </div>


        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 px-1">
            {mediaFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="relative w-full h-24 bg-gray-50 rounded-2xl overflow-hidden group/item border border-gray-100 shadow-sm transition-transform hover:scale-105"
              >
                {file.type.startsWith('image') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="vista previa"
                    className="w-full h-full object-cover"
                  />
                ) : file.type.startsWith('video') ? (
                  <video
                    src={URL.createObjectURL(file)}
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[10px] text-gray-500 font-bold">
                    <span className="text-xl mb-1">📄</span>
                    <span className="truncate max-w-[80%] uppercase tracking-tighter">{file.name}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="absolute top-1.5 right-1.5 bg-black/40 hover:bg-primary-600 text-white rounded-full p-1.5 opacity-0 group-hover/item:opacity-100 transition-all duration-300"
                >
                  <FaTimes size={10} />
                </button>
              </div>
            ))}
          </div>
        )}


        {dragActive && (
          <div className="absolute inset-2 rounded-2xl border-2 border-dashed border-primary-400 bg-primary-50/90 text-primary-600 flex flex-col items-center justify-center font-black uppercase tracking-widest text-xs z-20 backdrop-blur-sm animate-pulse-slow">
            <span className="text-3xl mb-2">✨</span>
            Suelta los archivos aquí
          </div>
        )}

        {error && (
          <div className="text-primary-600 text-xs font-bold uppercase tracking-widest px-4 mt-4 animate-bounce">
            ⚠️ {error}
          </div>
        )}

        <div className="border-t border-gray-50 mt-5 pt-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${mediaFiles.length > 0
                ? 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}
            >
              <FaPaperclip />
              <span>{mediaFiles.length > 0 ? 'Añadir más' : 'Adjuntar Medios'}</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!content.trim() && mediaFiles.length === 0}
            className={`px-8 py-2.5 text-xs font-black uppercase tracking-[0.1em] rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl active:scale-95 flex items-center gap-2 ${isOnline
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/30'
                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30'
              }`}
          >
            {!isOnline && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>}
            {isOnline ? 'Publicar Historia' : 'Guardar en Brumi-Mesh'}
          </button>
        </div>

      </form>
    </div>
  );
};


export default CreatePost;
