import React, { useState } from 'react';
import axios from 'axios';
import { useUI } from '../context/UIContext';
import { useNavigate } from 'react-router-dom';
import { Mail, ChevronLeft, Send, Sparkles } from 'lucide-react';

import bImg from '../assets/b-removebg-preview.png';
import rImg from '../assets/r-removebg-preview.png';
import oImg from '../assets/o-removebg-preview.png';
import mImg from '../assets/m-removebg-preview.png';
import iImg from '../assets/i-removebg-preview.png';
import cImg from '../assets/c-removebg-preview.png';
import hImg from '../assets/h-removebg-preview.png';
import aImg from '../assets/a-removebg-preview.png';
import tImg from '../assets/t-removebg-preview.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useUI();
    const navigate = useNavigate();

    const logoImages = [bImg, rImg, oImg, mImg, iImg, cImg, hImg, aImg, tImg];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BACKEND}/auth/forgot-password`, { email });
            showToast(response.data.message || 'Se ha enviado un correo para restablecer tu contraseña.', 'success');
            navigate('/login');
        } catch (error) {
            showToast(error.response?.data?.message || 'Error al procesar la solicitud.', 'error');
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

            <div className="w-full max-w-md p-10 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/10 relative z-10 animate-fade-in group text-white">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-1 mb-6 transform group-hover:scale-110 transition-transform duration-700">
                        {logoImages.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt="Logo"
                                className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            />
                        ))}
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[9px] mt-2 mb-6">Restablecer Acceso</p>

                    <p className="text-sm text-gray-400 leading-relaxed max-w-[280px] mx-auto font-medium">
                        <span className="text-red-500 font-black block mb-2">SISTEMA EN PROCESO</span>
                        Actualmente la recuperación por correo no está disponible. Si perdiste tus credenciales, por favor <span className="text-red-500">crea una cuenta nueva</span>.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2 group/field">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 group-focus-within/field:text-red-500 transition-colors" htmlFor="email">
                            Correo Electrónico
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-12 pr-6 py-4 border border-white/10 rounded-2xl bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/50 focus:bg-white/10 transition-all font-medium"
                                placeholder="tu@email.com"
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/field:text-red-500 transition-colors" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={true}
                        className="w-full py-4 px-6 flex items-center justify-center gap-3 text-white text-xs font-black uppercase tracking-[0.2em] bg-gray-800 cursor-not-allowed rounded-2xl shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-500/20"
                    >
                        <Sparkles className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Temporalmente Deshabilitado</span>
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center gap-2 text-[10px] text-gray-500 hover:text-red-500 transition-all duration-300 uppercase font-black tracking-[0.3em]"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Volver al Inicio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
