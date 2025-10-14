import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { uploadProduct, uploadProductImage } from "../../services/productService";
import { FaPaperclip, FaTimes } from "react-icons/fa"; // 👈 Added FaTimes for remove button

const ProductUpload = () => {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null); // 👈 Added for image preview
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && !selectedFile.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }
    setImage(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setImage(null);
    setPreview(null);
  };

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
        { title, description, price, currency, imageUrl },
        token
      );

      setTitle("");
      setDescription("");
      setPrice("");
      setCurrency("USD");
      setImage(null);
      setPreview(null);
      alert("Producto subido con éxito 🚀");
    } catch (err) {
      alert("Error al subir producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 space-y-4 bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold text-gray-800">Subir Producto</h2>
      {/* Title input */}
      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      {/* Description textarea */}
      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="4"
      />
      {/* Price and currency */}
      <div className="flex gap-4">
        <input
          type="number"
          placeholder="Precio"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="MXN">MXN (₱)</option>
          <option value="COP">COP ($)</option>
          <option value="ARS">ARS ($)</option>
        </select>
      </div>
      {/* Custom file input */}
      <div className="relative">
        <input
          type="file"
          id="file-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors duration-200"
        >
          <FaPaperclip className="text-blue-700" />
          <span className="font-medium">
            {image ? image.name : 'Adjuntar imagen'}
          </span>
        </label>
      </div>
      {/* Image preview */}
      {preview && (
        <div className="relative w-full max-w-xs h-48 bg-gray-100 rounded-lg overflow-hidden group">
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-full object-cover"
          />
          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemoveFile}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label={`Eliminar ${image?.name || 'imagen'}`}
          >
            <FaTimes size={12} />
          </button>
          {/* File name overlay */}
          {image && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {image.name}
            </div>
          )}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400"
      >
        {loading ? 'Subiendo...' : 'Subir Producto'}
      </button>
    </form>
  );
};

export default ProductUpload;