import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="relative flex items-center justify-center p-2 rounded-full bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-lg border border-red-600/30"
      title="Cerrar sesión"
    >
      <FontAwesomeIcon icon={faPowerOff} className="text-xl" />
    </button>
  );
};

export default LogoutButton;
