import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { getUserProducts, updateProduct, deleteProduct } from "../../services/productService";

import { Edit3, Trash2, X, Tag, IndianRupee, Banknote, FileText, PackageSearch } from "lucide-react";

const MyProducts = () => {
  const { user, token, loadingUser } = useContext(AuthContext);
  const { showConfirm, showToast } = useUI();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCurrency, setNewCurrency] = useState("USD");

  const fetchProducts = React.useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await getUserProducts(user._id, token);
      setProducts(res.filter(p => p.user));
    } catch (err) {
      // console.error("Error al obtener productos:", err);
    }
  }, [user, token]);

  useEffect(() => {
    if (!loadingUser) fetchProducts();
  }, [loadingUser, fetchProducts]);

  if (loadingUser) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <PackageSearch className="w-12 h-12 text-gray-200 mb-4" />
      <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Cargando tu inventario...</p>
    </div>
  );

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        title: newTitle || editingProduct.title,
        description: newDescription || editingProduct.description,
        price: newPrice || editingProduct.price,
        currency: newCurrency || editingProduct.currency || "USD",
      };

      const res = await updateProduct(editingProduct._id, updatedData, token);
      setProducts(products.map(p => (p._id === editingProduct._id ? res : p)));

      setEditingProduct(null);
      showToast('Producto actualizado 🔥', 'success');
    } catch (err) {
      showToast('Error al actualizar', 'error');
    }
  };

  const handleDelete = async (productId) => {
    showConfirm(
      'Eliminar producto',
      '¿Estás seguro de que quieres retirar este producto de la tienda? Esta acción no se puede deshacer.',
      async () => {
        try {
          await deleteProduct(productId, token);
          setProducts(products.filter(p => p._id !== productId));
          showToast('Producto eliminado', 'success');
        } catch (err) {
          showToast('Error al eliminar producto', 'error');
        }
      }
    );
  };

  return (
    <div className="animate-slide-up">
      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100">
          <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <PackageSearch className="w-10 h-10 text-gray-200" />
          </div>
          <p className="font-black text-gray-900 uppercase tracking-widest text-lg">Tu inventario está vacío</p>
          <p className="text-gray-400 text-sm font-bold mt-3 uppercase tracking-wide">¡Empieza a vender hoy mismo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product._id} className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setNewTitle(product.title);
                      setNewDescription(product.description);
                      setNewPrice(product.price);
                      setNewCurrency(product.currency || "USD");
                    }}
                    className="p-3 bg-white/90 backdrop-blur-md text-gray-800 rounded-2xl shadow-xl hover:bg-white transition-all transform hover:scale-110 active:scale-95"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-3 bg-red-600/90 backdrop-blur-md text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all transform hover:scale-110 active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-red-600 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-white">
                  {product.currency || "USD"} {product.price}
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-black text-gray-900 text-lg mb-2 truncate leading-tight">{product.title}</h3>
                <p className="text-gray-400 text-xs font-medium line-clamp-2 min-h-[32px]">{product.description || "Sin descripción."}</p>

                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <IndianRupee className="w-3 h-3" /> Publicado por ti
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern Editor Modal */}
      {editingProduct && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 lg:p-8 animate-fade-in"
          onClick={() => setEditingProduct(null)}
        >
          <div
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 lg:p-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">Editar Producto</h3>
                  <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-1">Actualiza los detalles de tu oferta</p>
                </div>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleEdit} className="space-y-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Título</label>
                  <div className="relative group">
                    <Tag className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-red-500 transition-colors" />
                    <input
                      type="text"
                      className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-xl sm:rounded-2xl outline-none transition-all font-bold text-gray-800 text-[10px] sm:text-xs"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción</label>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-300 group-focus-within:text-red-500 transition-colors" />
                    <textarea
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 min-h-[120px] resize-none"
                      value={newDescription}
                      onChange={e => setNewDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio</label>
                    <div className="relative group">
                      <Banknote className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-red-500 transition-colors" />
                      <input
                        type="number"
                        className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-xl sm:rounded-2xl outline-none transition-all font-bold text-gray-800 text-[10px] sm:text-xs"
                        value={newPrice}
                        onChange={e => setNewPrice(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Moneda</label>
                    <select
                      value={newCurrency}
                      onChange={e => setNewCurrency(e.target.value)}
                      className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-xl sm:rounded-2xl outline-none transition-all font-black text-gray-800 text-[10px] sm:text-xs cursor-pointer shadow-sm"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="MXN">MXN</option>
                      <option value="COP">COP</option>
                      <option value="ARS">ARS</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                    onClick={() => setEditingProduct(null)}
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 hover:-translate-y-1 transition-all"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
