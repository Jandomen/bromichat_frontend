import React, { useEffect, useState, useContext, useRef, useMemo, useCallback } from 'react';
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

const getDownloadUrl = (url, fileName = '') => {
  if (!url) return '';
  if (url.includes('cloudinary.com')) {
    const uploadPattern = /\/(?:raw\/)?upload\//;
    const match = url.match(uploadPattern);

    if (match) {
      const replacement = match[0].replace('/upload/', '/upload/fl_attachment/');
      return url.replace(match[0], replacement);
    }
  }
  return url;
};

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
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [lastSentMessageId, setLastSentMessageId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const endRef = useRef(null);
  const scrollRef = useRef(null);
  const skipScrollRef = useRef(false);
  const isInitialScrollRef = useRef(true);

  const scrollToEnd = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  const setMessagesWithDebug = (update, source) => {
    if (typeof update === 'function') {
      setMessages(update);
    } else if (Array.isArray(update)) {
      setMessages(update);
    } else {
      setError(`Error: Invalid message data from ${source}`);
      setMessages([]);
    }
  };

  useEffect(() => {
    setConversationId(propConversationId || null);
    isInitialScrollRef.current = true;
  }, [propConversationId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!conversationId) return;
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        const convRes = await api.get(`/conversation/${conversationId}`);
        const conv = convRes.data;
        setIsGroup(Boolean(conv.isGroup));
        setChatType(conv.chatType || 'group');
        setParticipants(conv.participants || conv.members || []);
        setGroupName(conv.name || 'Grupo sin nombre');
        setGroupImage(conv.groupImage || '');

        const msgRes = await api.get(`/messages/conversation/${conversationId}?page=1&limit=20`);
        const messagesData = Array.isArray(msgRes.data.messages) ? msgRes.data.messages : [];

        setMessages(messagesData);
        setHasMore(messagesData.length === 20);
        markConversationAsRead(conversationId);
      } catch (err) {
        console.error("Error loading chat:", err);
        setError('Error al cargar la conversación. Reintentando...');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!participants || !participants.length) return;
    const map = {};
    participants.forEach((p) => {
      if (typeof p === 'object' && p._id) {
        map[p._id] = p;
        map[p._id.toString()] = p;
      }
    });
    setUsers(map);
  }, [participants]);

  useEffect(() => {
    if (!socket || !conversationId || !user?._id) return;

    const roomEvent = isGroup ? 'join_group' : 'join_conversation';

    socket.emit(roomEvent, {
      [isGroup ? 'groupId' : 'conversationId']: conversationId,
      userId: user._id,
    });

    const handleIncoming = (data) => {
      if (!data || data.conversationId !== conversationId || !data.message?._id) {
        return;
      }
      if (data.message._id === lastSentMessageId) {
        return;
      }
      setMessages((prev) => {
        if (!Array.isArray(prev)) {
          return [data.message];
        }
        if (prev.some((msg) => msg._id === data.message._id)) {
          return prev;
        }
        return [...prev, data.message];
      });
      markConversationAsRead(conversationId);
    };

    const handleMessageUpdated = (data) => {
      if (!data || data.conversationId !== conversationId || !data.message?._id) {
        return;
      }
      setMessages((prev) => {
        if (!Array.isArray(prev)) {
          return [data.message];
        }
        return prev.map((msg) => (msg._id === data.message._id ? { ...msg, ...data.message } : msg));
      });
    };

    const handleMessageDeleted = (data) => {
      if (!data || data.conversationId !== conversationId || !data.messageId) {
        return;
      }
      setMessages((prev) => {
        if (!Array.isArray(prev)) {
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, conversationId, isGroup, user._id, lastSentMessageId]);

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

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const isNearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 150;

      if (isInitialScrollRef.current) {
        if (messages.length > 0) {
          scrollToEnd();
          // Desactivamos el auto-scroll inicial después de completarlo
          setTimeout(() => {
            isInitialScrollRef.current = false;
          }, 300);
        }
      } else if (isNearBottom) {
        scrollToEnd();
      }
    }
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

      const res = await api.post('/messages/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newMessage = res.data.message;
      setMessages((prev) => {
        if (!Array.isArray(prev)) {
          return [newMessage];
        }
        if (prev.some((msg) => msg._id === newMessage._id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
      setLastSentMessageId(newMessage._id);
      scrollToEnd();
    } catch (err) {
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
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = useCallback((senderInfo) => {
    if (!senderInfo) return { username: 'Usuario Desconocido', profilePicture: defaultProfile };

    // Si el mensaje ya trae el objeto poblado del backend, usarlo
    if (typeof senderInfo === 'object' && senderInfo.username) {
      return {
        username: senderInfo.username,
        profilePicture: senderInfo.profilePicture && senderInfo.profilePicture !== '' ? getFullImageUrl(senderInfo.profilePicture) : defaultProfile,
      };
    }

    const id = typeof senderInfo === 'string' ? senderInfo : senderInfo?._id || senderInfo?.id;
    const u = users[id] || {};
    const profilePicture = u.profilePicture && u.profilePicture !== '' ? getFullImageUrl(u.profilePicture) : defaultProfile;
    return {
      username: u.username || 'Usuario Desconocido',
      profilePicture,
    };
  }, [users]);


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
  }, [isGroup, groupName, groupImage, participants, user._id, getUserInfo]);

  return (
    <div className="flex flex-col h-full w-full bg-[#f0f2f5] overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')" }}></div>

      {recipientInfo.username && recipientInfo.username !== 'User' ? (
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-4 px-2 xs:px-3 sm:px-6 py-1.5 xs:py-2 sm:py-3 bg-white/90 backdrop-blur-md border-b sticky top-0 z-20 shadow-sm pt-[env(safe-area-inset-top)]">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden w-12 h-12 -ml-3 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {recipientInfo.id && !isGroup ? (
            <Link to={`/user/${recipientInfo.id}`} className="flex items-center gap-2 xs:gap-3 transition hover:opacity-80 min-w-0 flex-1">
              <div className="relative shrink-0">
                <img
                  src={recipientInfo.profilePicture}
                  alt={recipientInfo.username}
                  className="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-full object-cover shadow-sm border border-white"
                  onError={(e) => { e.target.src = defaultProfile; }}
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-gray-800 text-sm xs:text-base sm:text-lg leading-tight truncate">{recipientInfo.username}</span>
                <span className="text-[9px] xs:text-xs text-green-500 font-medium">En línea</span>
              </div>
            </Link>
          ) : (
            <Link
              to={chatType === 'community' ? `/groups/${conversationId}` : `/chat/group-settings/${conversationId}`}
              className="flex items-center gap-2 xs:gap-3 transition hover:opacity-80 min-w-0 flex-1"
            >
              <img
                src={recipientInfo.profilePicture}
                alt={recipientInfo.username}
                className="w-8 h-8 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-sm border border-white shrink-0"
                onError={(e) => { e.target.src = defaultProfile; }}
              />
              <span className="font-bold text-gray-800 text-sm xs:text-base sm:text-lg truncate">{recipientInfo.username}</span>
            </Link>
          )}


          <div className="ml-auto flex items-center gap-1 sm:gap-2 relative">
            <button
              onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
              className="p-1.5 xs:p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              <MoreVertical size={18} />
            </button>

            {headerMenuOpen && (
              <div
                className="fixed inset-0 z-20"
                onClick={() => setHeaderMenuOpen(false)}
              />
            )}

            {headerMenuOpen && (
              <div className="absolute top-10 right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden">
                <button
                  onClick={() => {
                    setHeaderMenuOpen(false);
                    isGroup
                      ? callGroup(conversationId, recipientInfo.username, recipientInfo.profilePicture, participants)
                      : callUser(recipientInfo.id, recipientInfo.username, recipientInfo.profilePicture, "audio", conversationId);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors"
                >
                  <Phone size={16} /> {isGroup ? "Llamada Grupal" : "Llamada de Voz"}
                </button>
                <button
                  onClick={() => {
                    setHeaderMenuOpen(false);
                    isGroup
                      ? callGroup(conversationId, recipientInfo.username, recipientInfo.profilePicture, participants)
                      : callUser(recipientInfo.id, recipientInfo.username, recipientInfo.profilePicture, "video", conversationId);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors mt-0.5"
                >
                  <Video size={16} /> {isGroup ? "Video Grupal" : "Videollamada"}
                </button>
              </div>
            )}
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
            const currentDateStr = new Date(msg.createdAt).toLocaleDateString();
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const prevDateStr = prevMsg ? new Date(prevMsg.createdAt).toLocaleDateString() : null;
            const showDateDivider = currentDateStr !== prevDateStr;

            let dateDividerText = currentDateStr;
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            if (currentDateStr === today.toLocaleDateString()) {
              dateDividerText = 'Hoy';
            } else if (currentDateStr === yesterday.toLocaleDateString()) {
              dateDividerText = 'Ayer';
            } else {
              dateDividerText = new Date(msg.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
            }

            const sid = typeof msg.senderId === 'string' ? msg.senderId : msg.senderId?._id?.toString() || msg.senderId?.id;
            const { username, profilePicture } = getUserInfo(msg.senderId);
            const isOwn = sid === user._id.toString() || sid === user.id;
            const fileAbs = msg.fileUrl ? getFullImageUrl(msg.fileUrl) : null;

            return (
              <React.Fragment key={`wrapper-${msg._id}`}>
                {showDateDivider && (
                  <div className="flex justify-center my-3 sm:my-4 w-full">
                    <span className="bg-slate-200/50 text-slate-500 text-[9px] xs:text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                      {dateDividerText}
                    </span>
                  </div>
                )}
                <div
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
                    className={`relative max-w-[85%] px-3 py-1.5 xs:px-4 xs:py-2 shadow-sm transition-all duration-200 
                    ${isOwn
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-[1.2rem] rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-[1.2rem] rounded-tl-none border border-gray-100'
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
                            <span>{new Date(msg.callDetails?.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fin:</span>
                            <span>{new Date(msg.callDetails?.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
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
                        {msg.content && <p className="text-[12px] xs:text-[13px] sm:text-[15px] leading-snug break-words whitespace-pre-wrap font-medium">{msg.content}</p>}

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


                    <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] xs:text-[10px] ${isOwn ? 'text-indigo-100' : 'text-gray-400'}`}>
                      <span>{new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                      {msg.isEdited && <span>• editado</span>}
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
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 bg-white border-t z-20 pb-[calc(1rem+env(safe-area-inset-bottom))]">
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