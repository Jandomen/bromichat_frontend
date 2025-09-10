import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImages } from '@fortawesome/free-solid-svg-icons';

const GaleryButton = () => {
    const navigate = useNavigate();

    const handleGalleryClick = () => {
        navigate('/gallery');
    };

    return (
        <button onClick={handleGalleryClick} className="gallery-link">
            <FontAwesomeIcon icon={faImages} /> 
        </button>
    );
};

export default GaleryButton
