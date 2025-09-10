import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

const UserButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/user'); 
  };

  return (
    <button
      onClick={handleClick}
    >
      <FontAwesomeIcon icon={faUsers} /> 
    </button>
  );
};

export default UserButton;
