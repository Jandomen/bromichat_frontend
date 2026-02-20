import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

import DashBoard from '../buttons/DashboardButton';
import Profile from '../buttons/ProfileButton';

import LogoutButton from '../buttons/LogoutButton';
import SendMessageButton from '../buttons/SendMessageButton';

import ShopingButton from '../buttons/ShopingButton';
import VideoButton from '../buttons/VideoButton';
import GaleryButton from '../buttons/GaleryButton';
import SettingsButton from '../buttons/SettingsButton';
import NotificationButton from '../buttons/NotificationButton';
import GroupButton from '../buttons/GroupButton';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoImages = [
    '/assets/logo/b-removebg-preview.png',
    '/assets/logo/r-removebg-preview.png',
    '/assets/logo/o-removebg-preview.png',
    '/assets/logo/m-removebg-preview.png',
    '/assets/logo/i-removebg-preview.png',
    '/assets/logo/c-removebg-preview.png',
    '/assets/logo/h-removebg-preview.png',
    '/assets/logo/a-removebg-preview.png',
    '/assets/logo/t-removebg-preview.png'
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[100] bg-gradient-to-r from-black via-red-900 to-black text-white shadow-2xl border-b border-red-900/30 backdrop-blur-md bg-opacity-95 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3">
          <div className="flex flex-row justify-between items-center gap-2 sm:gap-4">

            {/* Logo Section */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              {logoImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Letra ${index + 1}`}
                  className="h-6 w-6 sm:h-10 sm:w-10 transition-transform hover:scale-110 filter drop-shadow-md object-contain"
                />
              ))}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center">
              <ul className="flex flex-nowrap justify-end gap-3 items-center">
                <li className="hover:scale-105 transition shrink-0"><DashBoard /></li>
                <li className="hover:scale-105 transition shrink-0"><Profile /></li>
                <li className="hover:scale-105 transition shrink-0"><SendMessageButton /></li>
                <li className="hover:scale-105 transition shrink-0"><ShopingButton /></li>
                <li className="hover:scale-105 transition shrink-0"><GroupButton /></li>
                <li className="hover:scale-105 transition shrink-0"><VideoButton /></li>
                <li className="hover:scale-105 transition shrink-0"><GaleryButton /></li>
                <li className="hover:scale-105 transition shrink-0"><SettingsButton /></li>
                <li className="hover:scale-105 transition shrink-0"><NotificationButton /></li>
                <li className="sm:ml-2 pl-4 border-l border-white/20 shrink-0"><LogoutButton /></li>
              </ul>
            </nav>

            <div className="flex lg:hidden items-center gap-3">
              <li className="list-none shrink-0"><NotificationButton /></li>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-11 h-11 flex items-center justify-center bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all border border-white/10"
                aria-label="Menú principal"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu Backdrop & Drawer */}
        <div className={`lg:hidden fixed inset-0 top-[calc(60px+env(safe-area-inset-top))] bg-black/60 backdrop-blur-sm transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} onClick={() => setIsMenuOpen(false)}>
          <div
            className={`absolute right-0 top-0 h-screen w-2/3 max-w-[280px] bg-zinc-900 shadow-2xl p-6 transition-transform duration-500 ease-out border-l border-white/10 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">Navegación</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/5" onClick={() => setIsMenuOpen(false)}><DashBoard /><span className="text-[9px] font-bold uppercase">Inicio</span></div>
                  <div className="flex flex-col items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/5" onClick={() => setIsMenuOpen(false)}><Profile /><span className="text-[9px] font-bold uppercase">Perfil</span></div>
                  <div className="flex flex-col items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/5" onClick={() => setIsMenuOpen(false)}><VideoButton /><span className="text-[9px] font-bold uppercase">Videos</span></div>
                  <div className="flex flex-col items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/5" onClick={() => setIsMenuOpen(false)}><GaleryButton /><span className="text-[9px] font-bold uppercase">Galeria</span></div>
                  <div className="flex flex-col items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/5" onClick={() => setIsMenuOpen(false)}><GroupButton /><span className="text-[9px] font-bold uppercase">Grupos</span></div>
                  <div className="flex flex-col items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/5" onClick={() => setIsMenuOpen(false)}><ShopingButton /><span className="text-[9px] font-bold uppercase">Tienda</span></div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl" onClick={() => setIsMenuOpen(false)}>
                    <SettingsButton />
                    <span className="text-xs font-bold uppercase tracking-widest">Configuración</span>
                  </div>
                  <div className="flex items-center gap-4 bg-red-600/10 p-3 rounded-2xl border border-red-600/20" onClick={() => setIsMenuOpen(false)}>
                    <LogoutButton />
                    <span className="text-xs font-bold uppercase tracking-widest text-red-500">Cerrar Sesión</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Reduced spacer height for mobile */}
      <div className="h-[calc(60px+env(safe-area-inset-top))] sm:h-[calc(100px+env(safe-area-inset-top))]"></div>
    </>
  );
};

export default Header;
