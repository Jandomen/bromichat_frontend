import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons'; 

const ProfileButton = () => {
    const navigate = useNavigate(); 

    const handleClick = () => {
        navigate('/profile'); 
    };

    return (
        <button className="profile-button" onClick={handleClick}>
            <FontAwesomeIcon icon={faUser} /> 
        </button>
    );
}

export default ProfileButton;
