import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import CreatePost from './posts/CreatePost';
import FriendsPosts from './posts/FriendsPosts';
import LogoutButton from '../buttons/LogoutButton';
import defaultProfile from '../assets/default-profile.png';
import { getFullImageUrl } from '../utils/getProfilePicture';
import StoriesBar from './stories/StoriesBar';
import SosModal from './UI/SosModal';

import { useRef } from 'react';


const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [refresh, setRefresh] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const createPostRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCreate = () => {
    createPostRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => {
    const handleScrollEvent = () => scrollToCreate();
    window.addEventListener('scroll-to-create', handleScrollEvent);
    return () => window.removeEventListener('scroll-to-create', handleScrollEvent);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfc] font-sans selection:bg-primary-200">
      <Header />

      <main className="flex-grow pt-4 sm:pt-8 pb-24 lg:pb-12 px-4 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 animate-fade-in">

        {/* Left Sidebar - Personal Card & Tools (Hidden on Mobile, Visible on Tablet+) */}
        <div className="hidden md:block lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden sticky top-28 transition-all hover:shadow-2xl hover:shadow-primary-100/20">
            {/* Minimalist Profile Header */}
            <div className="h-24 bg-gradient-to-br from-primary-600 to-primary-800 relative">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <Link to={`/ user / ${user?._id} `} className="p-1.5 bg-white rounded-2xl shadow-lg block hover:scale-105 transition-transform">
                  <img
                    src={getFullImageUrl(user?.profilePicture)}
                    className="w-20 h-20 rounded-xl object-cover"
                    alt="Profile"
                    onError={(e) => e.target.src = defaultProfile}
                  />
                </Link>
              </div>
            </div>

            <div className="pt-12 pb-6 px-6 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                <span className="bg-yellow-400/20 px-3 py-1 rounded-xl border border-yellow-400/10 inline-block">
                  {user?.username || 'Usuario'}
                </span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">@{user?.username?.toLowerCase()}</p>

              <Link
                to={`/ user / ${user?._id} `}
                className="mt-6 block w-full py-2.5 rounded-xl bg-primary-50 text-primary-600 font-semibold text-sm hover:bg-primary-600 hover:text-white transition-all duration-300"
              >
                Ver Mi Perfil
              </Link>
            </div>

            <div className="px-3 pb-4 space-y-1">
              <Link to="/search" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group text-gray-700">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <span className="font-medium">Descubrir Personas</span>
              </Link>

              <Link to="/friends" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group text-gray-700">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors text-xl leading-none">👥</div>
                <span className="font-medium">Amigos</span>
              </Link>

              <Link to="/groups" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group text-gray-700">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors text-xl leading-none">🏰</div>
                <span className="font-medium">Comunidades</span>
              </Link>

              <Link to="/saved" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all group text-gray-700">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors text-xl leading-none">🔖</div>
                <span className="font-medium">Guardados</span>
              </Link>

              <div className="pt-4 mt-4 border-t border-gray-100 px-1">
                <LogoutButton />
              </div>

              {user?.sosSettings?.isEnabled && (
                <div className="px-3 pb-4">
                  <button
                    onClick={() => setIsSosModalOpen(true)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-[2rem] bg-red-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-500/40 hover:bg-red-700 transition-all animate-pulse"
                  >
                    <span className="text-lg">🆘</span>
                    BOTÓN DE AUXILIO
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center - Feed */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-8">

          {/* Mobile/Tablet Profile & Quick Links (Hidden on Desktop) */}
          <section className="lg:hidden block space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <Link to={`/ user / ${user?._id} `} className="shrink-0">
                  <img
                    src={getFullImageUrl(user?.profilePicture)}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-primary-100"
                    alt="Me"
                    onError={(e) => e.target.src = defaultProfile}
                  />
                </Link>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bienvenido,</p>
                  <p className="text-sm font-black text-gray-800 uppercase">{user?.username}</p>
                </div>
              </div>
              <Link to="/search" className="p-3 bg-primary-50 text-primary-600 rounded-2xl shadow-sm hover:bg-primary-100 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {[
                { l: 'Amigos', i: '👥', h: '/friends' },
                { l: 'Guardados', i: '🔖', h: '/saved' },
                { l: 'Comunidades', i: '🏰', h: '/groups' },
                { l: 'Videos', i: '🎬', h: '/videos' },
                { l: 'Galería', i: '🖼️', h: '/gallery' },
                { l: 'Tienda', i: '🛍️', h: '/shop' }
              ].map(item => (
                <Link key={item.l} to={item.h} className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-xs font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
                  <span>{item.i}</span>
                  {item.l}
                </Link>
              ))}
            </div>

            {user?.sosSettings?.isEnabled && (
              <button
                onClick={() => setIsSosModalOpen(true)}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 transition-all border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
              >
                🆘 SOS EMERGENCIA
              </button>
            )}
          </section>

          <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <StoriesBar />
          </section>

          <section ref={createPostRef} className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CreatePost onPostCreated={() => setRefresh(!refresh)} />
          </section>

          <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <FriendsPosts key={refresh} />
          </section>
        </div>

        {/* Right Sidebar - Dynamic Content (Hidden on Mobile) */}
        <div className="hidden lg:block lg:col-span-3 space-y-8">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-50 sticky top-28">
            <h3 className="text-xs font-black text-gray-400 mb-6 uppercase tracking-[0.2em]">Actividad Destacada</h3>

            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-900/90 mix-blend-multiply transition-opacity group-hover:opacity-80"></div>
                <div className="bg-primary-600 h-32 flex items-center justify-center relative p-4 text-center">
                  <p className="text-white font-bold text-sm leading-tight">Desbloquea Funciones Premium y Apoya a la Comunidad</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-bold text-primary-500 uppercase mb-2">¿Sabías que?</p>
                <p className="text-xs text-gray-600 leading-relaxed">¡Ahora puedes compartir fotos y documentos de alta calidad directamente en tu feed!</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-2 justify-center">
              {[{ l: 'Privacidad' }, { l: 'Acerca de' }, { l: 'Contacto' }, { l: 'Ayuda' }].map(item => (
                <span key={item.l} className="text-[10px] font-semibold text-gray-400 hover:text-primary-500 transition-colors uppercase tracking-widest cursor-pointer">{item.l}</span>
              ))}
            </div>
          </div>
        </div>

      </main>

      <Footer />

      {/* Desktop Scroll Top Only (to avoid overlap with mobile nav) */}
      <div className="hidden lg:block">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-primary-600 text-white p-4 rounded-2xl shadow-2xl shadow-primary-500/40 hover:bg-primary-700 hover:-translate-y-1 transition-all z-50 animate-bounce-short"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </button>
        )}
      </div>

      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onConfirm={() => {/* Actual API call for SOS */ }}
        contacts={user?.sosSettings?.emergencyContacts}
        message={user?.sosSettings?.message}
      />
    </div>
  );
};


export default Dashboard;
