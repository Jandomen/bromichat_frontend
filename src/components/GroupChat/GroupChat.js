import { useEffect, useState, useContext, useRef } from 'react';
import { SocketContext } from '../../context/SocketContext';
import api from '../../services/api';
import GroupChatInput from './GroupChatInput';
import GroupMessage from './GroupMessage';

export default function GroupChat({ groupId }) {
  const { socket } = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/group/${groupId}`);
        const uniqueMessages = Array.from(
          new Map(res.data.map((m) => [m._id, m])).values()
        );
        setMessages(uniqueMessages);
      } catch (err) {
        //console.error('Error fetching group messages:', err);
      }
    };

    fetchMessages();
  }, [groupId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_group', { groupId });

    const handleNewMessage = (msg) => {
      if (msg.groupId !== groupId) return;
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const handleMessageUpdated = (updatedMessage) => {
      if (updatedMessage.groupId !== groupId) return;
      setMessages(prev => prev.map(msg => (msg._id === updatedMessage._id ? updatedMessage : msg)));
    };

    const handleMessageDeleted = ({ groupId: deletedGroupId, messageId }) => {
      if (deletedGroupId !== groupId) return;
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    };

    const handleMemberLeft = ({ groupId: leftGroupId, userId, message }) => {
      if (leftGroupId !== groupId) return;
      //console.log(message);
    };

    socket.on('newGroupMessage', handleNewMessage);
    socket.on('groupMessageUpdated', handleMessageUpdated);
    socket.on('groupMessageDeleted', handleMessageDeleted);
    socket.on('groupMemberLeft', handleMemberLeft);

    return () => {
      socket.off('newGroupMessage', handleNewMessage);
      socket.off('groupMessageUpdated', handleMessageUpdated);
      socket.off('groupMessageDeleted', handleMessageDeleted);
      socket.off('groupMemberLeft', handleMemberLeft);
      socket.emit('leave_group', { groupId });
    };
  }, [groupId, socket]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = async ({ content, file }) => {
    if (!content.trim() && !file) return;

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('groupId', groupId);
      if (file) formData.append('file', file);

      await api.post('/messages/group', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
     // console.error('Error sending group message:', err);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded p-2">
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map(msg => (
          <GroupMessage key={msg._id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <GroupChatInput onSend={handleSend} />
    </div>
  );
}
