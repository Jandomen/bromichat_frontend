import React, { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';
import GroupChatInput from '../GroupChat/GroupChatInput';

const ChatComponent = ({ conversationId: propConversationId, isGroup: propIsGroup = false, participants: propParticipants = [] }) => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [conversationId, setConversationId] = useState(propConversationId || null);
  const [isGroup, setIsGroup] = useState(propIsGroup);
  const [participants, setParticipants] = useState(propParticipants);
  const [users, setUsers] = useState({});
  const [groupName, setGroupName] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [lastSentMessageId, setLastSentMessageId] = useState(null); 

  const endRef = useRef(null);

  const isImage = (url) => /\.(png|jpe?g|gif|webp|avif)$/i.test(url);
  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);
  const scrollToEnd = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    setConversationId(propConversationId || null);
  }, [propConversationId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!conversationId) return;
      try {
        setLoading(true);
        const convRes = await api.get(`/conversation/${conversationId}`);
        const conv = convRes.data;
        setIsGroup(Boolean(conv.isGroup));
        setParticipants(conv.participants || []);
        setGroupName(conv.name || 'Grupo sin nombre');
        const msgRes = await api.get(`/messages/conversation/${conversationId}`);
        setMessages(msgRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar la conversación');
       // console.error('Error fetching conversation:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [conversationId]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const ids = (participants || [])
          .map(p => (typeof p === 'string' ? p : p?._id))
          .filter(Boolean);
        const uniqueIds = [...new Set(ids)];
        if (!uniqueIds.length) return;
        const results = await Promise.all(uniqueIds.map(id => api.get(`/user/profile/${id}`)));
        const map = {};
        uniqueIds.forEach((id, i) => { map[id] = results[i].data; });
        setUsers(map);
      } catch (err) {
        setError('Error al obtener detalles de usuarios');
       // console.error('Error fetching user details:', err);
      }
    };
    fetchUserDetails();
  }, [participants]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit('join_conversation', { conversationId });
   // console.log(`Joining conversation: ${conversationId}`);

    const handleIncoming = (data) => {
     // console.log('Received conversation_message:', data);
      if (data?.conversationId === conversationId && data?.message) {
        // Skip if the message is the last one we sent
        if (data.message._id === lastSentMessageId) {
         // console.log('Ignoring own sent message:', data.message._id);
          return;
        }
        setMessages(prev => {
          if (prev.some(msg => msg._id === data.message._id)) {
           // console.log('Ignoring duplicate message:', data.message._id);
            return prev;
          }
          return [...prev, data.message];
        });
      }
    };

    const handleMessageUpdated = (data) => {
     // console.log('Received conversation_message_updated:', data);
      if (data?.conversationId === conversationId && data?.message) {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === data.message._id ? { ...msg, ...data.message } : msg
          )
        );
      }
    };

    const handleMessageDeleted = (data) => {
     // console.log('Received conversation_message_deleted:', data);
      if (data?.conversationId === conversationId && data?.messageId) {
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      }
    };

    socket.on('conversation_message', handleIncoming);
    socket.on('conversation_message_updated', handleMessageUpdated);
    socket.on('conversation_message_deleted', handleMessageDeleted);

    return () => {
      socket.off('conversation_message', handleIncoming);
      socket.off('conversation_message_updated', handleMessageUpdated);
      socket.off('conversation_message_deleted', handleMessageDeleted);
      socket.emit('leave_conversation', { conversationId });
     // console.log(`Leaving conversation: ${conversationId}`);
    };
  }, [socket, conversationId, lastSentMessageId]);

  useEffect(() => {
    scrollToEnd();
  }, [messages]);

  const handleSendMessage = async ({ content, file }) => {
    setError(null);
    if (!content.trim() && !file) {
      setError('Escribe un mensaje o adjunta un archivo');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      if (conversationId) {
        formData.append('conversationId', conversationId);
      }
      formData.append('content', content);
      if (file) formData.append('file', file);

      const res = await api.post('/messages/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      
      setLastSentMessageId(res.data.message._id); 
      scrollToEnd();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el mensaje');
     // console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = async (messageId) => {
    if (!editContent.trim()) {
      setError('El mensaje no puede estar vacío');
      return;
    }
    try {
      setLoading(true);
      const res = await api.put(`/messages/edit/${messageId}`, { content: editContent });
      socket.emit('conversation_message_updated', { conversationId, message: res.data.updatedMessage });
      setEditingMessageId(null);
      setEditContent('');
      setMenuOpen(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al editar el mensaje');
     // console.error('Error editing message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      setLoading(true);
      await api.delete(`/messages/delete/${messageId}`);
      socket.emit('conversation_message_deleted', { conversationId, messageId });
      setMenuOpen(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el mensaje');
     // console.error('Error deleting message:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = (senderId) => {
    const id = typeof senderId === 'string' ? senderId : senderId?._id;
    const u = users[id] || {};
    const profilePicture = u.profilePicture && u.profilePicture !== '' ? getFullImageUrl(u.profilePicture) : defaultProfile;
    return {
      username: u.username || 'Usuario',
      profilePicture,
    };
  };

  const recipientInfo = useMemo(() => {
    if (isGroup) {
      return { username: groupName, profilePicture: defaultProfile, id: null };
    }
    const recipient = participants.find(p => (typeof p === 'string' ? p : p?._id) !== user._id);
    if (!recipient) {
      return { username: 'Usuario', profilePicture: defaultProfile, id: null };
    }
    const userInfo = getUserInfo(recipient);
    return { ...userInfo, id: typeof recipient === 'string' ? recipient : recipient._id };
  }, [isGroup, groupName, participants, users, user._id]);

  return (
    <div className="flex flex-col h-screen max-h-screen w-full md:w-[600px] mx-auto border rounded shadow bg-white">
      {recipientInfo.username && recipientInfo.username !== 'Usuario' ? (
        <div className="flex items-center gap-3 p-4 border-b bg-gray-50 sticky top-0 z-10">
          {recipientInfo.id && !isGroup ? (
            <Link
              to={`/user/${recipientInfo.id}`}
              className="flex items-center gap-3 hover:bg-gray-100 p-1 rounded transition"
            >
              <img
                src={recipientInfo.profilePicture}
                alt={recipientInfo.username}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                 // console.error('Error loading profile picture:', e.target.src);
                  e.target.src = defaultProfile;
                }}
              />
              <span className="font-semibold text-base sm:text-lg">
                {recipientInfo.username}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <img
                src={recipientInfo.profilePicture}
                alt={recipientInfo.username}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                 // console.error('Error loading profile picture:', e.target.src);
                  e.target.src = defaultProfile;
                }}
              />
              <span className="font-semibold text-base sm:text-lg">
                {recipientInfo.username}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 border-b text-red-500 text-sm bg-red-50 sticky top-0 z-10">
          ❗ Cargando destinatario...
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {loading && messages.length === 0 ? (
          <p className="text-center text-gray-500">Cargando mensajes...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No hay mensajes aún</p>
        ) : (
          messages.map((msg) => {
            const sid = typeof msg.senderId === 'string' ? msg.senderId : msg.senderId?._id;
            const { username, profilePicture } = getUserInfo(sid);
            const isOwn = sid === user._id;
            const fileAbs = msg.fileUrl ? getFullImageUrl(msg.fileUrl) : null;

            return (
              <div key={msg._id} className={`mb-4 flex ${isOwn ? 'justify-end' : 'justify-start'} items-start relative`}>
                {!isOwn && (
                  <img
                    src={profilePicture}
                    alt={username}
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                    onError={(e) => {
                     // console.error('Error loading message profile picture:', e.target.src);
                      e.target.src = defaultProfile;
                    }}
                  />
                )}

                <div className={`max-w-xs p-3 rounded-lg ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  {isGroup && !isOwn && <p className="text-xs font-semibold mb-1">{username}</p>}
                  {editingMessageId === msg._id ? (
                    <div className="flex flex-col">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="p-2 border rounded-lg text-black"
                        placeholder="Editar mensaje..."
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEditMessage(msg._id)}
                          className="text-sm text-green-500"
                          disabled={loading}
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingMessageId(null);
                            setEditContent('');
                          }}
                          className="text-sm text-red-500"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {msg.content && <p>{msg.content}</p>}
                      {fileAbs && (
                        <div className="mt-2">
                          {isImage(fileAbs) ? (
                            <img src={fileAbs} alt="Archivo" className="max-w-xs rounded" />
                          ) : isVideo(fileAbs) ? (
                            <video className="max-w-xs rounded" src={fileAbs} controls />
                          ) : (
                            <a href={fileAbs} target="_blank" rel="noopener noreferrer" className={isOwn ? 'underline' : 'text-blue-700 underline'}>
                              Ver archivo
                            </a>
                          )}
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                        {msg.isEdited && <span> (editado)</span>}
                      </p>
                    </>
                  )}
                </div>

                {isOwn && editingMessageId !== msg._id && (
                  <div className="relative ml-2">
                    <button
                      onClick={() => setMenuOpen(menuOpen === msg._id ? null : msg._id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ⋮
                    </button>
                    {menuOpen === msg._id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-20">
                        <button
                          onClick={() => {
                            setEditingMessageId(msg._id);
                            setEditContent(msg.content || '');
                            setMenuOpen(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {isOwn && (
                  <img
                    src={profilePicture}
                    alt={username}
                    className="w-8 h-8 rounded-full ml-2 object-cover"
                    onError={(e) => {
                     // console.error('Error loading message profile picture:', e.target.src);
                      e.target.src = defaultProfile;
                    }}
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <GroupChatInput onSend={handleSendMessage} />
    </div>
  );
};

export default ChatComponent;