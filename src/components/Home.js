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

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const letters = [b, r, o, m, i, c, h, a, t];
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-red-900 to-black text-center xs:p-8 p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-800/20 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-red-900/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Logo con letras */}
      <div className="flex flex-nowrap justify-center items-center gap-[0.1rem] xs:gap-0.5 sm:gap-4 mb-10 sm:mb-16 relative z-10 w-full px-1 overflow-visible">
        {letters.map((letter, index) => {
          // Ajustamos el scaleFactor para que no sea tan agresivo y las letras finales no desaparezcan
          const scaleFactor = 1 - (index * 0.03); 
          return (
            <img
              key={index}
              src={letter}
              alt={`letter-${index}`}
              className="drop-shadow-[0_4px_10px_rgba(255,0,0,0.3)] hover:scale-110 transition-transform duration-300 pointer-events-none sm:pointer-events-auto min-w-[14px] xs:min-w-[24px] sm:min-w-[32px] flex-shrink"
              style={{
                width: `calc(${scaleFactor * 8.5}vw)`,
                maxWidth: "110px",
              }}
            />
          );
        })}
      </div>

      {/* Botones estilizados */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 relative z-10 w-full max-w-[280px] sm:max-w-none px-4">
        <a href="/login">
          <button
            className="
              relative w-full sm:w-auto px-10 py-4 rounded-full
              text-white font-bold tracking-wider text-sm uppercase
              bg-transparent border border-red-500
              shadow-[0_0_15px_rgba(255,0,0,0.2)]
              hover:bg-red-600 hover:text-white hover:border-red-600
              hover:shadow-[0_0_25px_rgba(255,0,0,0.6)]
              hover:-translate-y-1
              active:scale-95
              transition-all duration-300
              group
            "
          >
            Iniciar Sesión
          </button>
        </a>
        <a href="/register">
          <button
            className="
              relative w-full sm:w-auto px-10 py-4 rounded-full
              text-white font-bold tracking-wider text-sm uppercase
              bg-red-700 border border-transparent
              shadow-[0_0_20px_rgba(220,38,38,0.4)]
              hover:bg-red-800 hover:text-white
              hover:shadow-[0_0_30px_rgba(220,38,38,0.7)]
              hover:-translate-y-1
              active:scale-95
              transition-all duration-300
            "
          >
            Registrarse
          </button>
        </a>
      </div>

      <footer className="absolute bottom-6 text-white/30 text-xs z-10">
        &copy; {new Date().getFullYear()} Bromichat. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Home;
