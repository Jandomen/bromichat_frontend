import React, { useState, useEffect, useContext } from "react";
import { searchProducts } from "../../services/productService";
import { AuthContext } from "../../context/AuthContext";
import { getFullImageUrl } from "../../utils/getProfilePicture";
import SendMessageButton from "../../buttons/SendMessageButton";
import debounce from "lodash.debounce";
import { Search, Loader2, MessageCircle, X, Tag } from "lucide-react";

const ProductSearch = () => {
  const { token, user } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [lightboxProduct, setLightboxProduct] = useState(null);

  const categories = ["Todas", "Electrónica", "Moda", "Hogar", "Vehículos", "Mascotas", "Deportes", "Otros"];

  const debouncedSearch = debounce(async (term) => {
    if (!term.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await searchProducts(term, selectedCategory);
      setResults(res.filter((p) => p.user));
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, 500);

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, selectedCategory]);

  return (
    <div className="space-y-12 animate-slide-up">
      {/* Search Input Area */}
      <div className="relative group max-w-3xl mx-auto">
        <div className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
          {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Search className="w-8 h-8" />}
        </div>
        <input
          type="text"
          placeholder="¿Qué estás buscando hoy? Escribe aquí..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-20 pr-10 py-8 bg-white border-4 border-gray-50 focus:border-red-500/10 focus:bg-white rounded-[2.5rem] outline-none transition-all font-black text-gray-800 placeholder:text-gray-300 shadow-2xl shadow-gray-200/50 text-xl"
        />
      </div>

      {/* Category Selection for Search */}
      <div className="flex gap-3 overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar scroll-smooth justify-center">
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

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((product) => {
            const publisher = product.user;
            const currency = product.currency || "USD";
            return (
              <div
                key={product._id}
                className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 transform hover:-translate-y-2"
              >
                <div
                  className="relative aspect-[4/5] overflow-hidden cursor-pointer"
                  onClick={() => setLightboxProduct(product)}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-red-600 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-white">
                    {currency} {product.price}
                  </div>
                  {product.category && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white/80 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/10 opacity-0 group-hover:opacity-100 transition-all">
                      {product.category}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-black text-gray-900 text-lg mb-4 truncate leading-tight group-hover:text-red-600 transition-colors">
                    {product.title}
                  </h3>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <img
                        src={getFullImageUrl(publisher?.profilePicture)}
                        alt={publisher?.username}
                        className="w-10 h-10 rounded-2xl border-2 border-white object-cover shadow-sm"
                      />
                      <span className="text-xs font-black text-gray-900 leading-none">{publisher?.username}</span>
                    </div>

                    {publisher?._id !== user?._id && (
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
      ) : (
        query.trim() && !loading && (
          <div className="text-center py-24 bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100">
            <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Search className="w-10 h-10 text-gray-200" />
            </div>
            <p className="font-black text-gray-900 uppercase tracking-widest text-lg">Sin resultados para "{query}"</p>
            <p className="text-gray-400 text-sm font-bold mt-3 uppercase tracking-wide">Intenta con un término de búsqueda más general</p>
          </div>
        )
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
            <div className="lg:col-span-7 h-[350px] lg:h-[700px] bg-neutral-900 relative">
              <img
                src={lightboxProduct.imageUrl}
                alt={lightboxProduct.title}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-6 left-6">
                <div className="bg-red-600 text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl">
                  {lightboxProduct.currency} {lightboxProduct.price}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col h-full bg-white relative">
              <button
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors p-3 hover:bg-gray-100 rounded-2xl z-10"
                onClick={() => setLightboxProduct(null)}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="pt-4 flex-1 overflow-y-auto hide-scrollbar">
                <Tag className="w-6 h-6 text-red-500 mb-4" />
                <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">{lightboxProduct.title}</h2>

                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 mb-8">
                  <p className="text-gray-600 text-sm leading-relaxed font-medium">
                    {lightboxProduct.description || "Este artículo no cuenta con descripción pública."}
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-[2rem] border border-gray-100 mb-8 flex items-center gap-4 shadow-sm">
                  <img
                    src={getFullImageUrl(lightboxProduct.user?.profilePicture)}
                    alt={lightboxProduct.user?.username}
                    className="w-14 h-14 rounded-[1.2rem] border-4 border-white object-cover shadow-lg"
                  />
                  <div>
                    <p className="font-black text-gray-900 leading-none">{lightboxProduct.user?.username}</p>
                    <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-2 uppercase tracking-tighter">Vendedor Destacado</p>
                  </div>
                </div>
              </div>

              {lightboxProduct.user?._id !== user?._id && (
                <SendMessageButton
                  recipientId={lightboxProduct.user?._id}
                  className="w-full !bg-red-600 !text-white !py-5 !rounded-2xl !font-black !text-xs !uppercase !tracking-widest !shadow-2xl !shadow-red-200 hover:!bg-red-700 transition-all flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" /> Enviar Mensaje
                </SendMessageButton>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
