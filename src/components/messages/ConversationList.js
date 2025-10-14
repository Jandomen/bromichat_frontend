import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';

const ConversationList = ({ onSelectConversation, filteredConversations }) => {
  const { token, user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/conversation`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(res.data);
      } catch {
        // Error fetching conversations, silent fail
      }
    };

    fetchConversations();
  }, [token]);

  const userId = String(user._id);

  const validateParticipants = (participants) =>
    Array.isArray(participants) && participants.some((p) => String(p._id) === userId);

  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta conversación?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_BACKEND}/conversation/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
    } catch {
      alert('No se pudo eliminar la conversación.');
    }
  };

  const conversationsToRender = filteredConversations || conversations;

  return (
    <div>
      <h2 className="p-4 text-lg font-semibold border-b">Conversaciones</h2>
      <ul>
        {conversationsToRender.length === 0 && (
          <li className="p-4 text-gray-500 text-center">No tienes conversaciones aún.</li>
        )}

        {conversationsToRender.map((conv) => {
          if (!validateParticipants(conv.participants)) {
            return (
              <li key={conv._id} className="p-4 text-red-500 cursor-default">
                Conversación inválida o incompleta
              </li>
            );
          }

          const otherUser = conv.participants.find((p) => String(p._id) !== userId);

          const displayName = conv.isGroup
            ? conv.name || 'Grupo sin nombre'
            : otherUser?.username || 'Usuario';

          const profileImage = conv.isGroup
            ? defaultProfile
            : getFullImageUrl(otherUser?.profilePicture || defaultProfile);

          return (
            <li
              key={conv._id}
              onClick={() => onSelectConversation(conv._id)}
              className="p-4 hover:bg-gray-100 cursor-pointer flex items-center"
            >
              <img
                src={profileImage}
                alt={displayName}
                className="w-10 h-10 rounded-full mr-3 object-cover"
                onError={(e) => { e.target.src = defaultProfile; }}
              />
              <div className="flex-1">
                <p className="font-semibold">{displayName}</p>
                {!conv.isGroup && otherUser && (
                  <p className="text-sm text-gray-500">{otherUser.name} {otherUser.lastName}</p>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv._id); }}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ConversationList;
