import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { NotificationContext } from '../context/NotificationContext';

const NotificationButton = () => {
  const { unreadCount } = useContext(NotificationContext);
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/notifications')}
      className="gallery-link relative"
      aria-label={`Notificaciones (${unreadCount} sin leer)`}
    >
      <FontAwesomeIcon icon={faBell} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationButton;
