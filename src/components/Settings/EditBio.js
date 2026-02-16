import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { Save } from 'lucide-react';

const EditBio = () => {
  const { user, token, setUser } = useContext(AuthContext);
  const [bio, setBio] = useState(user?.bio || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSaveBio = async () => {
    /* 
       IMPORTANT: If you want consistent behavior (e.g. allow saving empty bio),
       remove the `!bio` check or adjust backend logic. For now, I'll keep it as is
       but allow clearing by sending empty string if your backend supports it.
       Assuming backend handles empty string as "clear bio". 
    */
    if (bio === undefined) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await api.put(
        `/user/bio/${user._id}`,
        { bio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      setMessage("Bio actualizada con éxito :)");
    } catch (err) {
      setMessage(err.response?.data?.error || "Error al actualizar la bio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none min-h-[100px] text-gray-700"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Escribe algo sobre ti..."
        />
        <div className="mt-3 flex items-center justify-between">
          <span className={`text-xs ${bio.length > 300 ? 'text-red-500' : 'text-gray-400'}`}>
            {bio.length} caracteres
          </span>

          <button
            onClick={handleSaveBio}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:scale-100 disabled:shadow-none transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Save className="w-4 h-4" />
            {loading ? "Guardando..." : "Guardar Bio"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default EditBio;
