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
          className="lg:hidden fixed bottom-16 right-4 z-50 bg-white/40 backdrop-blur-md text-red-600 p-2 sm:p-3 rounded-xl shadow-lg hover:bg-white/60 transition-all flex items-center justify-center border border-red-200/50"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
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

          <div className="relative bg-white lg:bg-transparent rounded-2xl lg:rounded-none shadow-2xl lg:shadow-none border lg:border-none border-gray-100 overflow-hidden lg:overflow-visible sticky lg:top-28 p-4 sm:p-6 space-y-3 sm:space-y-4 h-[calc(100vh-100px)] lg:h-auto overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-black text-gray-800 flex items-center gap-2">
                <span className="bg-red-600 text-white p-1.5 rounded-lg text-sm sm:text-base">🛒</span>
                TIENDA
              </h2>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <nav className="space-y-1 sm:space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-300 group
                    ${activeTab === tab.id
                      ? 'bg-red-600 text-white shadow-md shadow-red-200 scale-[1.02]'
                      : 'text-gray-500 hover:bg-red-50 hover:text-red-600'}
                  `}
                >
                  <div className={`
                    p-1.5 sm:p-2 rounded-lg transition-colors
                    ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-red-100 group-hover:text-red-600'}
                  `}>
                    {React.cloneElement(tab.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
                  </div>
                  <span className="font-bold tracking-widest uppercase text-[10px] sm:text-xs">{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-100">
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100/50 hidden lg:block">
                <p className="text-[8px] sm:text-[9px] font-black text-red-600 uppercase mb-1 sm:mb-1.5 tracking-widest">Consejo de venta 💡</p>
                <p className="text-[9px] sm:text-[10px] text-gray-600 leading-relaxed font-bold">Sube fotos claras y descripciones precisas para generar confianza.</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-md lg:shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden p-3 sm:p-6 min-h-[70vh] animate-fade-in">
            <header className="mb-4 sm:mb-6 flex items-center justify-between border-b border-gray-100 pb-3 sm:pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-800 uppercase tracking-tight">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h1>
                <p className="text-gray-400 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest mt-0.5 sm:mt-1">
                  {activeTab === 'feed' && "Descubre productos únicos de tu comunidad"}
                  {activeTab === 'search' && "Encuentra exactamente lo que necesitas"}
                  {activeTab === 'my-products' && "Gestiona tus artículos publicados"}
                  {activeTab === 'sell' && "Empieza a vender tus productos hoy"}
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-100">
                  HormiShop 
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
