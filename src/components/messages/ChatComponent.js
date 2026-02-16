import React, { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';
import ChatInput from '../GroupChat/GroupChatInput';
import { NotificationContext } from '../../context/NotificationContext';
import { CallContext } from '../../context/CallContext';
import { Phone, Video, MoreVertical, ChevronLeft } from 'lucide-react';

const ChatComponent = ({ conversationId: propConversationId, isGroup: propIsGroup = false, participants: propParticipants = [], onBack }) => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const { markConversationAsRead } = useContext(NotificationContext);
  const { callUser, callGroup } = useContext(CallContext);
  const [conversationId, setConversationId] = useState(propConversationId || null);
  const [isGroup, setIsGroup] = useState(propIsGroup);
  const [chatType, setChatType] = useState('group');
  const [participants, setParticipants] = useState(propParticipants);
  const [users, setUsers] = useState({});
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [lastSentMessageId, setLastSentMessageId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const endRef = useRef(null);
  const scrollRef = useRef(null);
  const skipScrollRef = useRef(false);

  const isImage = (url) => /\.(png|jpe?g|gif|webp|avif)$/i.test(url);
  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);
  const scrollToEnd = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  const setMessagesWithDebug = (update, source) => {
    if (typeof update === 'function') {
      setMessages(update);
    } else if (Array.isArray(update)) {
      setMessages(update);
    } else {
      // console.error(`Invalid messages from ${source}:`, update);
      setError(`Error: Invalid message data from ${source}`);
      setMessages([]);
    }
  };

  useEffect(() => {
    setConversationId(propConversationId || null);
    // console.log('Conversation ID updated:', propConversationId);
  }, [propConversationId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!conversationId) return;
      try {
        setLoading(true);
        const convRes = await api.get(`/conversation/${conversationId}`);
        // console.log('Conversation API Response:', convRes.data);
        const conv = convRes.data;
        setIsGroup(Boolean(conv.isGroup));
        setChatType(conv.chatType || 'group');
        setParticipants(conv.participants || conv.members || []);
        setGroupName(conv.name || 'Grupo sin nombre');
        setGroupImage(conv.groupImage || '');
        const msgRes = await api.get(`/messages/conversation/${conversationId}?page=1&limit=20`);
        // console.log('Messages API Response:', msgRes.data);
        const messages = Array.isArray(msgRes.data.messages) ? msgRes.data.messages : [];
        setMessagesWithDebug(messages, 'fetchData');
        setHasMore(messages.length === 20);

        // 🔔 Mark notifications as read for this conversation
        markConversationAsRead(conversationId);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading conversation');
        // console.error('Error fetching conversation:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [conversationId]);

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const scrollElement = scrollRef.current;
      const previousScrollHeight = scrollElement?.scrollHeight || 0;

      const msgRes = await api.get(`/messages/conversation/${conversationId}?page=${page + 1}&limit=20`);
      const newMessages = Array.isArray(msgRes.data.messages) ? msgRes.data.messages : [];

      if (newMessages.length === 0) {
        setHasMore(false);
        return;
      }

      skipScrollRef.current = true;
      setMessagesWithDebug((prev) => [...newMessages, ...prev], 'loadMoreMessages');
      setPage(page + 1);

      // Restore scroll position after render
      setTimeout(() => {
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight - previousScrollHeight;
        }
      }, 0);
    } catch (err) {
      setError('Error loading more messages');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const ids = (participants || [])
          .map((p) => (typeof p === 'string' ? p : p?._id))
          .filter(Boolean);
        const uniqueIds = [...new Set(ids)];
        if (!uniqueIds.length) return;
        const results = await Promise.all(uniqueIds.map((id) => api.get(`/user/profile/${id}`)));
        const map = {};
        uniqueIds.forEach((id, i) => {
          map[id] = results[i].data;
        });
        setUsers(map);
      } catch (err) {
        setError('Error fetching user details');
        // console.error('Error fetching user details:', err);
      }
    };
    fetchUserDetails();
  }, [participants]);

  useEffect(() => {
    if (!socket || !conversationId || !user?._id) return;

    const roomEvent = isGroup ? 'join_group' : 'join_conversation';
    const roomId = isGroup ? `group:${conversationId}` : `conversation:${conversationId}`;
    socket.emit(roomEvent, {
      [isGroup ? 'groupId' : 'conversationId']: conversationId,
      userId: user._id,
    });
    // console.log('Socket joined:', roomId);

    const handleIncoming = (data) => {
      // console.log('Socket Incoming Message:', data);
      if (!data || data.conversationId !== conversationId || !data.message?._id) {
        // console.warn('Invalid message data:', data);
        return;
      }
      if (data.message._id === lastSentMessageId) {
        // console.log('Ignoring own message:', data.message._id);
        return;
      }
      setMessages((prev) => {
        if (!Array.isArray(prev)) {
          // console.error('Messages is not an array, resetting:', prev);
          return [data.message];
        }
        if (prev.some((msg) => msg._id === data.message._id)) {
          // console.log('Duplicate message ignored:', data.message._id);
          return prev;
        }

        // 🔔 If we are viewing this conversation, mark any new notification as read
        markConversationAsRead(conversationId);

        return [...prev, data.message];
      });
    };

    const handleMessageUpdated = (data) => {
      // console.log('Socket Message Updated:', data);
      if (!data || data.conversationId !== conversationId || !data.message?._id) {
        // console.warn('Invalid updated message data:', data);
        return;
      }
      setMessages((prev) => {
        if (!Array.isArray(prev)) {
          // console.error('Messages is not an array, resetting:', prev);
          return [data.message];
        }
        return prev.map((msg) => (msg._id === data.message._id ? { ...msg, ...data.message } : msg));
      });
    };

    const handleMessageDeleted = (data) => {
      // console.log('Socket Message Deleted:', data);
      if (!data || data.conversationId !== conversationId || !data.messageId) {
        // console.warn('Invalid deleted message data:', data);
        return;
      }
      setMessages((prev) => {
        if (!Array.isArray(prev)) {
          // console.error('Messages is not an array, resetting:', prev);
          return [];
        }
        return prev.filter((msg) => msg._id !== data.messageId);
      });
    };

    socket.on(isGroup ? 'newGroupMessage' : 'conversation_message', handleIncoming);
    socket.on(isGroup ? 'groupMessageUpdated' : 'conversation_message_updated', handleMessageUpdated);
    socket.on(isGroup ? 'groupMessageDeleted' : 'conversation_message_deleted', handleMessageDeleted);

    return () => {
      socket.off(isGroup ? 'newGroupMessage' : 'conversation_message', handleIncoming);
      socket.off(isGroup ? 'groupMessageUpdated' : 'conversation_message_updated', handleMessageUpdated);
      socket.off(isGroup ? 'groupMessageDeleted' : 'conversation_message_deleted', handleMessageDeleted);
      socket.emit(isGroup ? 'leave_group' : 'leave_conversation', {
        [isGroup ? 'groupId' : 'conversationId']: conversationId,
      });
      // console.log('Socket left:', roomId);
    };
  }, [socket, conversationId, isGroup, user._id, lastSentMessageId]);

  // ⌨️ Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedMedia(null);
    };
    if (selectedMedia) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedMedia]);

  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    scrollToEnd();
  }, [messages]);

  const handleSendMessage = async ({ content, file, conversationId: cid }) => {
    setError(null);
    if (!content.trim() && !file) {
      setError('Type a message or attach a file');
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('conversationId', cid || conversationId);
      formData.append('content', content);
      if (file) formData.append('file', file);
      // console.log('Sending FormData:', [...formData.entries()]);

      // Unify endpoint to /messages/send
      const res = await api.post('/messages/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // console.log('API response:', res.data);

      // Optimistically update UI
      const newMessage = res.data.message;
      setMessages((prev) => {
        if (!Array.isArray(prev)) {
          // console.error('Messages is not an array, resetting:', prev);
          return [newMessage];
        }
        if (prev.some((msg) => msg._id === newMessage._id)) {
          // console.log('Duplicate message ignored:', newMessage._id);
          return prev;
        }
        return [...prev, newMessage];
      });
      setLastSentMessageId(newMessage._id);
      scrollToEnd();
    } catch (err) {
      // console.error('Error sending message:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = async (messageId) => {
    if (!editContent.trim()) {
      setError('Message cannot be empty');
      return;
    }
    try {
      setLoading(true);
      const res = await api.put(`/messages/edit/${messageId}`, { content: editContent });
      socket.emit(isGroup ? 'groupMessageUpdated' : 'conversation_message_updated', {
        conversationId,
        message: res.data.updatedMessage,
      });
      setEditingMessageId(null);
      setEditContent('');
      setMenuOpen(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error editing message');
      // console.error('Error editing message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      setLoading(true);
      await api.delete(`/messages/delete/${messageId}`);
      socket.emit(isGroup ? 'groupMessageDeleted' : 'conversation_message_deleted', {
        conversationId,
        messageId,
      });
      setMenuOpen(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting message');
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
      username: u.username || 'User',
      profilePicture,
    };
  };

  const getDownloadUrl = (url, fileName = '') => {
    if (!url) return '';
    if (url.includes('cloudinary.com')) {
      // Handle both /upload/ and /raw/upload/
      const uploadPattern = /\/(?:raw\/)?upload\//;
      const match = url.match(uploadPattern);

      if (match) {
        const replacement = match[0].replace('/upload/', '/upload/fl_attachment/');
        let finalUrl = url.replace(match[0], replacement);

        // If we have a specific filename, we could try to inject it, 
        // but Cloudinary fl_attachment usually uses the publicId.
        // We ensure it opens in a new tab or triggers download.
        return finalUrl;
      }
    }
    return url;
  };

  const recipientInfo = useMemo(() => {
    if (isGroup) {
      return {
        username: groupName,
        profilePicture: groupImage ? getFullImageUrl(groupImage) : defaultProfile,
        id: null
      };
    }
    const recipient = participants.find((p) => (typeof p === 'string' ? p : p?._id) !== user._id);
    if (!recipient) {
      return { username: 'User', profilePicture: defaultProfile, id: null };
    }
    const userInfo = getUserInfo(recipient);
    return { ...userInfo, id: typeof recipient === 'string' ? recipient : recipient._id };
  }, [isGroup, groupName, groupImage, participants, users, user._id]);

  return (
    <div className="flex flex-col h-full w-full bg-[#f0f2f5] overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')" }}></div>

      {recipientInfo.username && recipientInfo.username !== 'User' ? (
        <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-md border-b sticky top-0 z-20 shadow-sm">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden w-12 h-12 -ml-3 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              <ChevronLeft size={28} />
            </button>
          )}
          {recipientInfo.id && !isGroup ? (
            <Link to={`/user/${recipientInfo.id}`} className="flex items-center gap-3 transition hover:opacity-80">
              <div className="relative">
                <img
                  src={recipientInfo.profilePicture}
                  alt={recipientInfo.username}
                  className="w-11 h-11 rounded-full object-cover shadow-sm border-2 border-white"
                  onError={(e) => { e.target.src = defaultProfile; }}
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-lg leading-tight">{recipientInfo.username}</span>
                <span className="text-xs text-green-500 font-medium">Presente</span>
              </div>
            </Link>
          ) : (
            <Link
              to={chatType === 'community' ? `/groups/${conversationId}` : `/chat/group-settings/${conversationId}`}
              className="flex items-center gap-3 transition hover:opacity-80"
            >
              <img
                src={recipientInfo.profilePicture}
                alt={recipientInfo.username}
                className="w-11 h-11 rounded-full object-cover shadow-sm border-2 border-white"
                onError={(e) => { e.target.src = defaultProfile; }}
              />
              <span className="font-bold text-gray-800 text-lg">{recipientInfo.username}</span>
            </Link>
          )}


          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => isGroup
                ? callGroup(conversationId, recipientInfo.username, recipientInfo.profilePicture, participants)
                : callUser(recipientInfo.id, recipientInfo.username, recipientInfo.profilePicture, "audio", conversationId)}
              className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
              title={isGroup ? "Iniciar llamada grupal" : "Llamada de voz"}
            >
              <Phone size={20} />
            </button>
            <button
              onClick={() => isGroup
                ? callGroup(conversationId, recipientInfo.username, recipientInfo.profilePicture, participants)
                : callUser(recipientInfo.id, recipientInfo.username, recipientInfo.profilePicture, "video", conversationId)}
              className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
              title={isGroup ? "Iniciar videollamada grupal" : "Videollamada"}
            >
              <Video size={20} />
            </button>
            <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b text-center bg-gray-50 sticky top-0 z-10 animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mx-auto"></div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 z-10 custom-scrollbar"
      >
        {hasMore && messages.length > 0 && (
          <button
            onClick={loadMoreMessages}
            disabled={loadingMore}
            className={`w-full py-2 text-sm text-indigo-500 hover:bg-indigo-50 rounded-lg transition mb-2 ${loadingMore ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loadingMore ? 'Cargando...' : 'Cargar mensajes anteriores'}
          </button>
        )}

        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 m-4 bg-red-50 text-red-600 rounded-xl text-center shadow-sm border border-red-100">
            {error}
          </div>
        ) : !Array.isArray(messages) ? (
          <p className="text-center text-red-500">Error al cargar mensajes</p>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
            <div className="text-6xl mb-4">👋</div>
            <p>¡No hay mensajes aún!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const sid = typeof msg.senderId === 'string' ? msg.senderId : msg.senderId?._id?.toString() || msg.senderId?.id;
            const { username, profilePicture } = getUserInfo(sid);
            const isOwn = sid === user._id.toString() || sid === user.id;
            const fileAbs = msg.fileUrl ? getFullImageUrl(msg.fileUrl) : null;
            const isLast = index === messages.length - 1;

            return (
              <div
                key={msg._id}
                className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} group mb-1`}
              >
                {!isOwn && (
                  <img
                    src={profilePicture}
                    alt={username}
                    className="w-8 h-8 rounded-full mr-2 self-end mb-1 shadow-sm object-cover"
                    onError={(e) => { e.target.src = defaultProfile; }}
                  />
                )}

                <div
                  className={`relative max-w-[75%] px-4 py-2 shadow-sm transition-all duration-200 
                    ${isOwn
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100'
                    }`}
                >

                  {isGroup && !isOwn && (
                    <p className="text-[10px] font-bold text-indigo-500 mb-1 opacity-80 uppercase tracking-wide">
                      {username}
                    </p>
                  )}


                  {editingMessageId === msg._id ? (
                    <div className="flex flex-col min-w-[200px]">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="p-2 text-black bg-white/90 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-2"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 text-xs">
                        <button onClick={() => handleEditMessage(msg._id)} className="text-white font-bold bg-green-500/20 px-2 py-1 rounded hover:bg-green-500/40">Guardar</button>
                        <button onClick={() => { setEditingMessageId(null); setEditContent(''); }} className="text-indigo-100 hover:text-white px-2 py-1">Cancelar</button>
                      </div>
                    </div>
                  ) : msg.messageType === 'call' ? (
                    <div className="flex flex-col gap-2 min-w-[180px] py-1">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${msg.callDetails?.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {msg.callType === 'audio' ? <Phone size={16} /> : <Video size={16} />}
                        </div>
                        <span className="font-bold text-sm">
                          {msg.callDetails?.status === 'completed' ? 'Llamada finalizada' :
                            msg.callDetails?.status === 'rejected' ? 'Llamada rechazada' : 'Llamada perdida'}
                        </span>
                      </div>

                      <div className="flex flex-col text-[11px] opacity-70">
                        <div className="flex justify-between">
                          <span>Inicio:</span>
                          <span>{new Date(msg.callDetails?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fin:</span>
                          <span>{new Date(msg.callDetails?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {msg.callDetails?.status === 'completed' && (
                          <div className="flex justify-between font-bold border-t border-white/10 mt-1 pt-1">
                            <span>Duración:</span>
                            <span>
                              {Math.floor(msg.callDetails.duration / 60)}:
                              {String(msg.callDetails.duration % 60).padStart(2, '0')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {msg.content && <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>}

                      {fileAbs && (
                        <div className="mt-2 rounded-lg overflow-hidden bg-black/5">
                          {msg.fileType === 'image' ? (
                            <img
                              src={fileAbs}
                              alt="Attachment"
                              className="max-w-full max-h-[300px] object-contain cursor-pointer hover:opacity-95 transition"
                              onClick={() => setSelectedMedia({ url: fileAbs, type: 'image' })}
                            />
                          ) : msg.fileType === 'video' ? (
                            <div className="relative group cursor-pointer" onClick={() => setSelectedMedia({ url: fileAbs, type: 'video' })}>
                              <video src={fileAbs} className="max-w-full max-h-[300px]" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition">
                                <div className="w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <a
                              href={getDownloadUrl(fileAbs, msg.fileName)}
                              download={msg.fileName || 'archivo'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 p-3 ${isOwn ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition overflow-hidden`}
                            >
                              <span className="text-2xl shrink-0">📄</span>
                              <div className="flex flex-col min-w-0">
                                <span className="truncate text-sm font-medium underline">{msg.fileName || 'Descargar archivo'}</span>
                                <span className="text-[10px] opacity-60 uppercase">Documento / Archivo</span>
                              </div>
                            </a>
                          )}
                        </div>
                      )}
                    </>
                  )}


                  <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isOwn ? 'text-indigo-100' : 'text-gray-400'}`}>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.isEdited && <span>• edited</span>}
                  </div>


                  {isOwn && (
                    <div className="absolute top-0 right-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setMenuOpen(menuOpen === msg._id ? null : msg._id)}
                        className="bg-white text-gray-400 hover:text-indigo-600 rounded-full p-1 shadow-sm border border-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
                        </svg>
                      </button>
                    </div>
                  )}


                  {menuOpen === msg._id && (
                    <div className="absolute top-8 right-0 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden">
                      <button
                        onClick={() => { setEditingMessageId(msg._id); setEditContent(msg.content || ''); setMenuOpen(null); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 bg-white border-t z-20">
        <ChatInput onSend={handleSendMessage} conversationId={conversationId} />
      </div>


      {selectedMedia && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-200"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all z-[110]"
            onClick={() => setSelectedMedia(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative max-w-full max-h-full flex items-center justify-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.url}
                alt="Full view"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              />
            )}

            <a
              href={getDownloadUrl(selectedMedia.url)}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all border border-white/10 text-sm font-medium"
            >
              <span>📥</span> Descargar Original
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;