import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { SocketContext } from "./SocketContext";
import { AuthContext } from "./AuthContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { socket } = useContext(SocketContext);
  const { token, user } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sonidoHabilitado, setSonidoHabilitado] = useState(
    localStorage.getItem("soundEnabled") !== "false"
  );
  const [archivoSonido, setArchivoSonido] = useState(
    localStorage.getItem("soundFile") || "/sounds/notification-1-270124.mp3"
  );
  const [error, setError] = useState(null);

  // 🔊 referencia única para el audio
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(archivoSonido);
  }, [archivoSonido]);

  const habilitarSonido = () => setSonidoHabilitado(true);
  const deshabilitarSonido = () => setSonidoHabilitado(false);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
     // console.log("📩 Nueva notificación:", notification);

      setNotifications((prev) => {
        if (prev.some((n) => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });

      setUnreadCount((prev) =>
        Math.max(prev + (notification.isRead ? 0 : 1), 0)
      );

      if (sonidoHabilitado && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) =>
          console.error("🔇 Error reproduciendo sonido:", err)
        );
      }
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket, sonidoHabilitado]);

  useEffect(() => {
    localStorage.setItem("soundEnabled", sonidoHabilitado);
    localStorage.setItem("soundFile", archivoSonido);
  }, [sonidoHabilitado, archivoSonido]);

  useEffect(() => {
    if (!user?._id || !token) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BACKEND}/notifications`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n) => !n.isRead).length);
      } catch (error) {
       // console.error("❌ Error fetching notifications:", error);
        setError("Error al cargar notificaciones");
        setTimeout(() => setError(null), 3000);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BACKEND}/notifications/unread-count`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUnreadCount(res.data.unreadCount);
      } catch (error) {
       // console.error("❌ Error fetching unread count:", error);
      }
    };

    fetchNotifications();
    fetchUnreadCount();
  }, [user?._id, token]);

  const markAsRead = async (id) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BACKEND}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
     // console.error("❌ Error marking notification as read:", error);
      setError("Error al marcar la notificación como leída");
      setTimeout(() => setError(null), 3000);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BACKEND}/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
     // console.error("❌ Error marking all notifications as read:", error);
      setError("Error al marcar todas las notificaciones como leídas");
      setTimeout(() => setError(null), 3000);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BACKEND}/notifications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => {
        const wasUnread = notifications.find(
          (n) => n._id === id && !n.isRead
        );
        return wasUnread ? Math.max(prev - 1, 0) : prev;
      });
    } catch (error) {
     // console.error("❌ Error deleting notification:", error);
      setError("Error al eliminar la notificación");
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        sonidoHabilitado,
        habilitarSonido,
        deshabilitarSonido,
        archivoSonido,
        setArchivoSonido,
        error,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificaciones = () => useContext(NotificationContext);
