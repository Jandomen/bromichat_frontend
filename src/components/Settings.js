import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { useNotificaciones } from "../context/NotificationContext";
import api from "../services/api";
import Header from "./Header";
import Footer from "./Footer";
import ChangeProfilePicture from "./Settings/ChangeProfilePicture";
import MyBlockedUsersList from "./Settings/MyBlockedUsersList";
import EditBio from "./Settings/EditBio";
import DeleteAccount from "./Settings/DeleteAccount";

const Settings = () => {
  const { user: currentUser, token, setUser: setCurrentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const {
    sonidoHabilitado,
    habilitarSonido,
    deshabilitarSonido,
    archivoSonido,
    setArchivoSonido,
  } = useNotificaciones();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUnblockUser = async (userId) => {
    if (!token || !currentUser) {
      setError("Debes iniciar sesión para desbloquear usuarios.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/friend/unblock/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "No se pudo desbloquear al usuario";
      setError(errorMessage);
     // console.error("Error al desbloquear usuario:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !currentUser) return;

    socket.on("userBlocked", ({ blockedUsers }) => {
      if (currentUser._id === blockedUsers[0]?.owner) {
        setCurrentUser((prev) => ({ ...prev, blockedUsers }));
      }
    });

    socket.on("userUnblocked", ({ blockedUsers }) => {
      if (currentUser._id === blockedUsers[0]?.owner) {
        setCurrentUser((prev) => ({ ...prev, blockedUsers }));
      }
    });

    return () => {
      socket.off("userBlocked");
      socket.off("userUnblocked");
    };
  }, [socket, currentUser, setCurrentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto mt-6 px-4">
          <p className="text-red-500 text-center">
            Debes iniciar sesión para ver la configuración.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto mt-6 px-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Configuración</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Cambiar Foto de Perfil */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Cambiar Foto de Perfil</h3>
          <ChangeProfilePicture />
        </section>

        {/* Editar Bio */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Editar Bio</h3>
          <EditBio />
        </section>

        {/* Usuarios Bloqueados */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Usuarios Bloqueados</h3>
          <MyBlockedUsersList onUnblockUser={handleUnblockUser} />
        </section>

        {/* Notificaciones */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Notificaciones</h3>
          <div className="flex items-center gap-2 mb-4">
            <label className="font-medium">Activar sonido de notificaciones</label>
            <input
              type="checkbox"
              checked={sonidoHabilitado}
              onChange={(e) =>
                e.target.checked ? habilitarSonido() : deshabilitarSonido()
              }
              className="w-5 h-5"
            />
          </div>

          {sonidoHabilitado && (
            <div>
              <label className="block font-medium mb-1">Elegir sonido</label>
              <select
                value={archivoSonido}
                onChange={(e) => setArchivoSonido(e.target.value)}
                className="border rounded p-2"
              >
                <option value="/sounds/notification-1-270124.mp3">Notificación 1</option>
                <option value="/sounds/new-notification-021-370045.mp3">Notificación 2</option>
                <option value="/sounds/simple-notification-152054.mp3">Notificación 3</option>
              </select>
            </div>
          )}
        </section>

        {/* Eliminar Cuenta */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-2 text-red-600">Eliminar Cuenta</h3>
          <DeleteAccount />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
