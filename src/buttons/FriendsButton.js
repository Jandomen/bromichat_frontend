import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

const FriendsButton = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/friends');
    };

    return (
        <button onClick={handleClick} className="relative flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-all active:scale-95 text-gray-300 hover:text-white">
            <FontAwesomeIcon icon={faUserPlus} className="text-xl" />
        </button>
    );
};

export default FriendsButton;
