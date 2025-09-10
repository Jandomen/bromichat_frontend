import React, { useState } from 'react';
import photoService from '../../services/photoService'; // Use photoService instead of direct api import

const PhotoUpload = ({ token, onUpload }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState(null); // Local state for image preview

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result); // Set local preview
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
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
      setPreview(null); // Clear preview after upload
      onUpload(); // Trigger fetchPhotos in Gallery
      alert('Foto subida con éxito.');
    } catch (err) {
      //console.error('[PhotoUpload.js] Error al subir la foto:', err);
      alert('Error al subir la foto. Intenta de nuevo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2 mb-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="border px-2 py-1 rounded"
      />
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Vista previa" className="w-32 h-32 object-cover rounded" />
        </div>
      )}
      <input
        type="text"
        placeholder="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border px-2 py-1 rounded"
      />
      <button
        type="submit"
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Subir foto
      </button>
    </form>
  );
};

export default PhotoUpload;