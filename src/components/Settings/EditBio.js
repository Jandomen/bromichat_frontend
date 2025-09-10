import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const EditBio = () => {
  const { user, token, setUser } = useContext(AuthContext);
  const [bio, setBio] = useState(user?.bio || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSaveBio = async () => {
    if (!bio) return;
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
    <div className="border p-4 rounded shadow-sm">
      <h4 className="font-semibold mb-2">Editar Bio</h4>
      <textarea
        className="w-full border rounded p-2 mb-2"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={3}
        placeholder="Escribe tu bio aquí..."
      />
      <button
        onClick={handleSaveBio}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? "Guardando..." : "Guardar"}
      </button>
      {message && <p className="mt-2 text-green-500">{message}</p>}
    </div>
  );
};

export default EditBio;
