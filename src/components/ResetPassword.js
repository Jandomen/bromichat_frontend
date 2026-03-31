import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUI } from '../context/UIContext';
import { Lock, ShieldCheck, Sparkles } from 'lucide-react';

import bImg from '../assets/b-removebg-preview.png';
import rImg from '../assets/r-removebg-preview.png';
import oImg from '../assets/o-removebg-preview.png';
import mImg from '../assets/m-removebg-preview.png';
import iImg from '../assets/i-removebg-preview.png';
import cImg from '../assets/c-removebg-preview.png';
import hImg from '../assets/h-removebg-preview.png';
import aImg from '../assets/a-removebg-preview.png';
import tImg from '../assets/t-removebg-preview.png';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useUI();
    const navigate = useNavigate();

    const logoImages = [bImg, rImg, oImg, mImg, iImg, cImg, hImg, aImg, tImg];

    useEffect(() => {
        if (!token) {
            showToast('Token de recuperación no encontrado.', 'error');
            navigate('/login');
        }
    }, [token, navigate, showToast]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return showToast('Las contraseñas no coinciden.', 'error');
        }

        if (newPassword.length < 8) {
            return showToast('La contraseña debe tener al menos 8 caracteres.', 'error');
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/reset-password', {
                token,
                newPassword
            });
            showToast(response.data.message || 'Contraseña restablecida con éxito.', 'success');
            navigate('/login');
        } catch (error) {
            showToast(error.response?.data?.message || 'Error al restablecer la contraseña.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-black via-red-900 to-black p-6 selection:bg-red-500/30 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-red-800/10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[50%] bg-red-900/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-[320px] p-6 bg-black/40 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/10 relative z-10 animate-fade-in group text-white">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1.5 mb-6 group cursor-pointer transition-all duration-300">
                        {logoImages.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt="Logo"
                                className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 object-contain transition-all hover:scale-125 hover:-translate-y-1 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] brightness-125"
                            />
                        ))}
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] xs:tracking-widest text-[8px] xs:text-[9px] mt-2 mb-6">Seguridad de Cuenta</p>

                    <p className="text-sm text-gray-400 leading-relaxed max-w-[280px] mx-auto font-medium">
                        Crea una contraseña fuerte y segura para proteger tu cuenta de <span className="text-red-500">Bromichat</span>.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-1 group/field">
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within/field:text-red-500 transition-colors" htmlFor="newPassword">
                            Nueva Clave
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all text-xs font-medium"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/field:text-red-500 transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-1 group/field">
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within/field:text-red-500 transition-colors" htmlFor="confirmPassword">
                            Confirmar
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all text-xs font-medium"
                                placeholder="••••••••"
                            />
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/field:text-red-500 transition-colors" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-6 flex items-center justify-center gap-3 text-white text-[10px] font-black uppercase tracking-widest bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Restablecer</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em]">
                        Bromichat © {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
