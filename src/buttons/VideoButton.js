import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';

const VideoButton = () => {
    const navigate = useNavigate();

    const handleVideoClick = () => {
        navigate('/videos');
    };

    return (
        <button onClick={handleVideoClick} className="video-link">
            <FontAwesomeIcon icon={faVideo} />
        </button>
    );
};

export default VideoButton;

