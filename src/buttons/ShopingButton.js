import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const ShopingButton = () => {
    const navigate = useNavigate();

    const handleShopClick = () => {
        navigate('/shop');
    };

    return (
        <button onClick={handleShopClick} className="shop-link">
            <FontAwesomeIcon icon={faShoppingCart} /> 
        </button>
    );
};

export default ShopingButton