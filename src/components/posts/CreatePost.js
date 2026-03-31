import React, { useState, useContext, useRef } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FaPaperclip, FaTimes } from 'react-icons/fa';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import { useNetwork } from '../../hooks/useNetwork';

const CreatePost = ({ onPostCreated, groupId }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const { addToQueue } = useOfflineQueue();
  const { isOnline } = useNetwork();

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

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.7); // 0.7 quality
        };
      };
    });
  };

  const processFiles = async (files) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf'
    ];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'ogg', 'pdf'];

    const validFiles = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop().toLowerCase();
      const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExt);

      if (!isValidType) {
        setError(`Archivo "${file.name}" no permitido.`);
        continue;
      }

      const maxSize = file.type.startsWith('video') || ['mp4', 'webm', 'ogg'].includes(fileExt)
        ? maxVideoSize
        : maxImagePdfSize;

      if (file.size > maxSize) {
        setError(`"${file.name}" es demasiado grande.`);
        continue;
      }

      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file);
        validFiles.push(compressed);
      } else {
        validFiles.push(file);
      }
    }

    if (mediaFiles.length + validFiles.length > maxFiles) {
      setError(`Máximo ${maxFiles} archivos.`);
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
      ? `/communities/${groupId}/posts`
      : `/posts`;

    try {
      const res = await api.post(
        url,
        formData,
        {
          headers: {
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
    <div className="mb-6 max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 relative overflow-hidden"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <img
              src={getFullImageUrl(user?.profilePicture)}
              alt="Yo"
              className="w-10 h-10 rounded-full object-cover border border-gray-100"
            />
          </div>

          <div className="flex-1">
            <textarea
              placeholder="Comparte algo..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
              rows="2"
              className="w-full p-1 text-gray-800 placeholder-gray-400 bg-transparent border-none focus:ring-0 resize-none text-[16px] font-normal leading-normal outline-none"
            />
          </div>
        </div>


        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 px-1">
            {mediaFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="relative w-full h-20 bg-gray-50 rounded-lg overflow-hidden group/item border border-gray-200 shadow-sm"
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
                    <span className="truncate max-w-[80%] uppercase tracking-tighter text-[9px]">{file.name}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-primary-600 text-white rounded-full p-1 transition-all"
                >
                  <FaTimes size={8} />
                </button>
              </div>
            ))}
          </div>
        )}


        {dragActive && (
          <div className="absolute inset-2 rounded-lg border-2 border-dashed border-primary-400 bg-primary-50/90 text-primary-600 flex flex-col items-center justify-center font-bold uppercase tracking-widest text-[10px] z-20 backdrop-blur-sm animate-pulse">
            <span className="text-2xl mb-1">✨</span>
            Suelta los archivos aquí
          </div>
        )}

        {error && (
          <div className="text-primary-600 text-[11px] font-bold px-4 mt-3">
            ⚠️ {error}
          </div>
        )}

        <div className="border-t border-gray-100 mt-4 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${mediaFiles.length > 0
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              <FaPaperclip size={12} />
              <span>{mediaFiles.length > 0 ? 'Añadir más' : 'Media'}</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!content.trim() && mediaFiles.length === 0}
            className={`px-6 py-2 text-[13px] font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 flex items-center gap-2 ${isOnline
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
          >
            {isOnline ? 'Publicar' : 'Guardar offline'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreatePost;
