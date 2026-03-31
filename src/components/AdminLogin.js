import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import api from '../services/api';
import { Mail, Lock, ChevronRight, Loader2, ShieldCheck } from 'lucide-react';

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

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            if (token && user) {
                if (user.role !== 'admin') {
                    showToast('Acceso denegado: se requieren permisos de administrador', 'error');
                    return;
                }
                login({ token, user });
                showToast('¡Bienvenido Administrador!', 'success');
                navigate('/admin/dashboard');
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Error al iniciar sesión', 'error');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#020202] px-4 selection:bg-red-500/30 relative overflow-hidden font-['Outfit']">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-red-600/5 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.02] via-transparent to-transparent opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm relative z-10"
            >
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center -space-x-1 xs:-space-x-1.5 mb-6">
                        {logoImages.map((img, idx) => (
                            <img key={idx} src={img} alt="" className="h-8 w-8 xs:h-10 xs:w-10 object-contain drop-shadow-[0_10px_20px_rgba(239,68,68,0.2)]" />
                        ))}
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-500/20 rounded-full mb-3">
                        <ShieldCheck size={12} className="text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Security Gate</span>
                    </div>
                    <h1 className="text-white text-3xl font-black uppercase tracking-tighter mb-1">Bromichat</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] opacity-70">Administración de Red Global</p>
                </div>

                {/* Login Card */}
                <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                    
                    <form className="space-y-6 relative" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1" htmlFor="email">Email Corporativo</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 transition-colors" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-6 py-4 border border-white/5 rounded-2xl bg-white/[0.02] text-white placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 transition-all text-sm font-bold"
                                    placeholder="admin@bromichat.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1" htmlFor="password">Llave Maestra</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 transition-colors" />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-6 py-4 border border-white/5 rounded-2xl bg-white/[0.02] text-white placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/30 transition-all text-sm font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full py-4.5 px-6 text-white text-xs font-black uppercase tracking-[0.2em] bg-red-600 hover:bg-red-500 rounded-2xl shadow-xl shadow-red-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                        >
                            {isLoggingIn ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Desbloquear Acceso <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Solo personal autorizado de Bromichat</p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
