import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUI } from '../context/UIContext';
import { CheckCircle2, XCircle, Loader2, Mail, ChevronLeft } from 'lucide-react';

import bImg from '../assets/b-removebg-preview.png';
import rImg from '../assets/r-removebg-preview.png';
import oImg from '../assets/o-removebg-preview.png';
import mImg from '../assets/m-removebg-preview.png';
import iImg from '../assets/i-removebg-preview.png';
import cImg from '../assets/c-removebg-preview.png';
import hImg from '../assets/h-removebg-preview.png';
import aImg from '../assets/a-removebg-preview.png';
import tImg from '../assets/t-removebg-preview.png';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const { showToast } = useUI();
    const navigate = useNavigate();

    const logoImages = [bImg, rImg, oImg, mImg, iImg, cImg, hImg, aImg, tImg];

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BACKEND}/auth/verify-email?token=${token}`);
                setStatus('success');
                showToast(response.data.message || 'Correo verificado con éxito.', 'success');
                setTimeout(() => navigate('/login'), 3000);
            } catch (error) {
                setStatus('error');
                showToast(error.response?.data?.message || 'Error al verificar el correo.', 'error');
            }
        };

        verify();
    }, [token, navigate, showToast]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-black via-red-900 to-black p-6 selection:bg-red-500/30 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-red-800/10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[50%] bg-red-900/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md p-10 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/10 relative z-10 animate-fade-in group text-white text-center">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-1 mb-6 transition-transform duration-700">
                        {logoImages.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt="Logo"
                                className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            />
                        ))}
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[9px] mt-2 mb-6">Verificación de Cuenta</p>
                </div>

                {status === 'verifying' && (
                    <div className="space-y-6 py-4">
                        <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto opacity-80" />
                        <h3 className="text-xl font-bold">Verificando tu correo...</h3>
                        <p className="text-sm text-gray-400 font-medium">Estamos validando tus credenciales sociales en <span className="text-red-500">BromiChat</span>.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6 py-4 animate-in zoom-in duration-500">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="text-2xl font-black">¡Email Verificado!</h3>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            Tu cuenta ha sido activada correctamente. <br />
                            Serás redirigido al inicio de sesión en unos segundos.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 px-6 text-white text-xs font-black uppercase tracking-[0.2em] bg-green-600 rounded-2xl shadow-xl shadow-green-900/20 hover:bg-green-500 transition-all duration-300"
                        >
                            Ir al Login ahora
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6 py-4 animate-in zoom-in duration-500">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h3 className="text-2xl font-black">Error de Verificación</h3>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            El enlace de verificación es inválido o ha expirado. Por favor, solicita uno nuevo.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 px-6 text-white text-xs font-black uppercase tracking-[0.2em] bg-red-600 rounded-2xl shadow-xl shadow-red-900/20 hover:bg-red-500 transition-all duration-300"
                        >
                            Volver al Login
                        </button>
                    </div>
                )}

                <div className="mt-10 pt-6 border-t border-white/5">
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em]">
                        BromiChat © {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
