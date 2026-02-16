import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { NotificationContext } from '../context/NotificationContext';

const NotificationButton = () => {
  const { unreadGeneralCount } = useContext(NotificationContext);
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/notifications')}
      className="relative flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-all active:scale-95"
      aria-label={`Notificaciones (${unreadGeneralCount} sin leer)`}
    >
      <FontAwesomeIcon
        icon={faBell}
        className={`text-xl transition-colors duration-300 ${unreadGeneralCount > 0
          ? 'text-white animate-swing'
          : 'text-gray-300'
          }`}
      />
      {unreadGeneralCount > 0 && (
        <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md ring-2 ring-red-900/50 z-20 animate-pulse">
          {unreadGeneralCount > 9 ? '9+' : unreadGeneralCount}
        </span>
      )}
    </button>
  );
};

export default NotificationButton;
