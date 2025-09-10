import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons';

const DashboardButton = () => {
    const navigate = useNavigate(); 

    const handleClick = () => {
        navigate('/dashboard'); 
    };

    return (
        <button className="dashboard-button" onClick={handleClick}>
            <FontAwesomeIcon icon={faTachometerAlt} /> 
        </button>
    );
}

export default DashboardButton;

