import React, { useState } from 'react';
import api from '../services/api';
import { useUI } from '../context/UIContext';
import { useNavigate } from 'react-router-dom';
import { Mail, ChevronLeft, Sparkles } from 'lucide-react';

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

    const { showToast } = useUI();
    const navigate = useNavigate();

    const logoImages = [bImg, rImg, oImg, mImg, iImg, cImg, hImg, aImg, tImg];

    const handleSubmit = async (e) => {
        e.preventDefault();


        try {
            const response = await api.post('/auth/forgot-password', { email });
            showToast(response.data.message || 'Se ha enviado un correo para restablecer tu contraseña.', 'success');
            navigate('/login');
        } catch (error) {
            showToast(error.response?.data?.message || 'Error al procesar la solicitud.', 'error');
        } finally {

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
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] xs:tracking-[0.3em] text-[8px] xs:text-[10px] mt-2 mb-6">Restablecer Acceso</p>

                    <p className="text-sm text-gray-400 leading-relaxed max-w-[280px] mx-auto font-medium">
                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-1 group/field">
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within/field:text-red-500 transition-colors" htmlFor="email">
                            Correo
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all text-xs font-medium"
                                placeholder="tu@email.com"
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/field:text-red-500 transition-colors" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-6 flex items-center justify-center gap-3 text-white text-[10px] font-black uppercase tracking-widest bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Enviar Enlace
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
