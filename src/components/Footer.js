import React from 'react';
import bImg from '../assets/b-removebg-preview.png';
import rImg from '../assets/r-removebg-preview.png';
import oImg from '../assets/o-removebg-preview.png';
import mImg from '../assets/m-removebg-preview.png';
import iImg from '../assets/i-removebg-preview.png';
import cImg from '../assets/c-removebg-preview.png';
import hImg from '../assets/h-removebg-preview.png';
import aImg from '../assets/a-removebg-preview.png';
import tImg from '../assets/t-removebg-preview.png';

const Footer = () => {
  const year = new Date().getFullYear();
  const logoImages = [bImg, rImg, oImg, mImg, iImg, cImg, hImg, aImg, tImg];

  return (
    <footer className="bg-gradient-to-r from-black via-red-900 to-black text-white py-12 mt-20 border-t border-red-900/30 flex flex-col items-center shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-6">

        {/* Logo Section - Matching Header Style */}
        <div className="flex items-center justify-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
          {logoImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Letra ${index + 1}`}
              className="h-6 w-6 transition-transform hover:scale-110 filter drop-shadow-md object-contain"
            />
          ))}
        </div>

        <div className="space-y-2">


          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            &copy; {year} Jandosoft. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
};


export default Footer;
