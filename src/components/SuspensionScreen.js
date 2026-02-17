import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, LogOut, Clock, MessageSquareX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuspensionScreen = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user || !user.isSuspended) {
        return null;
    }

    const expiryDate = user.suspensionExpires ? new Date(user.suspensionExpires).toLocaleDateString() : 'Indefinido';

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-['Outfit'] relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-red-600/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-red-900/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[3rem] p-10 lg:p-16 text-center relative z-10 shadow-2xl"
            >
                <div className="w-24 h-24 bg-red-600/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-red-500">
                    <ShieldAlert size={48} />
                </div>

                <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 uppercase tracking-tighter">Acceso Restringido</h1>

                <p className="text-lg text-gray-400 mb-12 leading-relaxed">
                    Tu acceso a los servicios de <span className="text-red-500 font-bold uppercase tracking-widest text-sm">BromiChat Enterprise</span> ha sido suspendido temporalmente por el departamento de moderación.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center gap-3">
                        <Clock className="text-red-500" size={24} />
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Caducidad de Sanción</p>
                            <p className="text-white font-bold">{expiryDate}</p>
                        </div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center gap-3">
                        <MessageSquareX className="text-red-500" size={24} />
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Motivo Registrado</p>
                            <p className="text-white font-bold italic">"{user.suspensionReason || 'Infracción de protocolos'}"</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <p className="text-xs text-gray-500 uppercase font-black tracking-[0.2em] animate-pulse">
                        Terminal en modo Solo-Lectura / Restricción Total de Acciones
                    </p>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl mx-auto transition-all font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-900/40"
                    >
                        <LogOut size={16} /> Cerrar Sesión Segura
                    </button>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 text-gray-600">
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] leading-relaxed">
                        Si crees que esto es un error en la matriz, contacta con soporte técnico de BROMICHAT Division.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default SuspensionScreen;
