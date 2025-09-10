import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const DeleteAccount = () => {
  const { token, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteAccount = async () => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) return;

    setLoading(true);
    setError(null);

    try {
      await api.delete("/user/delete", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(null);
      window.location.href = "/"; 
    } catch (err) {
      setError(err.response?.data?.message || "Error al eliminar la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded shadow-sm mt-6">
      <h4 className="font-semibold mb-2 text-red-600">Eliminar Cuenta</h4>
      <p className="mb-2 text-gray-700">Esta acción es irreversible. Tu cuenta se eliminará permanentemente.</p>
      <button
        onClick={handleDeleteAccount}
        disabled={loading}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        {loading ? "Eliminando..." : "Eliminar Cuenta"}
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
};

export default DeleteAccount;
