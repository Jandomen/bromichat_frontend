import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { NotificationContext } from '../../context/NotificationContext';
import { SocketContext } from '../../context/SocketContext';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';

const ConversationList = ({ onSelectConversation, filteredConversations }) => {
  const { token, user } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);
  const { showConfirm, showToast } = useUI();
  const { messageNotifications } = useContext(NotificationContext);
  const [conversations, setConversations] = useState([]);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/conversation`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data);
    } catch {
      // Error fetching conversations, silent fail
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!socket) return;

    // Listen for events that should trigger a list refresh (new messages, etc.)
    const handleRefresh = () => {
      fetchConversations();
    };

    socket.on('conversation_message', handleRefresh);
    socket.on('newGroupMessage', handleRefresh);
    socket.on('newNotification', (notif) => {
      if (['message', 'group_message'].includes(notif.type)) {
        handleRefresh();
      }
    });

    return () => {
      socket.off('conversation_message', handleRefresh);
      socket.off('newGroupMessage', handleRefresh);
    };
  }, [socket, fetchConversations]);

  const userId = String(user._id);

  const validateParticipants = (participants) =>
    Array.isArray(participants) && participants.some((p) => String(p._id) === userId);

  const handleDeleteConversation = async (conversationId) => {
    showConfirm(
      'Eliminar conversación',
      '¿Estás seguro de que quieres eliminar esta conversación?',
      async () => {
        try {
          await axios.delete(`${process.env.REACT_APP_API_BACKEND}/conversation/${conversationId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setConversations((prev) => prev.filter((c) => c._id !== conversationId));
          showToast('Conversación eliminada', 'success');
        } catch {
          showToast('No se pudo eliminar la conversación.', 'error');
        }
      }
    );
  };

  const conversationsToRender = filteredConversations || conversations;

  return (
    <div className="bg-white h-full flex flex-col">
      <h2 className="p-4 text-xl font-bold border-b text-gray-800 bg-gray-50/50 backdrop-blur-sm sticky top-0 z-10">Mensajes</h2>
      <ul className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {conversationsToRender.length === 0 && (
          <li className="p-8 text-gray-500 text-center flex flex-col items-center">
            <span className="text-4xl mb-2 opacity-30">💬</span>
            <p className="text-sm">No hay conversaciones.</p>
          </li>
        )}

        {conversationsToRender.map((conv) => {
          if (!validateParticipants(conv.participants)) return null;

          const otherUser = conv.participants.find((p) => String(p._id) !== userId);

          const displayName = conv.isGroup
            ? conv.name || 'Group'
            : otherUser?.username || 'User';

          const profileImage = conv.isGroup
            ? (conv.groupImage ? getFullImageUrl(conv.groupImage) : defaultProfile)
            : getFullImageUrl(otherUser?.profilePicture || defaultProfile);

          const isOnline = !conv.isGroup && otherUser && onlineUsers.has(String(otherUser._id));
          const isUnread = messageNotifications.some(n => n.conversationId === conv._id && !n.isRead);

          return (
            <li
              key={conv._id}
              onClick={() => onSelectConversation(conv._id)}
              className={`group p-3 hover:bg-indigo-50 rounded-xl cursor-pointer flex items-center transition-all duration-200 relative ${isUnread ? 'bg-indigo-50/30' : ''}`}
            >
              <div className="relative">
                <img
                  src={profileImage}
                  alt={displayName}
                  className={`w-12 h-12 rounded-full mr-4 object-cover border shadow-sm group-hover:scale-105 transition-transform ${isUnread ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-100'}`}
                  onError={(e) => { e.target.src = defaultProfile; }}
                />
                {!conv.isGroup && isOnline && (
                  <div className="absolute bottom-0 right-4 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                )}
                {isUnread && (
                  <div className="absolute -top-1 -left-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-600 border-2 border-white shadow-[0_0_8px_rgba(79,70,229,0.8)]"></span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className={`truncate text-sm ${isUnread ? 'font-black text-indigo-900' : 'font-semibold text-gray-900'}`}>{displayName}</h3>
                  {isUnread && <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full shrink-0 ml-2 shadow-sm shadow-indigo-200"></span>}
                </div>
                {!conv.isGroup && otherUser && (
                  <p className={`text-xs truncate ${isUnread ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>{otherUser.name} {otherUser.lastName}</p>
                )}
                {conv.isGroup && (
                  <p className="text-xs text-indigo-500 font-medium">{conv.participants.length} Miembros</p>
                )}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv._id); }}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all ml-1"
                title="Delete conversation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ConversationList;
