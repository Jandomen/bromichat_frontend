import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
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
     // console.log(getFullImageUrl(user.profilePicture))
    } else {
      setPreview(null);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
    if (!selectedFile) return;

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
     // console.error('Error al subir la imagen:', err);
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
    alert('Foto de perfil eliminada');
  } catch (err) {
   // console.error('Error al eliminar la imagen:', err);
    alert('No se pudo eliminar la foto de perfil');
  }
};


  return (
    <div className="p-4 border rounded-md shadow-md w-fit mx-auto text-center">
      <h2 className="text-lg font-semibold mb-4">Actualizar Foto de Perfil</h2>

      <img
        src={preview || defaultProfile}
        alt="Vista previa"
        className="w-32 h-32 object-cover rounded-full mx-auto mb-2 border"
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-3"
      />

      <div className="flex justify-center gap-2">
        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-1 rounded"
          disabled={loading}
        >
          {loading ? 'Subiendo...' : 'Guardar'}
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-1 rounded"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default ChangeProfilePicture;
