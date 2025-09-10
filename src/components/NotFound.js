import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 p-4">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-xl mb-6">Página no encontrada</p>
      <Link to="/" className="text-blue-600 underline">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;
