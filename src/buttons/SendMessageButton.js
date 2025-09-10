import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const SendMessageButton = ({ recipientId, notificationCount = 0, onClick }) => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const handleClick = async () => {
    if (onClick) onClick();

    if (!recipientId) {
      navigate('/messages');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BACKEND}/conversation/create`,
        { recipientId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.conversationId) {
        navigate(`/messages/${response.data.conversationId}`);
      } else {
       // console.warn('Conversación creada pero sin ID, navegando al chat del usuario');
        navigate(`/messages/${recipientId}`);
      }
    } catch (error) {
     // console.error('Error al crear conversación:', error.response?.data || error.message);
      navigate(`/messages/${recipientId}`);
    }
  };

  return (
    <button
      className={`send-message-button ${notificationCount > 0 ? 'notify' : ''}`}
      onClick={handleClick}
    >
      <FontAwesomeIcon icon={faEnvelope} />
      {notificationCount > 0 && (
        <span className="notification-count">{notificationCount}</span>
      )}
    </button>
  );
};

export default SendMessageButton;
