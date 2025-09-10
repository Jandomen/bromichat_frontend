import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getUserProducts, updateProduct, deleteProduct } from "../../services/productService";

const MyProducts = () => {
  const { user, token, loadingUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [lightboxProduct, setLightboxProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCurrency, setNewCurrency] = useState("USD");

  // Fetch products del usuario
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?._id) return;
      try {
        const res = await getUserProducts(user._id, token);
        // Filtra productos que tengan usuario
        setProducts(res.filter(p => p.user));
      } catch (err) {
       // console.error("❌ Error al obtener productos:", err);
      }
    };
    if (!loadingUser) fetchProducts();
  }, [user, token, loadingUser]);

  if (loadingUser) return <p>Cargando productos...</p>;

  // Editar producto
  const handleEdit = async (product) => {
    try {
      const updatedData = {
        title: newTitle || product.title,
        description: newDescription || product.description,
        price: newPrice || product.price,
        currency: newCurrency || product.currency || "USD",
      };

      const res = await updateProduct(product._id, updatedData, token);
      // Actualiza la lista con el producto editado
      setProducts(products.map(p => (p._id === product._id ? res : p)));

      setEditingProduct(null);
      setNewTitle("");
      setNewDescription("");
      setNewPrice("");
      setNewCurrency("USD");
    } catch (err) {
     // console.error("❌ Error al actualizar producto:", err);
    }
  };

  // Eliminar producto
  const handleDelete = async (productId) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      await deleteProduct(productId, token);
      setProducts(products.filter(p => p._id !== productId));
      setLightboxProduct(null);
    } catch (err) {
     // console.error("❌ Error al eliminar producto:", err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Mis Productos</h2>
      {products.length === 0 && <p>No tienes productos aún.</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product._id} className="border p-2 rounded relative">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-48 object-cover rounded cursor-pointer"
              onClick={() => setLightboxProduct(product)}
            />
            <p className="font-bold mt-2">{product.title}</p>
            <p className="text-sm text-gray-700">{product.description}</p>
            <p>{product.currency || "USD"} {product.price}</p>

            {product.user?._id === user?._id && (
              <div className="absolute top-2 right-2">
                <button
                  className="text-gray-700 bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  onClick={() => {
                    setEditingProduct(product);
                    setNewTitle(product.title);
                    setNewDescription(product.description);
                    setNewPrice(product.price);
                    setNewCurrency(product.currency || "USD");
                  }}
                >
                  ⋮
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setLightboxProduct(null)}
        >
          <div
            className="relative bg-white p-4 rounded max-w-3xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={lightboxProduct.imageUrl}
              alt={lightboxProduct.title}
              className="w-full rounded mb-2"
            />
            <p className="font-bold mb-1">{lightboxProduct.title}</p>
            <p className="mb-2">{lightboxProduct.description}</p>
            <p className="mb-2">{lightboxProduct.currency || "USD"} {lightboxProduct.price}</p>

            {lightboxProduct.user?._id === user?._id && (
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => {
                    setEditingProduct(lightboxProduct);
                    setNewTitle(lightboxProduct.title);
                    setNewDescription(lightboxProduct.description);
                    setNewPrice(lightboxProduct.price);
                    setNewCurrency(lightboxProduct.currency || "USD");
                  }}
                >
                  Editar
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => handleDelete(lightboxProduct._id)}
                >
                  Eliminar
                </button>
              </div>
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

      {/* Editor */}
      {editingProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setEditingProduct(null)}
        >
          <div
            className="bg-white p-4 rounded w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">Editar Producto</h3>
            <input
              type="text"
              placeholder="Título"
              className="border p-2 w-full mb-2 rounded"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <textarea
              placeholder="Descripción"
              className="border p-2 w-full mb-2 rounded"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
            />
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                placeholder="Precio"
                className="border p-2 w-full rounded"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
              />
              <select
                value={newCurrency}
                onChange={e => setNewCurrency(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="MXN">MXN (₱)</option>
                <option value="COP">COP ($)</option>
                <option value="ARS">ARS ($)</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => setEditingProduct(null)}
              >
                Cancelar
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => handleEdit(editingProduct)}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
