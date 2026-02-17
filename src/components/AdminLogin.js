import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { startAuthentication } from '@simplewebauthn/browser';
import api from '../services/api';
import { Mail, Lock, Fingerprint, ChevronRight, Loader2 } from 'lucide-react';

import bImg from '../assets/b-removebg-preview.png';
import rImg from '../assets/r-removebg-preview.png';
import oImg from '../assets/o-removebg-preview.png';
import mImg from '../assets/m-removebg-preview.png';
import iImg from '../assets/i-removebg-preview.png';
import cImg from '../assets/c-removebg-preview.png';
import hImg from '../assets/h-removebg-preview.png';
import aImg from '../assets/a-removebg-preview.png';
import tImg from '../assets/t-removebg-preview.png';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { login } = useContext(AuthContext);
    const { showToast } = useUI();
    const navigate = useNavigate();

    const logoImages = [bImg, rImg, oImg, mImg, iImg, cImg, hImg, aImg, tImg];

    const handleBiometricLogin = async () => {
        try {
            const optionsRes = await api.post('/webauthn/login-challenge', { email });
            const options = optionsRes.data;
            const asseResp = await startAuthentication({ optionsJSON: options });
            const verifyRes = await api.post('/webauthn/login-verify', asseResp);
            const { token, user } = verifyRes.data;

            if (token && user) {
                if (user.role !== 'admin') {
                    showToast('Acceso denegado: se requieren permisos de administrador', 'error');
                    return;
                }
                login({ token, user });
                showToast('¡Bienvenido Administrador!', 'success');
                navigate('/admin');
            }
        } catch (error) {
            console.error('Biometric login error:', error);
            showToast(error.response?.data?.error || 'Error en la autenticación biométrica.', 'error');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            console.log('[DEBUG] Respuesta Admin Login:', response.data);

            const { token, user } = response.data;

            if (token && user) {
                if (user.role !== 'admin') {
                    console.log('[DEBUG] Rol insuficiente:', user.role);
                    showToast('Acceso denegado: se requieren permisos de administrador', 'error');
                    return;
                }
                login({ token, user });
                showToast('¡Bienvenido Administrador!', 'success');
                navigate('/admin');
            }
        } catch (error) {
            console.error('[DEBUG] Error Login:', error);
            showToast(error.response?.data?.message || 'Error al iniciar sesión', 'error');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] p-6 selection:bg-red-500/30 relative overflow-hidden font-['Outfit']">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-red-600/20 blur-[150px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.05, 0.1, 0.05]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-red-900/20 blur-[150px] rounded-full"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md p-1 bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(220,38,38,0.3)] border border-white/5 relative z-10"
            >
                <div className="p-8 sm:p-10 bg-gradient-to-b from-white/5 to-transparent rounded-[2.3rem]">
                    <div className="text-center mb-10">
                        <motion.div
                            className="flex items-center justify-center gap-1 mb-6"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.05 } }
                            }}
                        >
                            {logoImages.map((img, idx) => (
                                <motion.img
                                    key={idx}
                                    src={img}
                                    variants={{
                                        hidden: { y: 20, opacity: 0 },
                                        visible: { y: 0, opacity: 1 }
                                    }}
                                    alt="Logo"
                                    className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                                />
                            ))}
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-white text-2xl font-black uppercase tracking-widest"
                        >
                            Admin Portal
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[9px] mt-2"
                        >
                            Acceso Restringido - Administrador
                        </motion.p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2" htmlFor="email">Email Admin</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-6 py-4 border border-white/5 rounded-2xl bg-white/[0.03] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40 focus:bg-white/[0.06] transition-all font-medium"
                                    placeholder="admin@bromichat.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2" htmlFor="password">PIN de Acceso</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-6 py-4 border border-white/5 rounded-2xl bg-white/[0.03] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40 focus:bg-white/[0.06] transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full py-4 px-6 text-white text-xs font-black uppercase tracking-[0.2em] bg-red-600 hover:bg-red-500 rounded-2xl shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:grayscale"
                        >
                            {isLoggingIn ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Autenticar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-[9px] uppercase font-black tracking-widest">
                                <span className="bg-[#0a0a0a] px-4 text-gray-700">Seguridad Biométrica</span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={handleBiometricLogin}
                            className="w-full py-4 px-6 flex items-center justify-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 rounded-2xl bg-white/[0.02] transition-all"
                        >
                            <Fingerprint className="w-5 h-5 text-red-500" /> Acceso con Huella
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
