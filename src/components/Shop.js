import React, { useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ProductFeed from "./Shop/ProductFeed";
import ProductSearch from "./Shop/ProductSearch";
import MyProducts from "./Shop/MyProducts";
import ProductUpload from "./Shop/ProductUpload";

const Shop = () => {
  const uploadRef = useRef(null);
  const myProductsRef = useRef(null);
  const searchRef = useRef(null);
  const feedRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />

      <div className="fixed top-1/2 right-4 transform -translate-y-1/2 flex flex-col gap-2 z-50">
        <button
          className="bg-purple-600 text-white px-3 py-2 rounded shadow hover:bg-purple-700"
          onClick={() => scrollToSection(uploadRef)}
        >
          ⬆️ Subir
        </button>
        <button
          className="bg-yellow-500 text-white px-3 py-2 rounded shadow hover:bg-yellow-600"
          onClick={() => scrollToSection(myProductsRef)}
        >
          📦 Mis Productos
        </button>
        <button
          className="bg-blue-600 text-white px-3 py-2 rounded shadow hover:bg-blue-700"
          onClick={() => scrollToSection(searchRef)}
        >
          🔍 Buscar
        </button>
        <button
          className="bg-green-600 text-white px-3 py-2 rounded shadow hover:bg-green-700"
          onClick={() => scrollToSection(feedRef)}
        >
          📰 Feed
        </button>
      </div>

      <main className="flex-grow container mx-auto px-4 py-6 space-y-12">
        <h1 className="text-3xl font-bold mb-6 text-center">🛒 Nuestra Tienda</h1>

        <section ref={uploadRef} className="scroll-mt-20">
          <h2 className="text-2xl font-semibold mb-4">Subir un nuevo producto</h2>
          <ProductUpload />
        </section>

        <section ref={myProductsRef} className="scroll-mt-20">
          <h2 className="text-2xl font-semibold mb-4">Mis Productos</h2>
          <MyProducts />
        </section>

        <section ref={searchRef} className="scroll-mt-20">
          <ProductSearch />
        </section>

        <section ref={feedRef} className="scroll-mt-20">
          <ProductFeed />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
