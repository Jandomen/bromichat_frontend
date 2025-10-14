import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FaPaperclip } from 'react-icons/fa'; // 👈 Paperclip for file input
import defaultProfile from '../../assets/default-profile.png';

const ChangeProfilePicture = () => {
  const { user, token, setUser } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${process.env.REACT_APP_API_BACKEND}${path}`;
  };

  useEffect(() => {
    if (user?.profilePicture) {
      setPreview(getFullImageUrl(user.profilePicture));
    } else {
      setPreview(null);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 2MB.');
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    const stored = JSON.parse(localStorage.getItem('user'));
    if (stored) {
      const updatedStorage = { ...stored, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(updatedStorage));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor, selecciona una imagen.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', selectedFile);

    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.REACT_APP_API_BACKEND}/user/profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      updateUserState(response.data.user);
      alert('Foto de perfil actualizada');
    } catch (err) {
      alert('Hubo un error al actualizar la foto de perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BACKEND}/user/profile-picture`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      updateUserState(response.data.user);
      setPreview(null);
      setSelectedFile(null);
      alert('Foto de perfil eliminada');
    } catch (err) {
      alert('No se pudo eliminar la foto de perfil');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-fit mx-auto text-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Actualizar Foto de Perfil</h2>

      {/* Image preview */}
      <div className="relative w-32 h-32 mx-auto mb-4 group">
        <img
          src={preview || defaultProfile}
          alt="Vista previa"
          className="w-full h-full object-cover rounded-full border border-gray-300"
        />
        {selectedFile && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {selectedFile.name}
          </div>
        )}
      </div>

      {/* Custom file input */}
      <div className="relative mb-4">
        <input
          type="file"
          id="file-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors duration-200 mx-auto"
        >
          <FaPaperclip className="text-blue-700" />
          <span className="font-medium">
            {selectedFile ? selectedFile.name : 'Seleccionar imagen'}
          </span>
        </label>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={handleUpload}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400"
          disabled={loading || !selectedFile}
        >
          {loading ? 'Subiendo...' : 'Guardar'}
        </button>
        <button
          onClick={handleDelete}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          disabled={!user?.profilePicture}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default ChangeProfilePicture;