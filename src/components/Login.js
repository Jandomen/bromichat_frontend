import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { startAuthentication } from '@simplewebauthn/browser';
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
  const { login } = useContext(AuthContext);
  const { showToast } = useUI();
  const navigate = useNavigate();

  const logoImages = [bImg, rImg, oImg, mImg, iImg, cImg, hImg, aImg, tImg];

  const handleBiometricLogin = async () => {
    try {
      const optionsRes = await api.post('/webauthn/login-challenge', { email });
      const options = optionsRes.data;
      const asseResp = await startAuthentication(options);
      const verifyRes = await api.post('/webauthn/login-verify', asseResp);
      const { token, user } = verifyRes.data;

      if (token && user) {
        login({ token, user });
        showToast('¡Bienvenido de nuevo (Biometría)!', 'success');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      showToast(error.response?.data?.error || 'Error en la autenticación biométrica.', 'error');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      if (token && user) {
        login({ token, user });
        showToast('¡Bienvenido de nuevo!', 'success');
        navigate('/dashboard');
      } else {
        showToast('Error: respuesta del servidor inválida', 'error');
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al iniciar sesión', 'error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-black via-red-900 to-black p-6 selection:bg-red-500/30 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-800/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-red-900/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md p-10 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/10 relative z-10 animate-fade-in group">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-1 mb-6 transform group-hover:scale-110 transition-transform duration-700">
            {logoImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              />
            ))}
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Eleva tu experiencia social</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2 group/field">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 group-focus-within/field:text-red-500 transition-colors" htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-4 border border-white/10 rounded-2xl bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/50 focus:bg-white/10 transition-all font-medium"
              placeholder="tu@ejemplo.com"
            />
          </div>
          <div className="space-y-2 group/field">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 group-focus-within/field:text-red-500 transition-colors" htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-6 py-4 border border-white/10 rounded-2xl bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/50 focus:bg-white/10 transition-all font-medium"
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
            className="w-full py-4 px-6 text-white text-xs font-black uppercase tracking-[0.2em] bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-xl shadow-red-900/20 hover:shadow-red-600/40 hover:-translate-y-1 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-500/20"
          >
            Entrar a mi Cuenta
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-[#0a0000] px-4 text-gray-600">Acceso Rápido</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBiometricLogin}
            className="w-full py-4 px-6 flex items-center justify-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-red-500/30 hover:text-white transition-all duration-300"
          >
            <span className="text-xl">☝️</span> Iniciar con Huella Dactilar
          </button>
        </form>

        <div className="mt-10 text-center space-y-4">
          <p className="text-[11px] text-gray-500 font-bold">
            ¿Eres nuevo en BromiChat?{' '}
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
