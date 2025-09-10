import React, { useEffect, useState, useContext } from "react";
import { getRandomProducts } from "../../services/productService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import defaultProfile from "../../assets/default-profile.png";

const getFullImageUrl = (path) =>
  path ? `${process.env.REACT_APP_API_BACKEND}${path}` : defaultProfile;

const ProductFeedLightbox = () => {
  const { token, user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [lightboxProduct, setLightboxProduct] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await getRandomProducts(1, token);
      setProducts(res);
    } catch (err) {
     // console.error("Error al obtener feed:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStartChat = async (otherUserId) => {
    try {
      const payload = { participantIds: [user._id, otherUserId].sort(), isGroup: false };
      const res = await api.post("/conversation/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const convoId = res.data?._id || res.data?.conversation?._id || res.data?.id || null;
      if (!convoId) return console.error("No se pudo obtener el ID de la conversación");
      navigate(`/chat/${convoId}`);
    } catch (err) {
     //console.error("No se pudo iniciar la conversación", err);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => {
          const publisher = product.user;
          const currency = product.currency || "USD"; // Valor por defecto si no tiene
          return (
            <div key={product._id} className="border p-2 rounded">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-48 object-cover rounded cursor-pointer"
                onClick={() => setLightboxProduct(product)}
              />
              <p className="font-bold mt-2">{product.title}</p>
              <p>{currency} {product.price}</p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={getFullImageUrl(publisher.profilePicture)}
                    alt={publisher.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm">{publisher.username}</span>
                </div>

                {publisher._id !== user?._id && (
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
                    onClick={() => handleStartChat(publisher._id)}
                  >
                    Mensaje
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {lightboxProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setLightboxProduct(null)}
        >
          <div
            className="relative bg-white p-4 rounded max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxProduct.imageUrl}
              alt={lightboxProduct.title}
              className="w-full rounded mb-2"
            />
            <p className="mb-2 font-bold">{lightboxProduct.title}</p>
            <p className="mb-2">
              {lightboxProduct.currency || "USD"} {lightboxProduct.price}
            </p>
            <p className="mb-2 text-sm">Publicado por {lightboxProduct.user.username}</p>

            {lightboxProduct.user._id !== user?._id && (
              <button
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                onClick={() => handleStartChat(lightboxProduct.user._id)}
              >
                Mensaje
              </button>
            )}

            <button
              className="absolute top-2 right-2 text-white text-2xl font-bold"
              onClick={() => setLightboxProduct(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductFeedLightbox;
