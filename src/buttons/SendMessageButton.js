import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import ChatIcon from '@mui/icons-material/Chat';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import api from '../services/api';

const SendMessageButton = ({ recipientId, groupId, variant = 'icon', notificationCount = 0, onClick, className = '', children }) => {
  const navigate = useNavigate();
  const { token, user: currentUser } = useContext(AuthContext);
  const { unreadMessageCount } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);

  // Use prop if provided, otherwise use context count for header badge
  const count = notificationCount > 0 ? notificationCount : unreadMessageCount;

  const handleClick = async (e) => {
    e.stopPropagation();
    if (onClick) onClick();

    // Group messaging logic
    if (groupId) {
      // Navigate to unified messages dashboard
      navigate(`/messages/${groupId}`);
      return;
    }

    // Private messaging logic
    if (!recipientId) {
      navigate('/messages');
      return;
    }

    if (!token || !currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // 1. Check for existing conversation
      const resConversations = await api.get('/conversation');
      const existingConversation = resConversations.data.find((conv) => {
        if (conv.isGroup) return false;
        const participantIds = conv.participants.map(p => p._id || p);
        return participantIds.includes(currentUser._id) && participantIds.includes(recipientId);
      });

      if (existingConversation) {
        navigate(`/messages/${existingConversation._id}`);
        return;
      }

      // 2. Create new conversation if none exists
      const payload = {
        participantIds: [currentUser._id, recipientId].sort(),
        isGroup: false,
      };
      const res = await api.post('/conversation/create', payload);
      const convoId = res.data?._id || res.data?.conversation?._id || res.data?.id;

      if (convoId) {
        navigate(`/messages/${convoId}`);
      } else {
        navigate(`/messages/${recipientId}`);
      }
    } catch (error) {
      console.error('Error in SendMessageButton:', error);
      navigate(`/messages/${recipientId}`);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'full') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={`px-4 py-2 ${groupId ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50 ${className}`}
      >
        <ChatIcon fontSize="small" />
        {loading ? 'Cargando...' : (children || (groupId ? 'Chat de Grupo' : 'Mensaje'))}
      </button>
    );
  }

  return (
    <button
      className={`relative flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-all active:scale-95 ${className}`}
      onClick={handleClick}
      disabled={loading}
      aria-label={`Mensajes (${count} sin leer)`}
    >
      {children || (
        <>
          <FontAwesomeIcon
            icon={faEnvelope}
            className={`text-xl transition-colors duration-300 ${count > 0 ? 'text-white' : 'text-gray-300'}`}
          />
          {count > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md ring-2 ring-red-900/50 z-20 animate-pulse">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default SendMessageButton;
