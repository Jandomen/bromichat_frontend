import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import api from "../../services/api";
import GroupChatInput from "./GroupChatInput";
import { CallContext } from "../../context/CallContext";
import { Video, ChevronLeft } from "lucide-react";
import defaultProfile from "../../assets/default-profile.png";
import { getFullImageUrl } from "../../utils/getProfilePicture";

const GroupChat = ({ groupId, onBack }) => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const { ongoingCalls, callGroup, isWaitingAdmission, requestAdmission } = useContext(CallContext);
  const [messages, setMessages] = useState([]);
  const [group, setGroup] = useState(null);
  const [users, setUsers] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [lastSentMessageId, setLastSentMessageId] = useState(null);
  const messagesEndRef = useRef(null);

  const isImage = (url) => /\.(png|jpe?g|gif|webp|avif)$/i.test(url);
  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);
  const scrollToEnd = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const fetchUserDetails = useCallback(async (ids) => {
    try {
      const uniqueIds = [...new Set(ids)].filter((id) => typeof id === "string");
      if (!uniqueIds.length) return;
      const results = await Promise.all(
        uniqueIds.map((id) =>
          api.get(`/user/profile/${id}`).catch(() => ({
            data: { _id: id, username: "Unknown", profilePicture: defaultProfile },
          }))
        )
      );
      const map = {};
      uniqueIds.forEach((id, i) => {
        const u = results[i].data;
        map[id] = {
          _id: id,
          username: u.username || "Unknown",
          profilePicture: u.profilePicture && u.profilePicture !== "/Uploads/undefined" ? u.profilePicture : "",
        };
      });
      setUsers((prev) => ({ ...prev, ...map }));
    } catch (err) {

      setError("Error al cargar los detalles de los usuarios");
    }
  }, []);

  const fetchGroupDetails = useCallback(async () => {
    try {
      const res = await api.get(`/group/${groupId}`);
      setGroup(res.data.group);
      const participantIds = (res.data.group.participants || [])
        .map((p) => (typeof p === "string" ? p : p?._id))
        .filter(Boolean);
      if (participantIds.length) await fetchUserDetails(participantIds);
    } catch (err) {
      //  console.error("Error fetching group details:", err);
      setError("Error al cargar los detalles del grupo");
    }
  }, [groupId, fetchUserDetails]);

  const fetchMessages = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/messages/group/${groupId}?page=${pageNum}&limit=20`);
      const newMessages = Array.isArray(res.data.messages) ? res.data.messages.map((msg) => ({
        ...msg,
        senderId: typeof msg.senderId === "object" && msg.senderId?._id ? msg.senderId._id : msg.senderId,
      })) : [];
      setMessages((prev) => {
        const uniqueMessages = (pageNum === 1 ? newMessages : [...newMessages, ...prev]).filter(
          (msg, idx, self) => msg._id && self.findIndex((m) => m._id === msg._id) === idx
        );
        return uniqueMessages;
      });
      setHasMore(newMessages.length === 20);
      setPage(pageNum);
      const senderIds = newMessages.map((msg) => msg.senderId).filter((id) => id && !users[id]);
      if (senderIds.length) await fetchUserDetails(senderIds);
    } catch (err) {
      //  console.error("Error fetching messages:", err);
      setError("Error al cargar los mensajes");
    } finally {
      setLoading(false);
    }
  }, [groupId, users, fetchUserDetails]);

  useEffect(() => {
    if (!groupId) return;
    fetchGroupDetails();
    fetchMessages();
  }, [groupId, fetchGroupDetails, fetchMessages]);

  useEffect(() => {
    if (!socket || !user?._id || !groupId) return;

    socket.emit("join_group", { groupId, userId: user._id });

    const handleIncoming = (data) => {
      if (!data?.message?._id || data.conversationId !== groupId) return;
      if (data.message._id === lastSentMessageId) return;

      const normalized = { ...data.message, senderId: typeof data.message.senderId === "object" ? data.message.senderId._id : data.message.senderId };
      setMessages((prev) => (prev.some((msg) => msg._id === normalized._id) ? prev : [...prev, normalized]));
      if (normalized.senderId && !users[normalized.senderId]) fetchUserDetails([normalized.senderId]);
    };

    socket.on("newGroupMessage", handleIncoming);

    return () => {
      socket.off("newGroupMessage", handleIncoming);
      socket.emit("leave_group", { groupId });
    };
  }, [socket, groupId, user._id, lastSentMessageId, users, fetchUserDetails]);

  useEffect(() => scrollToEnd(), [messages]);

  const handleSend = async ({ content, file }) => {
    if (!content.trim() && !file) {
      setError("Type a message or attach a file");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("content", content);
      formData.append("conversationId", groupId);
      if (file) formData.append("file", file);

      const res = await api.post("/messages/group", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const newMessage = { ...res.data.message, senderId: typeof res.data.message.senderId === "object" ? res.data.message.senderId._id : res.data.message.senderId };

      setMessages((prev) => (prev.some((msg) => msg._id === newMessage._id) ? prev : [...prev, newMessage]));
      setLastSentMessageId(newMessage._id);
      scrollToEnd();
      if (newMessage.senderId && !users[newMessage.senderId]) fetchUserDetails([newMessage.senderId]);
    } catch (err) {
      //  console.error("Error sending message:", err);
      setError(err.response?.data?.error || "Error al enviar el mensaje");
    } finally {
      setLoading(false);
    }
  };

  const getSenderInfo = useCallback((senderId) => {
    const id = typeof senderId === "string" ? senderId : senderId?._id;
    const u = users[id] || {};
    return { username: u.username || "Unknown", profilePicture: u.profilePicture ? getFullImageUrl(u.profilePicture) : defaultProfile };
  }, [users]);

  const getDownloadUrl = (url) => {
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

  return (
    <div className="flex flex-col h-full w-full bg-[#f0f2f5] overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')" }}></div>

      {group ? (
        <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-md border-b sticky top-0 z-20 shadow-sm">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden w-12 h-12 -ml-3 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              <ChevronLeft size={28} />
            </button>
          )}
          <Link to={group.chatType === 'community' ? `/groups/${groupId}` : `/chat/group-settings/${groupId}`} className="flex items-center gap-3 transition hover:opacity-80">
            <div className="relative">
              <img
                src={group.groupImage ? getFullImageUrl(group.groupImage) : defaultProfile}
                alt={group.name}
                className="w-11 h-11 rounded-full object-cover shadow-sm border-2 border-white"
                onError={(e) => { e.target.src = defaultProfile; }}
              />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-lg leading-tight">{group.name}</span>
              <span className="text-xs text-indigo-500 font-medium">{group.participants?.length || 0} members</span>
            </div>
          </Link>

          {/* Join ongoing call button */}
          {ongoingCalls[groupId] && (
            <div className="ml-auto flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold animate-pulse shadow-sm">
                  LIVE
                </div>
              </div>
              <button
                onClick={() => callGroup(groupId, group.name, group.groupImage, group.participants)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
              >
                <Video size={14} />
                <span>Unirse</span>
              </button>
            </div>
          )}

          <div className={`${ongoingCalls[groupId] ? '' : 'ml-auto'} flex items-center gap-2`}>
            <button
              onClick={() => callGroup(groupId, group.name, group.groupImage, group.participants)}
              className={`p-2.5 rounded-full transition-all ${ongoingCalls[groupId] ? 'hidden' : 'bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600'}`}
              title="Iniciar videollamada"
            >
              <Video size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b text-center bg-gray-50 sticky top-0 z-10 animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mx-auto"></div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2 z-10 custom-scrollbar">
        {hasMore && messages.length > 0 && (
          <button onClick={() => fetchMessages(page + 1)} className="w-full py-2 text-sm text-indigo-500 hover:bg-indigo-50 rounded-lg transition mb-2">
            Cargar mensajes anteriores
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
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
            <div className="text-6xl mb-4">📢</div>
            <p>¡No hay mensajes aún! ¡Inicia la conversación!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const { username, profilePicture } = getSenderInfo(msg.senderId);
            const isOwn = msg.senderId === user._id;
            const fileAbs = msg.fileUrl ? getFullImageUrl(msg.fileUrl) : null;

            return (
              <div key={msg._id} className={`flex w-full ${isOwn ? "justify-end" : "justify-start"} group mb-1`}>
                {!isOwn && (
                  <img src={profilePicture} alt={username} className="w-8 h-8 rounded-full mr-2 self-end mb-1 shadow-sm object-cover" />
                )}

                <div
                  className={`relative max-w-[75%] px-4 py-2 shadow-sm transition-all duration-200 
                    ${isOwn
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100'
                    }`}
                >
                  {!isOwn && <p className="text-[10px] font-bold text-indigo-500 mb-1 opacity-80 uppercase tracking-wide">{username}</p>}

                  {msg.content && <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>}

                  {fileAbs && (
                    <div className="mt-2 rounded-lg overflow-hidden bg-black/5">
                      {isImage(fileAbs) ? (
                        <img src={fileAbs} alt="Attachment" className="max-w-full max-h-[300px] object-contain cursor-pointer hover:opacity-95 transition" />
                      ) : isVideo(fileAbs) ? (
                        <video src={fileAbs} controls className="max-w-full max-h-[300px]" />
                      ) : (
                        <a
                          href={getDownloadUrl(fileAbs)}
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

                  <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isOwn ? 'text-indigo-100' : 'text-gray-400'}`}>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.isEdited && <span>• edited</span>}
                  </div>
                </div>

                {isOwn && (
                  <img src={profilePicture} alt={username} className="w-8 h-8 rounded-full ml-2 self-end mb-1 shadow-sm object-cover" />
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t z-20">
        <GroupChatInput onSend={handleSend} />
      </div>
    </div>
  );
};

export default GroupChat;
