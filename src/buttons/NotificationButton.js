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
      className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-transparent backdrop-blur-md hover:bg-white/10 transition-all border border-transparent hover:border-white/20 active:scale-95 shadow-sm"
      aria-label={`Notificaciones (${unreadGeneralCount} sin leer)`}
    >
      <FontAwesomeIcon
        icon={faBell}
        className={`text-xl transition-all duration-300 ${unreadGeneralCount > 0
          ? 'text-white animate-swing drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
          : 'text-white/70'
          }`}
      />
      {unreadGeneralCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-[10px] font-black text-white shadow-[0_0_10px_rgba(220,38,38,0.6)] ring-[1.5px] ring-black px-1 z-20 animate-pulse-slow">
          {unreadGeneralCount > 9 ? '9+' : unreadGeneralCount}
        </span>
      )}
    </button>
  );
};

export default NotificationButton;
