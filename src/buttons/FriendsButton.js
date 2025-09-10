import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

const FriendsButton = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/friends');
    };

    return (
        <button onClick={handleClick} className="send-message-button">
            <FontAwesomeIcon icon={faUserPlus} /> 
        </button>
    );
};

export default FriendsButton;
