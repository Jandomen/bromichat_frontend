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
    if (!file) {
      console.log("No file selected or picker cancelled");
      return;
    }

    // console.log("File metadata selected:", { name: file.name, size: file.size, type: file.type });

    if (!file.type.startsWith('image/')) {
      showToast('Solo se permiten imágenes (JPG, PNG, GIF)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // Increased to 5MB just in case, but usually 2MB is safe
      showToast('La imagen es demasiado grande. Máximo 5MB.', 'error');
      return;
    }

    setSelectedFile(file);
    try {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      showToast('Imagen seleccionada correctamente', 'success');
    } catch (err) {
      console.error("Error creating object URL:", err);
      // Fallback: we don't set preview but we still have the file
      showToast('Imagen lista para subir', 'success');
    }
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
      showToast('Por favor, selecciona una imagen primero.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', selectedFile);

    try {
      setLoading(true);
      // Let Axios handle the Content-Type with the correct boundary
      const response = await axios.put(
        `${process.env.REACT_APP_API_BACKEND}/user/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.user) {
        updateUserState(response.data.user);
        showToast('¡Foto de perfil actualizada con éxito!', 'success');
        setSelectedFile(null);
      } else {
        throw new Error("Respuesta incompleta del servidor");
      }
    } catch (err) {
      console.error("Upload error details:", err.response?.data || err.message);
      const msg = err.response?.data?.message || err.response?.data?.error || 'No se pudo subir la foto. Intenta con una imagen más pequeña o de otro formato.';
      showToast(msg, 'error');
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
      <div className="flex flex-col sm:flex-row items-center gap-4 xs:gap-6 sm:gap-8">
        {/* Image preview */}
        <div className="relative group mx-auto sm:mx-0">
          <div className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-white border-2 border-dashed border-gray-300 group-hover:border-blue-500 transition-colors">
            <img
              src={preview || defaultProfile}
              alt="Vista previa"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          {selectedFile && (
            <div className="absolute -bottom-2 inset-x-0 mx-auto w-fit px-2 xs:px-3 py-0.5 xs:py-1 bg-gray-900/80 backdrop-blur text-white text-[10px] xs:text-xs rounded-full truncate max-w-[100px] xs:max-w-[120px]">
              {selectedFile.name}
            </div>
          )}
        </div>

        <div className="flex-1 w-full text-center sm:text-left">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 xs:gap-3 sm:gap-4 justify-center sm:justify-start items-center">
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
                className="flex items-center justify-center w-full sm:w-auto gap-1.5 xs:gap-2 px-4 xs:px-6 py-2 xs:py-2.5 text-xs xs:text-sm sm:text-base bg-blue-50 text-blue-700 font-medium rounded-lg xs:rounded-xl cursor-pointer hover:bg-blue-100 transition-all duration-200 border border-blue-200"
              >
                <FaPaperclip className="text-blue-600 w-3 h-3 xs:w-4 xs:h-4" />
                <span>
                  {selectedFile ? 'Cambiar' : 'Seleccionar'}
                </span>
              </label>
            </div>

            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={loading}
                className="flex items-center justify-center w-full sm:w-auto gap-1.5 xs:gap-2 px-4 xs:px-6 py-2 xs:py-2.5 text-xs xs:text-sm sm:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg xs:rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Upload className="w-3 h-3 xs:w-4 xs:h-4" />
                {loading ? 'Subiendo...' : 'Guardar Foto'}
              </button>
            )}

            {user?.profilePicture && (
              <button
                onClick={handleDelete}
                className="flex items-center justify-center w-full sm:w-auto gap-1.5 xs:gap-2 px-4 xs:px-6 py-2 xs:py-2.5 text-xs xs:text-sm sm:text-base bg-white text-red-600 font-medium rounded-lg xs:rounded-xl border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
              >
                <Trash2 className="w-3 h-3 xs:w-4 xs:h-4" />
                Eliminar
              </button>
            )}
          </div>
          <p className="mt-3 xs:mt-4 text-[10px] xs:text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            Formatos permitidos: JPG, PNG o GIF. Tamaño máximo 2MB.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangeProfilePicture;