import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import api from "../../services/api";
import GroupChatInput from "./GroupChatInput";
import defaultProfile from "../../assets/default-profile.png";
import { getFullImageUrl } from "../../utils/getProfilePicture";

const GroupChat = ({ groupId }) => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
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
          profilePicture: u.profilePicture && u.profilePicture !== "/Uploads/undefined" ? u.profilePicture : defaultProfile,
        };
      });
      setUsers((prev) => ({ ...prev, ...map }));
    } catch (err) {
    //  console.error("Error fetching user details:", err);
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

  return (
    <div className="flex flex-col h-screen max-h-screen w-full md:w-[600px] mx-auto border rounded shadow bg-white">
      {group ? (
        <div className="flex items-center gap-3 p-4 border-b bg-gray-50 sticky top-0 z-10">
          <Link to={`/groups/${groupId}`} className="flex items-center gap-3 hover:bg-gray-100 p-1 rounded transition">
            <img src={group.groupImage ? getFullImageUrl(group.groupImage) : defaultProfile} alt={group.name} className="w-10 h-10 rounded-full object-cover" />
            <span className="font-semibold text-base sm:text-lg">{group.name}</span>
          </Link>
        </div>
      ) : (
        <div className="p-4 border-b text-red-500 text-sm bg-red-50 sticky top-0 z-10">❗ Loading group...</div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {hasMore && messages.length > 0 && <button onClick={() => fetchMessages(page + 1)} className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200">Load more messages</button>}
        {loading && messages.length === 0 ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : messages.map((msg) => {
          const { username, profilePicture } = getSenderInfo(msg.senderId);
          const isOwn = msg.senderId === user._id;
          const fileAbs = msg.fileUrl ? getFullImageUrl(msg.fileUrl) : null;

          return (
            <div key={msg._id} className={`mb-4 flex ${isOwn ? "justify-end" : "justify-start"} items-start relative`}>
              {!isOwn && <img src={profilePicture} alt={username} className="w-8 h-8 rounded-full mr-2 object-cover" />}
              <div className={`max-w-xs p-3 rounded-lg ${isOwn ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                {!isOwn && <p className="text-xs font-semibold mb-1">{username}</p>}
                {msg.content && <p>{msg.content}</p>}
                {fileAbs && (isImage(fileAbs) ? <img src={fileAbs} alt="File" className="max-w-xs rounded" /> : isVideo(fileAbs) ? <video src={fileAbs} controls className="max-w-xs rounded" /> : <a href={fileAbs} download className={isOwn ? "underline text-white" : "text-blue-700 underline"}>Download</a>)}
                <p className="text-xs opacity-70 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}{msg.isEdited && <span> (edited)</span>}</p>
              </div>
              {isOwn && <img src={profilePicture} alt={username} className="w-8 h-8 rounded-full ml-2 object-cover" />}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <GroupChatInput onSend={handleSend} />
    </div>
  );
};

export default GroupChat;
