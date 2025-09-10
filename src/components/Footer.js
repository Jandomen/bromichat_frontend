import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
        <p className="text-base sm:text-lg">&copy; {year} Bromichat. Todos los derechos reservados.</p>
        <p className="text-sm sm:text-base text-gray-400">
         ❤️ Desarrollado  <span role="img" aria-label="corazón"></span> por <strong>Jandochat</strong>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
