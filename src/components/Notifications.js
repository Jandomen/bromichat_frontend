import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { NotificationContext } from '../context/NotificationContext';
import { getFullImageUrl } from '../utils/getProfilePicture';
import defaultProfile from '../assets/default-profile.png';
import { Heart, ThumbsDown, MessageSquare, Mail, Users, UserPlus, Handshake, Bell, ArrowUp } from 'lucide-react';

const renderIcon = (type) => {
  const size = 20;
  switch (type) {
    case 'like': return <Heart className="text-red-500" size={size} />;
    case 'dislike': return <ThumbsDown className="text-gray-500" size={size} />;
    case 'comment': return <MessageSquare className="text-blue-500" size={size} />;
    case 'message': return <Mail className="text-green-500" size={size} />;
    case 'group_message': return <Users className="text-purple-500" size={size} />;
    case 'friend_request': return <Handshake className="text-orange-500" size={size} />;
    case 'new_follower': return <UserPlus className="text-indigo-500" size={size} />;
    default: return <Bell className="text-gray-500" size={size} />;
  }
};

export default function Notifications() {
  const { notifications, markAsRead, unreadCount, markAllAsRead, deleteNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200); 
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification._id);
      }
      if (notification.link) {
        navigate(notification.link.replace('/post/', '/posts/'));
      }
    } catch (err) {
      setError('Error al marcar la notificación como leída');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!window.confirm('¿Seguro que quieres eliminar todas las notificaciones?')) return;
    try {
      
      await Promise.all(notifications.map((n) => deleteNotification(n._id)));
    } catch (err) {
      setError('Error al eliminar todas las notificaciones');
     // console.error('Error deleting all notifications:', err);
      setTimeout(() => setError(null), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Notificaciones ({unreadCount} sin leer)
          </h2>
          <div className="flex space-x-4">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  className="text-blue-500 hover:underline"
                >
                  Marcar todas como leídas
                </button>
                <button
                  onClick={handleDeleteAllNotifications}
                  className="text-red-500 hover:underline"
                >
                  Eliminar todas
                </button>
              </>
            )}
          </div>
        </div>
        {notifications.length === 0 ? (
          <p className="text-gray-600">No hay notificaciones.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`p-4 rounded shadow cursor-pointer flex items-center space-x-4 ${
                  notification.isRead ? 'bg-gray-100' : 'bg-blue-100'
                } hover:bg-gray-200`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-shrink-0">
                  {renderIcon(notification.type)}
                </div>
                {notification.sender && (
                  <img
                    src={getFullImageUrl(notification.sender.profilePicture || defaultProfile)}
                    alt={notification.sender.username || 'Usuario'}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = defaultProfile;
                    }}
                  />
                )}
                <div>
                  <p className="text-gray-800">{notification.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    className="text-red-500 hover:text-red-600 text-sm mt-1"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          aria-label="Volver arriba"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}