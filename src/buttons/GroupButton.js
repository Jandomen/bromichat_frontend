import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons'; 

const GroupButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/groups');
  };

  return (
    <button onClick={handleClick}>
      <FontAwesomeIcon icon={faUserGroup} /> 
    </button>
  );
};

export default GroupButton;
