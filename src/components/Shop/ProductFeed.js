import React, { useEffect, useState, useContext } from "react";
import { getRandomProducts } from "../../services/productService";
import { AuthContext } from "../../context/AuthContext";
import { getFullImageUrl } from "../../utils/getProfilePicture";
import SendMessageButton from "../../buttons/SendMessageButton";
import { MessageCircle, X, MapPin, ShieldCheck, Tag, ShoppingBag } from "lucide-react";

const ProductFeed = () => {
  const { token, user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [lightboxProduct, setLightboxProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [loading, setLoading] = useState(false);

  const categories = ["Todas", "Electrónica", "Moda", "Hogar", "Vehículos", "Mascotas", "Deportes", "Otros"];

  const fetchProducts = React.useCallback(async (cat = selectedCategory) => {
    setLoading(true);
    try {
      const res = await getRandomProducts(1, token, cat);
      setProducts(res);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [token, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-10">
      {/* Category Filter Bar */}
      <div className="flex gap-3 overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar scroll-smooth">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`
              whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
              ${selectedCategory === cat
                ? 'bg-red-600 text-white shadow-xl shadow-red-200 scale-105'
                : 'bg-white text-gray-400 hover:text-gray-900 border border-gray-100 hover:border-red-100'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && !products.length ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="w-16 h-16 bg-gray-100 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-100 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-32"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
          <div className="bg-white p-6 rounded-full shadow-inner mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-200" />
          </div>
          <p className="font-black text-gray-400 uppercase tracking-widest text-xs">No hay productos en esta categoría</p>
          <button
            onClick={() => setSelectedCategory("Todas")}
            className="mt-6 text-red-600 font-black text-[10px] uppercase tracking-widest hover:underline"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
          {products.map((product) => {
            const publisher = product.user;
            const currency = product.currency || "USD";
            return (
              <div
                key={product._id}
                className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Image Container */}
                <div
                  className="relative aspect-[4/5] overflow-hidden cursor-pointer"
                  onClick={() => setLightboxProduct(product)}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                    <div className="bg-white/20 backdrop-blur-xl px-6 py-2 rounded-full text-white font-bold text-xs uppercase tracking-widest border border-white/30">
                      Ver Detalles
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-red-600 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-white">
                    {currency} {product.price}
                  </div>
                  {product.category && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white/80 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/10 opacity-0 group-hover:opacity-100 transition-all">
                      {product.category}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6">
                  <h3 className="font-black text-gray-900 text-lg mb-1 truncate leading-tight group-hover:text-red-600 transition-colors">
                    {product.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-3 h-3 text-red-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">En venta</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={getFullImageUrl(publisher.profilePicture)}
                          alt={publisher.username}
                          className="w-10 h-10 rounded-2xl border-2 border-white object-cover shadow-sm"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900 leading-none">{publisher.username}</span>
                        <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Vendedor</span>
                      </div>
                    </div>

                    {publisher._id !== user?._id && (
                      <SendMessageButton
                        recipientId={publisher._id}
                        className="!p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all transform hover:rotate-12 active:scale-95"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </SendMessageButton>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Premium Lightbox */}
      {lightboxProduct && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-4 lg:p-8 animate-fade-in"
          onClick={() => setLightboxProduct(null)}
        >
          <div
            className="relative bg-white rounded-[2.5rem] overflow-hidden max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left side: Image (Col 7) */}
            <div className="lg:col-span-7 h-[350px] lg:h-[700px] bg-gray-50 relative group">
              <img
                src={lightboxProduct.imageUrl}
                alt={lightboxProduct.title}
                className="w-full h-full object-cover lg:object-contain bg-neutral-900"
              />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <div className="bg-red-600 text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl">
                  {lightboxProduct.currency || "USD"} {lightboxProduct.price}
                </div>
              </div>
            </div>

            {/* Right side: Info (Col 5) */}
            <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col h-full bg-white relative">
              <button
                className="self-end text-gray-400 hover:text-gray-900 transition-colors p-3 hover:bg-gray-100 rounded-2xl absolute top-6 right-6 z-10"
                onClick={() => setLightboxProduct(null)}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="pt-4 flex-1 overflow-y-auto hide-scrollbar">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
                    Artículo Original
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" /> Verificado
                  </div>
                </div>

                <h2 className="text-4xl font-black text-gray-900 mb-4 leading-tight">{lightboxProduct.title}</h2>

                <div className="flex items-center gap-2 mb-8 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Venta Global</span>
                </div>

                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 mb-10">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Descripción del producto</h4>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {lightboxProduct.description || "El vendedor no ha proporcionado una descripción detallada para este artículo."}
                  </p>
                </div>

                {/* Seller Profile Card */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-[2rem] border border-gray-100 mb-10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <img
                      src={getFullImageUrl(lightboxProduct.user.profilePicture)}
                      alt={lightboxProduct.user.username}
                      className="w-16 h-16 rounded-[1.5rem] border-4 border-white object-cover shadow-lg"
                    />
                    <div>
                      <p className="font-black text-gray-900 text-lg leading-none">{lightboxProduct.user.username}</p>
                      <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-2 bg-red-50 px-2 py-0.5 rounded-lg inline-block">HormiVendedor</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase/Message Actions */}
              <div className="flex gap-4 mt-8">
                {lightboxProduct.user._id !== user?._id ? (
                  <SendMessageButton
                    recipientId={lightboxProduct.user._id}
                    className="flex-1 !bg-red-600 !text-white !py-5 !rounded-2xl !font-black !text-xs !uppercase !tracking-widest !shadow-[0_20px_50px_-15px_rgba(220,38,38,0.5)] hover:!bg-red-700 hover:!-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <MessageCircle className="w-5 h-5 font-bold" /> Contactar al Vendedor
                  </SendMessageButton>
                ) : (
                  <div className="w-full py-5 text-center bg-gray-100 rounded-2xl text-gray-400 font-black text-xs uppercase tracking-widest border-2 border-dashed border-gray-200">
                    Gestionas esta publicación
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFeed;
