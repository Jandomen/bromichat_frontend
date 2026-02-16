import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUI } from '../context/UIContext';

import bImg from '../assets/b-removebg-preview.png';
import rImg from '../assets/r-removebg-preview.png';
import oImg from '../assets/o-removebg-preview.png';
import mImg from '../assets/m-removebg-preview.png';
import iImg from '../assets/i-removebg-preview.png';
import cImg from '../assets/c-removebg-preview.png';
import hImg from '../assets/h-removebg-preview.png';
import aImg from '../assets/a-removebg-preview.png';
import tImg from '../assets/t-removebg-preview.png';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    birthdate: '',
    role: 'user'
  });

  const { showToast } = useUI();
  const navigate = useNavigate();

  const logoImages = [bImg, rImg, oImg, mImg, iImg, cImg, hImg, aImg, tImg];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BACKEND}/auth/register`,
        formData
      );

      if (response.data) {
        showToast('¡Registro exitoso! Por favor, verifica tu correo electrónico para activar tu cuenta.', 'success');
        navigate('/login');
      } else {
        showToast('Error: respuesta del servidor inválida', 'error');
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al registrarse', 'error');
    }
  };

  const fields = [
    { label: 'Nombre de usuario', name: 'username', type: 'text' },
    { label: 'Nombre', name: 'name', type: 'text' },
    { label: 'Apellido', name: 'lastName', type: 'text' },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'Contraseña', name: 'password', type: 'password' },
    { label: 'Teléfono', name: 'phone', type: 'text' },
    { label: 'Fecha de nacimiento', name: 'birthdate', type: 'date' }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-black via-red-900 to-black py-16 px-6 selection:bg-red-500/30 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-800/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-red-900/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-full max-w-2xl p-10 bg-black/40 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/10 relative z-10 animate-fade-in group">
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
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Comienza tu viaje social premium hoy</p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.name} className={`space-y-2 group/field ${field.name === 'email' || field.name === 'password' ? 'md:col-span-2' : ''}`}>
              <label
                className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 group-focus-within/field:text-red-500 transition-colors"
                htmlFor={field.name}
              >
                {field.label}
              </label>
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required
                className="w-full px-6 py-3.5 border border-white/10 rounded-2xl bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/50 focus:bg-white/10 transition-all font-medium"
              />
            </div>
          ))}

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              className="w-full py-4 px-6 text-white text-xs font-black uppercase tracking-[0.2em] bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-xl shadow-red-900/30 hover:shadow-red-600/40 hover:-translate-y-1 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100/10"
            >
              Inicializar Cuenta
            </button>
          </div>
        </form>

        <div className="mt-10 text-center space-y-4">
          <p className="text-[11px] text-gray-500 font-bold">
            ¿Ya tienes una membresía?{' '}
            <a href="/login" className="text-red-600 hover:text-red-500 font-black uppercase tracking-widest hover:underline transition-colors">
              Iniciar Sesión
            </a>
          </p>
          <a href="/" className="inline-block text-[10px] text-gray-600 hover:text-red-500 transition-colors uppercase font-black tracking-[0.3em] mt-4">
            ← Portal Principal
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
