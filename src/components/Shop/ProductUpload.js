import React, { useState, useContext } from "react";
import { useUI } from "../../context/UIContext";
import { AuthContext } from "../../context/AuthContext";
import { uploadProduct, uploadProductImage } from "../../services/productService";
import { ImagePlus, X, Tag, FileText, Banknote, CheckCircle2 } from "lucide-react";

const ProductUpload = () => {
  const { token } = useContext(AuthContext);
  const { showToast } = useUI();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [category, setCategory] = useState("Otros");
  const [loading, setLoading] = useState(false);

  const categories = ["Electrónica", "Moda", "Hogar", "Vehículos", "Mascotas", "Deportes", "Otros"];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && !selectedFile.type.startsWith('image/')) {
      showToast('Solo se permiten imágenes', 'warning');
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
    if (!image) {
      showToast("Debes añadir una imagen al producto", "warning");
      return;
    }
    setLoading(true);

    try {
      let imageUrl = "";
      if (image) {
        const res = await uploadProductImage(image, token);
        imageUrl = res.url;
      }

      await uploadProduct(
        { title, description, price, currency, imageUrl, category },
        token
      );

      setTitle("");
      setDescription("");
      setPrice("");
      setCurrency("USD");
      setCategory("Otros");
      setImage(null);
      setPreview(null);
      showToast("¡Producto publicado con éxito! 🚀", "success");
    } catch (err) {
      showToast("Error al subir producto", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/40"
      >
        <div className="space-y-6">
          {/* Image Upload Area */}
          <div className="relative">
            <input
              type="file"
              id="product-image"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {!preview ? (
              <label
                htmlFor="product-image"
                className="flex flex-col items-center justify-center w-full aspect-video border-4 border-dashed border-gray-100 rounded-[2rem] cursor-pointer hover:bg-red-50 hover:border-red-200 transition-all group"
              >
                <div className="bg-red-50 p-6 rounded-full group-hover:bg-red-100 transition-colors mb-4">
                  <ImagePlus className="w-10 h-10 text-red-500" />
                </div>
                <span className="font-black text-gray-800 uppercase tracking-widest text-xs">Subir Foto del Producto</span>
                <span className="text-gray-400 text-[10px] mt-2 font-bold uppercase tracking-widest">Formatos: JPG, PNG, WEBP</span>
              </label>
            ) : (
              <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-300">
                <img
                  src={preview}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-red-600 p-2 rounded-xl shadow-lg hover:bg-white transition-all transform hover:rotate-90"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3 text-green-400" /> Imagen lista
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Título del Producto</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                  <Tag className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Ej: Cámara Vintage 1970"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 placeholder:text-gray-300 shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Price & Currency */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Precio y Moneda</label>
              <div className="flex gap-4">
                <div className="relative flex-1 group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 placeholder:text-gray-300 shadow-sm"
                    required
                  />
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-32 px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-2xl outline-none transition-all font-black text-gray-800 shadow-sm cursor-pointer"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="MXN">MXN</option>
                  <option value="COP">COP</option>
                  <option value="ARS">ARS</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Descripción</label>
              <div className="relative group">
                <div className="absolute left-4 top-6 text-gray-400 group-focus-within:text-red-500 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <textarea
                  placeholder="Describe el estado de tu producto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 placeholder:text-gray-300 shadow-sm min-h-[150px] resize-none"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Categoría</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`
                      px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all
                      ${category === cat
                        ? 'bg-red-600 border-red-600 text-white shadow-lg'
                        : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-red-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-red-500/40 hover:bg-red-700 hover:-translate-y-1 transition-all disabled:bg-gray-200 disabled:shadow-none disabled:translate-y-0"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              Publicando...
            </div>
          ) : (
            'Publicar Producto Ahora'
          )}
        </button>
      </form>
    </div>
  );
};

export default ProductUpload;