import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { SocketContext } from "./SocketContext";
import { AuthContext } from "./AuthContext";
import { useUI } from "./UIContext";
import { getFullImageUrl } from '../utils/getProfilePicture';
import { requestForToken } from "../firebase";
import { Badge } from '@capawesome/capacitor-badge';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { socket } = useContext(SocketContext);
  const { token, user } = useContext(AuthContext);
  const { showNotification } = useUI();

  const [notifications, setNotifications] = useState([]);
  const [sonidoHabilitado, setSonidoHabilitado] = useState(
    localStorage.getItem("soundEnabled") !== "false"
  );
  const [archivoSonido, setArchivoSonido] = useState(
    localStorage.getItem("soundFile") || "/sounds/notification-1-270124.mp3"
  );
  const [error, setError] = useState(null);

  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(archivoSonido);
  }, [archivoSonido]);

  const playNotificationSound = useCallback(() => {
    if (sonidoHabilitado && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) =>
        console.error("🔇 Error reproduciendo sonido:", err)
      );
    }
  }, [sonidoHabilitado]);

  const habilitarSonido = () => setSonidoHabilitado(true);
  const deshabilitarSonido = () => setSonidoHabilitado(false);

  // Derived state
  const messageNotifications = notifications.filter(
    (n) => ['message', 'group_message'].includes(n.type)
  );
  const generalNotifications = notifications.filter(
    (n) => !['message', 'group_message'].includes(n.type)
  );

  const unreadGeneralCount = generalNotifications.filter((n) => !n.isRead).length;
  const unreadMessageCount = messageNotifications.filter((n) => !n.isRead).length;
  const unreadCount = unreadGeneralCount + unreadMessageCount;

  // Global sound policy unblock
  useEffect(() => {
    const unblockAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }).catch(() => { });
      }
      window.removeEventListener('click', unblockAudio);
      window.removeEventListener('touchstart', unblockAudio);
    };
    window.addEventListener('click', unblockAudio);
    window.addEventListener('touchstart', unblockAudio);
    return () => {
      window.removeEventListener('click', unblockAudio);
      window.removeEventListener('touchstart', unblockAudio);
    };
  }, []);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem("soundEnabled", sonidoHabilitado);
    localStorage.setItem("soundFile", archivoSonido);
  }, [sonidoHabilitado, archivoSonido]);

  // Update App Icon Badge
  useEffect(() => {
    const updateBadge = async () => {
      try {
        if (unreadCount > 0) {
          await Badge.set({ count: unreadCount });
        } else {
          await Badge.clear();
        }
      } catch (e) {
        console.warn("Badge logic only works on native devices", e);
      }
    };
    updateBadge();
  }, [unreadCount]);

  // Request browser notification permission and FCM token
  useEffect(() => {
    if (user?._id && token) {
      requestForToken(user._id, token);
    }
  }, [user?._id, token]);

  // Initial fetch
  useEffect(() => {
    if (!user?._id || !token) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BACKEND}/notifications`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifications(res.data);
      } catch (error) {
        setError("Error al cargar notificaciones");
        setTimeout(() => setError(null), 3000);
      }
    };
    fetchNotifications();
  }, [user?._id, token]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });

      playNotificationSound();

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.sender?.name || 'Bromichat', {
          body: notification.message,
          icon: getFullImageUrl(notification.sender?.profilePicture) || '/logo192.png',
        });
      }

      showNotification({
        title: notification.sender?.name || 'Bromichat',
        message: notification.message,
        type: notification.type,
        senderAvatar: notification.sender?.profilePicture,
        link: notification.link || (notification.type === 'message' ? '/messages' : '/notifications')
      }, 3500);
    };

    socket.on("newNotification", handleNewNotification);

    socket.on("notificationsMarkedAsRead", ({ conversationId, notificationId, all }) => {
      setNotifications((prev) => prev.map((n) => {
        if (all) return { ...n, isRead: true };
        if (notificationId && n._id === notificationId) return { ...n, isRead: true };
        if (conversationId && n.conversationId === conversationId) return { ...n, isRead: true };
        return n;
      }));
    });
    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("notificationsMarkedAsRead");
    };
  }, [socket, playNotificationSound, showNotification]);

  const markAsRead = async (id) => {
    try {
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      await axios.put(`${process.env.REACT_APP_API_BACKEND}/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
      setError("Error al marcar como leída");
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await axios.put(`${process.env.REACT_APP_API_BACKEND}/notifications/mark-all-read`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
      setError("Error al marcar todo");
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      setNotifications((prev) => prev.map((n) => n.conversationId === conversationId ? { ...n, isRead: true } : n));
      await axios.put(`${process.env.REACT_APP_API_BACKEND}/notifications/conversation/${conversationId}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) { }
  };

  const deleteNotification = async (id) => {
    try {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      await axios.delete(`${process.env.REACT_APP_API_BACKEND}/notifications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
      setError("Error al eliminar");
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        generalNotifications,
        messageNotifications,
        unreadCount,
        unreadGeneralCount,
        unreadMessageCount,
        markAsRead,
        markAllAsRead,
        markConversationAsRead,
        deleteNotification,
        sonidoHabilitado,
        habilitarSonido,
        deshabilitarSonido,
        archivoSonido,
        setArchivoSonido,
        playNotificationSound,
        error,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificaciones = () => useContext(NotificationContext);
