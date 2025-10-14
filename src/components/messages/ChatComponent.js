import React, { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';
import ChatInput from '../GroupChat/GroupChatInput';

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const endRef = useRef(null);

  const isImage = (url) => /\.(png|jpe?g|gif|webp|avif)$/i.test(url);
  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);
  const scrollToEnd = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  const setMessagesWithDebug = (newMessages, source) => {
   // console.log(`Setting messages from ${source}:`, newMessages);
    if (!Array.isArray(newMessages)) {
     // console.error(`Invalid messages from ${source}:`, newMessages);
      setError(`Error: Invalid message data from ${source}`);
      setMessages([]);
      return;
    }
    setMessages(newMessages);
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
        setParticipants(conv.participants || conv.members || []);
        setGroupName(conv.name || 'Grupo sin nombre');
        const msgRes = await api.get(`/messages/conversation/${conversationId}?page=1&limit=20`);
       // console.log('Messages API Response:', msgRes.data);
        const messages = Array.isArray(msgRes.data.messages) ? msgRes.data.messages : [];
        setMessagesWithDebug(messages, 'fetchData');
        setHasMore(messages.length === 20);
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
    try {
      const msgRes = await api.get(`/messages/conversation/${conversationId}?page=${page + 1}&limit=20`);
     // console.log('Load More Messages API Response:', msgRes.data);
      const newMessages = Array.isArray(msgRes.data.messages) ? msgRes.data.messages : [];
      if (newMessages.length === 0) {
        setHasMore(false);
        return;
      }
      setMessagesWithDebug((prev) => [...newMessages, ...prev], 'loadMoreMessages');
      setPage(page + 1);
    } catch (err) {
      setError('Error loading more messages');
     // console.error('Error loading more messages:', err);
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

  useEffect(() => {
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

      const endpoint = isGroup ? '/messages/group' : '/messages/send';
      const res = await api.post(endpoint, formData, {
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

  const recipientInfo = useMemo(() => {
    if (isGroup) {
      return { username: groupName, profilePicture: defaultProfile, id: null };
    }
    const recipient = participants.find((p) => (typeof p === 'string' ? p : p?._id) !== user._id);
    if (!recipient) {
      return { username: 'User', profilePicture: defaultProfile, id: null };
    }
    const userInfo = getUserInfo(recipient);
    return { ...userInfo, id: typeof recipient === 'string' ? recipient : recipient._id };
  }, [isGroup, groupName, participants, users, user._id]);

  return (
    <div className="flex flex-col h-screen max-h-screen w-full md:w-[600px] mx-auto border rounded shadow bg-white">
      {recipientInfo.username && recipientInfo.username !== 'User' ? (
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
                  e.target.src = defaultProfile;
                }}
              />
              <span className="font-semibold text-base sm:text-lg">{recipientInfo.username}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <img
                src={recipientInfo.profilePicture}
                alt={recipientInfo.username}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = defaultProfile;
                }}
              />
              <span className="font-semibold text-base sm:text-lg">{recipientInfo.username}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 border-b text-red-500 text-sm bg-red-50 sticky top-0 z-10">
          ❗ Loading recipient...
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {hasMore && messages.length > 0 && (
          <button
            onClick={loadMoreMessages}
            className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Load more messages
          </button>
        )}
        {loading && messages.length === 0 ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : !Array.isArray(messages) ? (
          <p className="text-center text-red-500">Error: Invalid messages. Please reload the page.</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : (
          messages.map((msg) => {
            const sid = typeof msg.senderId === 'string' ? msg.senderId : msg.senderId?._id;
            const { username, profilePicture } = getUserInfo(sid);
            const isOwn = sid === user._id;
            const fileAbs = msg.fileUrl ? getFullImageUrl(msg.fileUrl) : null;

            return (
              <div
                key={msg._id}
                className={`mb-4 flex ${isOwn ? 'justify-end' : 'justify-start'} items-start relative`}
              >
                {!isOwn && (
                  <img
                    src={profilePicture}
                    alt={username}
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                    onError={(e) => {
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
                        placeholder="Edit message..."
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEditMessage(msg._id)}
                          className="text-sm text-green-500"
                          disabled={loading}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingMessageId(null);
                            setEditContent('');
                          }}
                          className="text-sm text-red-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {msg.content && <p>{msg.content}</p>}
                      {fileAbs && (
                        <div className="mt-2">
                          {msg.fileType === 'image' ? (
                            <img src={fileAbs} alt="File" className="max-w-xs rounded" />
                          ) : msg.fileType === 'video' ? (
                            <video className="max-w-xs rounded" src={fileAbs} controls />
                          ) : (
                            <a
                              href={fileAbs}
                              download
                              className={isOwn ? 'underline text-white' : 'text-blue-700 underline'}
                            >
                              Download {fileAbs.split('/').pop()}
                            </a>
                          )}
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                        {msg.isEdited && <span> (edited)</span>}
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
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                        >
                          Delete
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

      {loading && (
        <div className="p-2 bg-gray-100 text-gray-700 text-center rounded">Sending...</div>
      )}
      {error && (
        <div className="p-2 bg-red-100 text-red-700 text-center rounded">{error}</div>
      )}
      <ChatInput onSend={handleSendMessage} conversationId={conversationId} />
    </div>
  );
};

export default ChatComponent;