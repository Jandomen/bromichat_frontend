import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

const SettingsButton = () => {
    const navigate = useNavigate();

    const handleSettingsClick = () => {
        navigate('/settings');
    };

    return (
        <button onClick={handleSettingsClick} className="settings-link">
            <FontAwesomeIcon icon={faCog} /> 
        </button>
    );
};

export default SettingsButton
