import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import api from '../../services/api';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';


const GroupMessage = ({ message }) => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const isImage = (url) => /\.(png|jpe?g|gif|webp|avif)$/i.test(url);
  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);
  const fileAbs = message.file ? getFullImageUrl(message.file) : null;

  const handleEditMessage = async (messageId) => {
    if (!editContent.trim()) {
      //console.error('El mensaje no puede estar vacío');
      return;
    }
    try {
      const res = await api.put(`/messages/edit/${messageId}`, { content: editContent });
      socket.emit('groupMessageUpdated', res.data.updatedMessage);
      setEditingMessageId(null);
      setEditContent('');
      setMenuOpen(false);
    } catch (err) {
      //console.error('Error editing message:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/delete/${messageId}`);
      socket.emit('groupMessageDeleted', { groupId: message.groupId, messageId });
      setMenuOpen(false);
    } catch (err) {
      //console.error('Error deleting message:', err);
    }
  };

  const isOwn = message.sender?._id === user._id;

  return (
    <>
   
    <div className={`mb-4 flex ${isOwn ? 'justify-end' : 'justify-start'} items-start relative`}>
      {!isOwn && (
        <img
          src={message.sender?.profilePicture ? getFullImageUrl(message.sender.profilePicture) : defaultProfile}
          alt={message.sender?.username || 'Usuario'}
          className="w-8 h-8 rounded-full mr-2 object-cover"
          onError={(e) => {
            //console.error('Error loading profile picture:', e.target.src);
            e.target.src = defaultProfile;
          }}
        />
      )}

      <div className={`max-w-xs p-3 rounded-lg ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
        {!isOwn && <p className="text-xs font-semibold mb-1">{message.sender?.username || 'Usuario'}</p>}
        {editingMessageId === message._id ? (
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
                onClick={() => handleEditMessage(message._id)}
                className="text-sm text-green-500"
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
            {message.content && <p>{message.content}</p>}
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
              {new Date(message.createdAt).toLocaleTimeString()}
              {message.isEdited && <span> (editado)</span>}
            </p>
          </>
        )}
      </div>

      {isOwn && editingMessageId !== message._id && (
        <div className="relative ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              //console.log(`Toggling menu for message ${message._id}, current menuOpen: ${menuOpen}`);
              setMenuOpen(!menuOpen);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-20">
              <button
                onClick={() => {
                  setEditingMessageId(message._id);
                  setEditContent(message.content || '');
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteMessage(message._id)}
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
          src={message.sender?.profilePicture ? getFullImageUrl(message.sender.profilePicture) : defaultProfile}
          alt={message.sender?.username || 'Usuario'}
          className="w-8 h-8 rounded-full ml-2 object-cover"
          onError={(e) => {
            //console.error('Error loading profile picture:', e.target.src);
            e.target.src = defaultProfile;
          }}
        />
      )}
    </div>
    </>
  );
};

export default GroupMessage;