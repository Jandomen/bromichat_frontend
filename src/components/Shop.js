import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ProductFeed from "./Shop/ProductFeed";
import ProductSearch from "./Shop/ProductSearch";
import MyProducts from "./Shop/MyProducts";
import ProductUpload from "./Shop/ProductUpload";
import { ShoppingBag, Search, Package, PlusCircle, Menu, X } from "lucide-react";

const Shop = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const tabs = [
    { id: "feed", label: "Explorar", icon: <ShoppingBag className="w-5 h-5" />, component: <ProductFeed /> },
    { id: "search", label: "Buscar", icon: <Search className="w-5 h-5" />, component: <ProductSearch /> },
    { id: "my-products", label: "Mis Ventas", icon: <Package className="w-5 h-5" />, component: <MyProducts /> },
    { id: "sell", label: "Vender", icon: <PlusCircle className="w-5 h-5" />, component: <ProductUpload /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfc] font-sans">
      <Header />

      <div className="flex flex-1 relative pt-4 pb-12 px-4 max-w-7xl mx-auto w-full gap-8">

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-50 bg-red-600 text-white p-4 rounded-full shadow-2xl hover:bg-red-700 transition-all scale-110 flex items-center justify-center border-4 border-white"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Sidebar / Navigation Menu */}
        <aside className={`
          fixed inset-0 z-[60] lg:relative lg:inset-auto lg:z-0
          lg:w-72 h-fit
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm lg:hidden h-screen"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <div className="relative bg-white rounded-3xl shadow-2xl lg:shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden sticky top-28 p-6 space-y-4 h-[calc(100vh-140px)] lg:h-auto overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                <span className="bg-red-600 text-white p-2 rounded-xl text-xl">🛒</span>
                TIENDA
              </h2>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group
                    ${activeTab === tab.id
                      ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-[1.02]'
                      : 'text-gray-500 hover:bg-red-50 hover:text-red-600'}
                  `}
                >
                  <div className={`
                    p-2.5 rounded-xl transition-colors
                    ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-red-100 group-hover:text-red-600'}
                  `}>
                    {tab.icon}
                  </div>
                  <span className="font-bold tracking-wide uppercase text-xs">{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="pt-8 mt-8 border-t border-gray-100">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100/50">
                <p className="text-[10px] font-black text-red-600 uppercase mb-2 tracking-widest">Consejo de venta 💡</p>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">Sube fotos con buena iluminación y descripciones claras para generar confianza.</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden p-4 md:p-8 min-h-[70vh] animate-fade-in">
            <header className="mb-8 flex items-center justify-between border-b border-gray-100 pb-6">
              <div>
                <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h1>
                <p className="text-gray-400 text-sm font-medium mt-1">
                  {activeTab === 'feed' && "Descubre productos únicos de tu comunidad"}
                  {activeTab === 'search' && "Encuentra exactamente lo que necesitas"}
                  {activeTab === 'my-products' && "Gestiona tus artículos publicados"}
                  {activeTab === 'sell' && "Empieza a vender tus productos hoy"}
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-red-100">
                  HormiShop Beta
                </div>
              </div>
            </header>

            <div className="transition-all duration-500">
              {tabs.find(t => t.id === activeTab)?.component}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
