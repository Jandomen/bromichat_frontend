import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { uploadProduct, uploadProductImage } from "../../services/productService";

const ProductUpload = () => {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD"); // 👈 nueva moneda
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";
      if (image) {
        const res = await uploadProductImage(image, token);
        imageUrl = res.url;
      }

      await uploadProduct(
        { title, description, price, currency, imageUrl }, // 👈 incluye currency
        token
      );

      setTitle("");
      setDescription("");
      setPrice("");
      setCurrency("USD");
      setImage(null);
      alert("Producto subido con éxito 🚀");
    } catch (err) {
     // console.error("Error al subir producto:", err);
      alert("Error al subir producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold">Subir producto</h2>

      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Precio"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="MXN">MXN (₱)</option>
          <option value="COP">COP ($)</option>
          <option value="ARS">ARS ($)</option>
        </select>
      </div>

      <input type="file" onChange={(e) => setImage(e.target.files[0])} />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Subiendo..." : "Subir producto"}
      </button>
    </form>
  );
};

export default ProductUpload;
