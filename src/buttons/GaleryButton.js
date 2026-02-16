import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImages } from '@fortawesome/free-solid-svg-icons';

const GaleryButton = () => {
    const navigate = useNavigate();

    const handleGalleryClick = () => {
        navigate('/gallery');
    };

    return (
        <button onClick={handleGalleryClick} className="relative flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-all active:scale-95 text-gray-300 hover:text-white">
            <FontAwesomeIcon icon={faImages} className="text-xl" />
        </button>
    );
};

export default GaleryButton
