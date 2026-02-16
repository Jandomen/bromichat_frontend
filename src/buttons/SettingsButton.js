import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

const SettingsButton = () => {
    const navigate = useNavigate();

    const handleSettingsClick = () => {
        navigate('/settings');
    };

    return (
        <button onClick={handleSettingsClick} className="relative flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-all active:scale-95 text-gray-300 hover:text-white">
            <FontAwesomeIcon icon={faCog} className="text-xl" />
        </button>
    );
};

export default SettingsButton
