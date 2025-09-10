import React from "react";
import b from "../assets/b-removebg-preview.png";
import r from "../assets/r-removebg-preview.png";
import o from "../assets/o-removebg-preview.png";
import m from "../assets/m-removebg-preview.png";
import i from "../assets/i-removebg-preview.png";
import c from "../assets/c-removebg-preview.png";
import h from "../assets/h-removebg-preview.png";
import a from "../assets/a-removebg-preview.png";
import t from "../assets/t-removebg-preview.png";

const Home = () => {
  const letters = [b, r, o, m, i, c, h, a, t];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black to-red-600 text-center p-8 relative overflow-hidden">
      {/* Logo con letras */}
      <div className="flex flex-nowrap justify-center gap-2 sm:gap-4 mb-10 overflow-hidden">
        {letters.map((letter, index) => {
          const scaleFactor = 1 - index * 0.05;
          return (
            <img
              key={index}
              src={letter}
              alt={`letter-${index}`}
              className="drop-shadow-lg hover:scale-110 transition-transform"
              style={{
                width: `calc(${scaleFactor * 10}vw)`,
                maxWidth: "120px",
                minWidth: "28px",
              }}
            />
          );
        })}
      </div>

      {/* Botones estilizados */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <a href="/login">
          <button
            className="
              relative w-full sm:w-auto px-8 py-3 rounded-xl
              text-white font-semibold tracking-wide
              bg-gradient-to-r from-red-700 via-black to-red-700
              border border-red-400/30
              shadow-[0_0_20px_rgba(255,0,0,0.4)]
              hover:shadow-[0_0_30px_rgba(255,0,0,0.6)]
              hover:scale-105
              transition-all duration-300
            "
          >
            Iniciar Sesión
          </button>
        </a>
        <a href="/register">
          <button
            className="
              relative w-full sm:w-auto px-8 py-3 rounded-xl
              text-white font-semibold tracking-wide
              bg-gradient-to-r from-black via-red-700 to-black
              border border-red-400/30
              shadow-[0_0_20px_rgba(0,0,0,0.5)]
              hover:shadow-[0_0_30px_rgba(255,0,0,0.6)]
              hover:scale-105
              transition-all duration-300
            "
          >
            Registrarse
          </button>
        </a>
      </div>
    </div>
  );
};

export default Home;
