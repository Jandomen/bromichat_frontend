import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';

const MobileNav = ({ onPlusClick }) => {
    const { user } = useContext(AuthContext);
    const { unreadMessageCount } = useContext(NotificationContext);
    const [isVisible, setIsVisible] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    if (!user) return null;

    // Rutas donde NO se debe mostrar la barra de navegación móvil
    const hideOnPaths = ['/login', '/register', '/', '/forgot-password', '/verify-email', '/reset-password'];
    if (hideOnPaths.includes(location.pathname)) return null;

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    const isChatActive = () => {
        return location.pathname.startsWith('/messages') || location.pathname.startsWith('/chat');
    };

    const handlePlus = () => {
        if (onPlusClick) {
            onPlusClick();
        } else {
            if (location.pathname !== '/dashboard') {
                navigate('/dashboard');
                setTimeout(() => {
                    window.dispatchEvent(new Event('scroll-to-create'));
                }, 100);
            } else {
                window.dispatchEvent(new Event('scroll-to-create'));
            }
        }
    };

    return (
        <>
            {/* Main Nav Bar */}
            <div className={`lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[85%] max-w-md z-[100] bg-red-600/15 backdrop-blur-2xl border border-red-500/20 px-6 py-2 flex justify-between items-center shadow-[0_25px_60px_-15px_rgba(220,38,38,0.3)] rounded-[3rem] ring-1 ring-red-950/5 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-32 opacity-0 scale-90 pointer-events-none'}`}>
                <Link to="/dashboard" className={`p-2 flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive('/dashboard') ? 'text-red-600' : 'text-gray-500'}`}>
                    <div className={`p-1.5 rounded-2xl transition-all duration-300 ${isActive('/dashboard')
                        ? 'bg-red-500/20 ring-2 ring-red-400/80 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                        : 'hover:bg-red-500/5 border border-transparent hover:border-red-500/20'}`}>
                        <svg className="w-6 h-6" fill={isActive('/dashboard') ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter">Inicio</span>
                </Link>

                <Link to="/search" className={`p-2 flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive('/search') ? 'text-red-600' : 'text-gray-500'}`}>
                    <div className={`p-1.5 rounded-2xl transition-all duration-300 ${isActive('/search')
                        ? 'bg-red-500/20 ring-2 ring-red-400/80 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                        : 'hover:bg-red-500/5 border border-transparent hover:border-red-500/20'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter">Cerca</span>
                </Link>

                <div className="relative -top-10 group">
                    <button
                        onClick={handlePlus}
                        className="p-5 bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-full shadow-[0_20px_40px_rgba(220,38,38,0.4)] border-4 border-white active:scale-95 transition-all group-hover:rotate-90 duration-300 transform hover:scale-110 ring-4 ring-primary-100/50"
                        title="Nueva publicación"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>

                    {/* Toggle button - Small question mark below '+' */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-600/5 border border-red-500/10 backdrop-blur-2xl rounded-full text-red-900 flex items-center justify-center transition-all active:scale-90 shadow-sm"
                        title="Ocultar menú"
                    >
                        <span className="text-[10px] font-bold">?</span>
                    </button>
                </div>

                <Link
                    to="/messages"
                    className={`p-2 flex flex-col items-center gap-1 transition-all active:scale-90 relative ${isChatActive() ? 'text-indigo-600' : (unreadMessageCount > 0 ? 'text-indigo-500' : 'text-gray-500')}`}
                >
                    <div className={`p-1.5 rounded-2xl transition-all duration-300 ${isChatActive()
                        ? 'bg-indigo-500/20 ring-2 ring-indigo-400/80 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                        : 'hover:bg-indigo-500/5 border border-transparent hover:border-indigo-500/20'}`}>
                        <div className="relative">
                            <svg className="w-6 h-6" fill={isChatActive() ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            {unreadMessageCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white shadow-lg ring-2 ring-white animate-bounce-short">
                                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                </span>
                            )}
                        </div>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter">Chat</span>
                </Link>

                <Link to={`/user/${user?._id}`} className={`p-2 flex flex-col items-center gap-1 transition-all active:scale-90 ${isActive(`/user/${user?._id}`) ? 'text-red-600' : 'text-gray-500'}`}>
                    <div className={`p-0.5 rounded-2xl transition-all duration-300 ${isActive(`/user/${user?._id}`)
                        ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-red-950/20 shadow-[0_0_20px_rgba(220,38,38,0.6)]'
                        : 'grayscale opacity-70 border border-transparent hover:border-red-500/30'}`}>
                        <img
                            src={user?.profilePicture ? getFullImageUrl(user.profilePicture) : defaultProfile}
                            className={`w-6 h-6 rounded-lg object-cover ${isActive(`/user/${user?._id}`) ? '' : 'grayscale opacity-70'}`}
                            alt="Yo"
                            onError={e => e.target.src = defaultProfile}
                        />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter">Tú</span>
                </Link>
            </div>

            {/* Floating Toggle Button (visible when nav is hidden) */}
            <button
                onClick={() => setIsVisible(true)}
                className={`lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] w-14 h-14 bg-red-600/10 backdrop-blur-xl text-red-900 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 border border-red-500/20 shadow-lg shadow-red-500/10 select-none ${!isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-32 opacity-0 scale-50 pointer-events-none'}`}
            >
                <span className="text-2xl font-black tracking-tighter">?</span>
            </button>
        </>
    );
};

export default MobileNav;
