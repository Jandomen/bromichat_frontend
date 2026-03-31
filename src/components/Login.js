import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import api from '../services/api';

import bImg from '../assets/b-removebg-preview.png';
import rImg from '../assets/r-removebg-preview.png';
import oImg from '../assets/o-removebg-preview.png';
import mImg from '../assets/m-removebg-preview.png';
import iImg from '../assets/i-removebg-preview.png';
import cImg from '../assets/c-removebg-preview.png';
import hImg from '../assets/h-removebg-preview.png';
import aImg from '../assets/a-removebg-preview.png';
import tImg from '../assets/t-removebg-preview.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user: currentUser } = useContext(AuthContext);
  const { showToast } = useUI();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  React.useEffect(() => {
    const savedEmail = localStorage.getItem('lastLoginEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const logoImages = [bImg, rImg, oImg, mImg, iImg, cImg, hImg, aImg, tImg];



  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      if (token && user) {
        localStorage.setItem('lastLoginEmail', email); // Remember email
        login({ token, user });
        showToast('¡Bienvenido de nuevo!', 'success');
        navigate('/dashboard');
      } else {
        showToast('Error: respuesta del servidor inválida', 'error');
      }
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.notVerified) {
        showToast('⚠️ Tu correo no ha sido verificado. Por favor, revisa tu bandeja de entrada.', 'error');
      } else {
        showToast(error.response?.data?.message || error.response?.data?.error || 'Error al iniciar sesión', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-black via-red-900 to-black p-4 xs:p-6 selection:bg-red-500/30 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-800/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-red-900/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[320px] p-4 xs:p-6 bg-black/40 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/10 relative z-10 animate-fade-in group">
        <div className="text-center mb-6 xs:mb-10">
          <div className="flex items-center justify-center gap-[0.5px] xs:gap-0.5 sm:gap-1.5 mb-6 group cursor-pointer transition-all duration-300">
            {logoImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Logo"
                className="h-6 w-6 xs:h-8 xs:w-8 sm:h-12 sm:w-12 object-contain transition-all hover:scale-125 hover:-translate-y-1 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] brightness-125"
              />
            ))}
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] xs:tracking-[0.3em] text-[8px] xs:text-[10px] mt-2">Eleva tu experiencia social</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-1 group/field">
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within/field:text-red-500 transition-colors" htmlFor="email">Correo</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all text-xs font-medium"
              placeholder="tu@ejemplo.com"
            />
          </div>
          <div className="space-y-1 group/field">
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within/field:text-red-500 transition-colors" htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all text-xs font-medium"
              placeholder="••••••••"
            />
            <div className="flex justify-end pr-2">
              <a href="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 text-white text-[10px] font-black uppercase tracking-widest bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            Entrar
          </button>


        </form>

        <div className="mt-10 text-center space-y-4">
          <p className="text-[11px] text-gray-500 font-bold">
            ¿Eres nuevo en Bromichat?{' '}
            <a href="/register" className="text-red-600 hover:text-red-500 font-black uppercase tracking-widest hover:underline transition-colors">
              Regístrate aquí
            </a>
          </p>
          <a href="/" className="inline-block text-[10px] text-gray-600 hover:text-red-500 transition-colors uppercase font-black tracking-[0.3em] mt-4">
            ← Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
