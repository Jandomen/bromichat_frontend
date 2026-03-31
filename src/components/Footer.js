import React from 'react';
import { Link } from 'react-router-dom';
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
    <footer className="bg-gradient-to-r from-black via-red-900 to-black text-white py-12 border-t border-red-900/30 flex flex-col items-center shadow-[0_-20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-red-600/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 text-center space-y-6 relative z-10">
        {/* Logo Section - Matching Header Style */}
        <div className="flex items-center justify-center gap-1.5 opacity-90 hover:opacity-100 transition-all duration-500 group cursor-pointer">
          {logoImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Letra ${index + 1}`}
              className="h-6 w-6 sm:h-8 sm:w-8 transition-all hover:scale-125 hover:rotate-3 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] brightness-110 object-contain"
            />
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-[7.5px] xs:text-[8px] sm:text-[10px] font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] brightness-125 animate-pulse-slow">
            &copy; {year} Bromichat. Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/privacy" className="text-[7px] sm:text-[8px] font-bold text-gray-500 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all uppercase tracking-widest cursor-pointer">
              Privacidad
            </Link>
            <Link to="/terms" className="text-[7px] sm:text-[8px] font-bold text-gray-500 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all uppercase tracking-widest cursor-pointer">
              Términos
            </Link>
            <Link to="/support" className="text-[7px] sm:text-[8px] font-bold text-gray-500 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all uppercase tracking-widest cursor-pointer">
              Soporte
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
