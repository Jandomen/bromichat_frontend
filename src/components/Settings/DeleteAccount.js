import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { useUI } from "../../context/UIContext";
import { Trash2, AlertTriangle } from "lucide-react";

const DeleteAccount = () => {
  const { token, setUser } = useContext(AuthContext);
  const { showConfirm, showToast } = useUI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteAccount = async () => {
    showConfirm(
      "Eliminar Cuenta",
      "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.",
      async () => {
        setLoading(true);
        setError(null);

        try {
          await api.delete("/user/delete", {
            headers: { Authorization: `Bearer ${token}` },
          });
          showToast("Cuenta eliminada exitosamente", "success");
          setUser(null);
          window.location.href = "/";
        } catch (err) {
          const errMsg = err.response?.data?.message || "Error al eliminar la cuenta";
          setError(errMsg);
          showToast(errMsg, "error");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-red-100 rounded-xl text-red-600 hidden sm:block">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-lg text-gray-900 mb-1">Eliminación Permanente</h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            Al eliminar tu cuenta, se borrarán todos tus datos, amigos, fotos y mensajes. Esta acción <span className="font-bold text-red-600">no se puede deshacer</span>.
          </p>
        </div>
      </div>

      <button
        onClick={handleDeleteAccount}
        disabled={loading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:from-red-700 hover:to-red-800 disabled:opacity-70 transform hover:-translate-y-0.5 transition-all duration-200"
      >
        <Trash2 className="w-5 h-5" />
        {loading ? "Eliminando..." : "Sí, Eliminar mi Cuenta"}
      </button>

      {error && <p className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</p>}
    </div>
  );
};

export default DeleteAccount;
