import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';

const VideoButton = () => {
    const navigate = useNavigate();

    const handleVideoClick = () => {
        navigate('/videos');
    };

    return (
        <button onClick={handleVideoClick} className="relative flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-all active:scale-95 text-gray-300 hover:text-white">
            <FontAwesomeIcon icon={faVideo} className="text-xl" />
        </button>
    );
};

export default VideoButton;

