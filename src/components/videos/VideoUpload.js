import React, { useState } from 'react';
import { FaPaperclip, FaTimes } from 'react-icons/fa';

const VideoUpload = ({ onUpload }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
   // console.log('Archivo seleccionado:', file);
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Solo se permiten videos');
      return;
    }
    setVideoFile(file);
  };

  const handleRemoveFile = () => {
    setVideoFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return alert('Selecciona un video');

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', title);
    formData.append('description', description);

    try {
      await onUpload(formData);
      setVideoFile(null);
      setTitle('');
      setDescription('');
    } catch (err) {
      alert('Error al subir el video');
     // console.error(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 space-y-4 bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold text-gray-800">Subir Video</h2>

      {/* Título */}
      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Descripción */}
      <input
        type="text"
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Botón de subida */}
      <div className="relative">
        <input
          type="file"
          id="file-upload"
          accept="video/*"
          onChange={handleFileChange}
          className="absolute w-0 h-0 opacity-0"
        />
        <label
          htmlFor="file-upload"
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors duration-200"
        >
          <FaPaperclip className="text-blue-700" />
          <span>{videoFile ? videoFile.name : 'Adjuntar video'}</span>
        </label>
      </div>

      {/* Previsualización del video */}
      {videoFile && (
        <div className="relative w-full max-w-xs h-48 bg-gray-100 rounded-lg overflow-hidden group">
          <video
            src={URL.createObjectURL(videoFile)}
            className="w-full h-full object-cover"
            muted
            controls={false}
          />
          <button
            type="button"
            onClick={handleRemoveFile}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label={`Eliminar ${videoFile.name}`}
          >
            <FaTimes size={12} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {videoFile.name}
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        Subir Video
      </button>
    </form>
  );
};

export default VideoUpload;
