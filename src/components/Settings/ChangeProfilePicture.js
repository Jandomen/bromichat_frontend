import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FaPaperclip } from 'react-icons/fa'; // 👈 Paperclip for file input
import defaultProfile from '../../assets/default-profile.png';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import { useUI } from '../../context/UIContext';
import { Upload, Trash2 } from 'lucide-react';

const ChangeProfilePicture = () => {
  const { user, token, setUser } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useUI();

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
      showToast('Solo se permiten imágenes', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('La imagen es demasiado grande. Máximo 2MB.', 'error');
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
      showToast('Por favor, selecciona una imagen.', 'warning');
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
      showToast('Foto de perfil actualizada', 'success');
      setSelectedFile(null);
    } catch (err) {
      showToast('Hubo un error al actualizar la foto de perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BACKEND}/user/profile-picture`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPreview(null);
      setSelectedFile(null);
      showToast('Foto de perfil eliminada', 'success');
    } catch (err) {
      showToast('No se pudo eliminar la foto de perfil', 'error');
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Image preview */}
        <div className="relative group mx-auto sm:mx-0">
          <div className="w-32 h-32 rounded-full p-1 bg-white border-2 border-dashed border-gray-300 group-hover:border-blue-500 transition-colors">
            <img
              src={preview || defaultProfile}
              alt="Vista previa"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          {selectedFile && (
            <div className="absolute -bottom-2 inset-x-0 mx-auto w-fit px-3 py-1 bg-gray-900/80 backdrop-blur text-white text-xs rounded-full truncate max-w-[120px]">
              {selectedFile.name}
            </div>
          )}
        </div>

        <div className="flex-1 w-full text-center sm:text-left">
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start items-center">
            {/* Custom file input */}
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
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-700 font-medium rounded-xl cursor-pointer hover:bg-blue-100 transition-all duration-200 border border-blue-200"
              >
                <FaPaperclip className="text-blue-600" />
                <span>
                  {selectedFile ? 'Cambiar imagen' : 'Seleccionar archivo'}
                </span>
              </label>
            </div>

            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Upload className="w-4 h-4" />
                {loading ? 'Subiendo...' : 'Guardar Foto'}
              </button>
            )}

            {user?.profilePicture && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-red-600 font-medium rounded-xl border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Formatos permitidos: JPG, PNG o GIF. Tamaño máximo 2MB.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangeProfilePicture;