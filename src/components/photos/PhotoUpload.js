import React, { useState } from 'react';
import { FaPaperclip, FaTimes } from 'react-icons/fa'; 
import photoService from '../../services/photoService';

const PhotoUpload = ({ token, onUpload }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && !selectedFile.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Por favor, selecciona una foto.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('description', description);

    try {
      await photoService.uploadPhoto(formData, token);
      setFile(null);
      setDescription('');
      setPreview(null);
      onUpload();
      alert('Foto subida con éxito.');
    } catch (err) {
      alert('Error al subir la foto. Intenta de nuevo.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 space-y-4 bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold text-gray-800">Subir Foto</h2>
     
      <input
        type="text"
        placeholder="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <div className="relative">
        <input
          type="file"
          id="file-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors duration-200"
        >
          <FaPaperclip className="text-blue-700" />
          <span className="font-medium">
            {file ? file.name : 'Adjuntar imagen'}
          </span>
        </label>
      </div>
      
      {preview && (
        <div className="relative w-full max-w-xs h-48 bg-gray-100 rounded-lg overflow-hidden group">
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-full object-cover"
          />
         
          <button
            type="button"
            onClick={handleRemoveFile}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label={`Eliminar ${file?.name || 'imagen'}`}
          >
            <FaTimes size={12} />
          </button>
          
          {file && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {file.name}
            </div>
          )}
        </div>
      )}
      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        Subir Foto
      </button>
    </form>
  );
};

export default PhotoUpload;