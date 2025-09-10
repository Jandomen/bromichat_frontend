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
      } catch (err) {
        //console.error('Error al obtener conversaciones:', err);
      }
    };

    fetchConversations();
  }, [token]);

  const validateParticipants = (participants, userId) => {
    if (!Array.isArray(participants)) return false;
    return participants.some((p) => String(p._id) === String(userId));
  };

  const handleDeleteConversation = async (conversationId) => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar esta conversación?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_BACKEND}/conversation/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
    } catch (error) {
     // console.error('Error al eliminar conversación:', error);
      alert('No se pudo eliminar la conversación.');
    }
  };

  const conversationsToRender = filteredConversations || conversations;
  const userId = String(user._id);

  return (
    <div>
      <h2 className="p-4 text-lg font-semibold border-b">Conversaciones</h2>
      <ul>
        {conversationsToRender.length > 0 ? (
          conversationsToRender.map((conv) => {
            if (!validateParticipants(conv.participants, userId)) {
              return (
                <li key={conv._id} className="p-4 text-red-500 cursor-default">
                  Conversación inválida o incompleta
                </li>
              );
            }

            const otherUser = conv.participants.find((p) => String(p._id) !== userId);

            if (!otherUser && !conv.isGroup) {
              return (
                <li key={conv._id} className="p-4 text-red-500 cursor-default">
                  Conversación sin otro usuario válido
                </li>
              );
            }

            return (
              <li
                key={conv._id}
                onClick={() => onSelectConversation(conv._id)}
                className="p-4 hover:bg-gray-100 cursor-pointer flex items-center"
              >
                {otherUser && (
                  <img
                    src={getFullImageUrl(otherUser.profilePicture || defaultProfile)}
                    alt={otherUser.username}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                    onError={(e) => { e.target.src = defaultProfile; }}
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{conv.isGroup ? conv.name || 'Grupo sin nombre' : otherUser.username}</p>
                  {!conv.isGroup && otherUser && (
                    <p className="text-sm text-gray-500">
                      {otherUser.name} {otherUser.lastName}
                    </p>
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
          })
        ) : (
          <div className="p-4 text-gray-500 text-center">No tienes conversaciones aún.</div>
        )}
      </ul>
    </div>
  );
};

export default ConversationList;
