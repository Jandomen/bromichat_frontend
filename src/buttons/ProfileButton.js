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
        <button onClick={handleClick} className="relative flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-all active:scale-95 text-gray-300 hover:text-white">
            <FontAwesomeIcon icon={faUser} className="text-xl" />
        </button>
    );
}

export default ProfileButton;
