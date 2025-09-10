import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BACKEND}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      if (token && user) {
        login({ token, user });
        navigate('/dashboard');
      } else {
        alert('Error: respuesta del servidor inválida');
      }
    } catch (error) {
     // console.error('Login error:', error);
      alert(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black to-blue-900">
      <div className="w-full max-w-md p-6 bg-black/60 backdrop-blur-md rounded-xl shadow-lg text-white">
        <h2 className="mb-6 text-2xl font-bold text-center text-blue-400">Iniciar Sesión</h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block mb-1 text-sm font-medium text-blue-300" htmlFor="email">Correo electrónico:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-blue-400 rounded-md bg-black/30 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-blue-300" htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-blue-400 rounded-md bg-black/30 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 text-black bg-blue-400 rounded-lg shadow-md hover:bg-blue-500 hover:text-white transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Ingresar
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm">¿No tienes una cuenta? <a href="/register" className="text-blue-300 hover:underline">Regístrate</a></p>
          <p className="text-sm mt-1"><a href="/" className="text-blue-300 hover:underline">Inicio</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
