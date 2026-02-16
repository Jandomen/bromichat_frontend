import React from 'react';
import { Link } from 'react-router-dom';
import b from "../assets/b-removebg-preview.png";
import r from "../assets/r-removebg-preview.png";
import o from "../assets/o-removebg-preview.png";
import m from "../assets/m-removebg-preview.png";
import i from "../assets/i-removebg-preview.png";
import c from "../assets/c-removebg-preview.png";
import h from "../assets/h-removebg-preview.png";
import a from "../assets/a-removebg-preview.png";
import t from "../assets/t-removebg-preview.png";

const NotFound = () => {
  const letters = [b, r, o, m, i, c, h, a, t];

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-black via-red-900 to-black text-center p-8 relative overflow-hidden">

      {/* Background Ambience (Same as Home) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-800/20 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-red-900/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated 404 Text */}
        <h1 className="text-[10rem] md:text-[14rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 drop-shadow-2xl mb-8">
          404
        </h1>

        {/* Floating Letters Logo */}
        <div className="flex flex-nowrap justify-center gap-1 sm:gap-3 mb-12 overflow-hidden">
          {letters.map((letter, index) => {
            const scaleFactor = 1 - index * 0.05;
            return (
              <img
                key={index}
                src={letter}
                alt={`letter-${index}`}
                className="drop-shadow-[0_4px_10px_rgba(255,0,0,0.3)] hover:scale-110 hover:-translate-y-2 transition-transform duration-500"
                style={{
                  width: `calc(${scaleFactor * 8}vw)`, // Slightly smaller than Home
                  maxWidth: "90px",
                  minWidth: "24px",
                  animation: `float 6s ease-in-out infinite ${index * 0.2}s`
                }}
              />
            );
          })}
        </div>

        <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Página no encontrada</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-10 text-base">
          Parece que te has perdido en el espacio digital de BromiChat.
        </p>

        <Link to="/">
          <button className="
            relative px-10 py-4 rounded-full
            text-white font-bold tracking-wider text-sm uppercase
            bg-red-700 border border-transparent
            shadow-[0_0_20px_rgba(220,38,38,0.4)]
            hover:bg-red-800 hover:text-white
            hover:shadow-[0_0_30px_rgba(220,38,38,0.7)]
            hover:-translate-y-1
            active:scale-95
            transition-all duration-300
          ">
            Volver al Inicio
          </button>
        </Link>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
