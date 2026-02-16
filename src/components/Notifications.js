import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { NotificationContext } from '../context/NotificationContext';
import { getFullImageUrl } from '../utils/getProfilePicture';
import defaultProfile from '../assets/default-profile.png';
import { Heart, ThumbsDown, MessageSquare, Mail, Users, UserPlus, Handshake, Bell, ArrowUp, Share2, Smile } from 'lucide-react';
import { useUI } from '../context/UIContext';

const renderIcon = (type) => {
  const size = 20;
  switch (type) {
    case 'like': return <Heart className="text-red-500" size={size} />;
    case 'dislike': return <ThumbsDown className="text-gray-500" size={size} />;
    case 'comment':
    case 'reply': return <MessageSquare className="text-blue-500" size={size} />;
    case 'message': return <Mail className="text-green-500" size={size} />;
    case 'group_invite':
    case 'group_message':
    case 'group': return <Users className="text-purple-500" size={size} />;
    case 'friend_request': return <Handshake className="text-orange-500" size={size} />;
    case 'new_follower': return <UserPlus className="text-indigo-500" size={size} />;
    case 'share': return <Share2 className="text-green-600" size={size} />;
    case 'reaction': return <Smile className="text-yellow-500" size={size} />;
    default: return <Bell className="text-gray-500" size={size} />;
  }
};

export default function Notifications() {
  const { generalNotifications, markAsRead, unreadGeneralCount, markAllAsRead, deleteNotification } = useContext(NotificationContext);
  const { showConfirm, showToast, setSelectedPostId, setHighlightedCommentId } = useUI();
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

      // 1. Prioritize explicit link from backend
      if (notification.link) {
        // If the link is to a post, try opening in modal
        if (notification.link.startsWith('/posts/')) {
          const pid = notification.link.split('/').pop();
          setSelectedPostId(pid);
          return;
        }
        navigate(notification.link);
        return;
      }

      // 2. Logic based on type and associated IDs
      if (notification.type === 'message' || notification.type === 'group_message') {
        const targetId = notification.conversationId || notification.sender?._id;
        navigate(`/messages/${targetId}`);
      } else if (notification.type === 'friend_request' || notification.type === 'new_follower') {
        navigate(`/user/${notification.sender?._id}`);
      } else if (['like', 'comment', 'reply', 'dislike', 'reaction', 'share'].includes(notification.type) && notification.postId) {
        if (notification.commentId) {
          setHighlightedCommentId(notification.commentId);
        }
        setSelectedPostId(notification.postId);
      }

    } catch (err) {
      console.error('Error handling notification click:', err);
      setError('Error al procesar la notificación');
    }
  };

  const handleDeleteAllNotifications = () => {
    showConfirm(
      'Borrar Notificaciones',
      '¿Estás seguro de que quieres eliminar todas tus notificaciones de forma permanente?',
      async () => {
        try {
          await Promise.all(generalNotifications.map((n) => deleteNotification(n._id)));
          showToast('Notificaciones eliminadas', 'success');
        } catch (err) {
          console.error('Error deleting all notifications:', err);
          showToast('Error al eliminar las notificaciones', 'error');
        }
      }
    );
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm relative animate-fade-in">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Bell className="text-red-600" size={28} />
              Notificaciones
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Tienes <span className="font-bold text-red-600">{unreadGeneralCount}</span> notificaciones nuevas
            </p>
          </div>

          <div className="flex gap-3 text-sm font-medium">
            {generalNotifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition shadow-sm flex items-center gap-2"
                >
                  <span>✓✓</span> Marcar todo leído
                </button>
                <button
                  onClick={handleDeleteAllNotifications}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition shadow-sm flex items-center gap-2"
                >
                  <span>🗑️</span> Borrar todo
                </button>
              </>
            )}
          </div>
        </div>

        {generalNotifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-300" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">No hay notificaciones</h3>
            <p className="text-gray-500 mt-2">Te avisaremos cuando haya actividad reciente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {generalNotifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer flex gap-4 items-start ${!notification.isRead
                  ? 'bg-white border-red-100 shadow-md shadow-red-50 hover:shadow-lg hover:border-red-200'
                  : 'bg-gray-50/80 border-transparent hover:bg-white hover:shadow-sm hover:border-gray-200'
                  }`}
              >
                {/* Unread Indicator */}
                {!notification.isRead && (
                  <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                )}

                {/* Sender Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={notification.sender && notification.sender.profilePicture
                      ? getFullImageUrl(notification.sender.profilePicture)
                      : defaultProfile}
                    alt="Avatar"
                    className={`w-14 h-14 rounded-full object-cover border-2 ${!notification.isRead ? 'border-red-100' : 'border-gray-200'}`}
                    onError={(e) => { e.target.src = defaultProfile; }}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                    {renderIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow pr-8">
                  <div className="text-gray-900 leading-relaxed text-[15px]">
                    {notification.message}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 font-medium flex items-center gap-1">
                    {new Date(notification.createdAt).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Delete Individual Button (visible on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  className="absolute bottom-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100"
                  title="Eliminar notificación"
                >
                  <span className="text-lg font-bold leading-none">&times;</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-red-600 text-white p-3 rounded-full shadow-xl hover:bg-red-700 hover:scale-110 transition-all z-50 focus:outline-none focus:ring-4 focus:ring-red-300"
          aria-label="Volver arriba"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}