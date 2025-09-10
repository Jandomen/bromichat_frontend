import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  const navigate = useNavigate();

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
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        navigate('/login'); // Redirige al login
      } else {
        alert('Error: respuesta del servidor inválida');
      }
    } catch (error) {
     // console.error('Registro error:', error);
      alert(error.response?.data?.error || 'Error al registrarse');
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black to-green-900">
      <div className="w-full max-w-md p-6 bg-black/60 backdrop-blur-md rounded-xl shadow-lg text-white">
        <h2 className="mb-6 text-2xl font-bold text-center text-green-400">Registrarse</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.name}>
              <label
                className="block mb-1 text-sm font-medium text-green-300"
                htmlFor={field.name}
              >
                {field.label}:
              </label>
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required
                className="w-full p-2 border border-green-400 rounded-md bg-black/30 text-green-100 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full p-2 text-black bg-green-400 rounded-lg shadow-md hover:bg-green-500 hover:text-white transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            Registrarse
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm">
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="text-green-300 hover:underline">
              Inicia sesión
            </a>
          </p>
          <p className="text-sm mt-1">
            <a href="/" className="text-green-300 hover:underline">
              Inicio
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
