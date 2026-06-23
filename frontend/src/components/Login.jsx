import React, { useState } from 'react';
import { useMsal } from "@azure/msal-react";

export default function Login({ alAutenticar }) {
  const { instance } = useMsal();
  const [rolSeleccionado, setRolSeleccionado] = useState('Usuario');

  // Manejador del Login Oficial de Microsoft
  const handleMicrosoftLogin = () => {
    const loginRequest = {
      scopes: ["User.Read"]
    };

    instance.loginPopup(loginRequest)
      .then(response => {
        console.log("Login exitoso con Microsoft:", response);
        
        // Estructuramos la data del token devuelto por Azure
        const usuarioAutenticado = {
          nombre: response.account.name,
          correo: response.account.username,
          rol: rolSeleccionado, // Le asigna el rol que esté marcado abajo para pruebas
          token: response.accessToken
        };

        // Pasamos el usuario a App.jsx para romper la pantalla de Login e ir al Dashboard
        alAutenticar(usuarioAutenticado);
      })
      .catch(error => {
        console.error("Error en la autenticación:", error);
      });
  };

  // Login rápido simulado al dar clic a los botones de rol de prueba
  const handleSimulatedLogin = (rol) => {
    const usuarioSimulado = {
      nombre: rol === 'Administrador' ? 'Miguel Administrador' : 'Daniel Usuario',
      correo: rol === 'Administrador' ? 'admin@sinfoni.com' : 'user@sinfoni.com',
      rol: rol,
      token: "mock-token-12345"
    };
    alAutenticar(usuarioSimulado);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden font-sans">
      
      {/* Imagen de fondo con overlay oscuro */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/fondoS.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-40 filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/80 to-transparent" />
      </div>

      {/* Tarjeta Contenedora Principal */}
      <div className="relative z-10 w-full max-w-4xl mx-4 bg-slate-900/75 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300">
        
        {/* Panel Izquierdo: Branding */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700/50 bg-gradient-to-b from-slate-800/30 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                ARCHIVE<span className="text-emerald-400">X</span>
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              Sistema de Gestión Documental
            </h1>
            <p className="mt-3 text-sm text-slate-400 max-w-sm">
              Accede de manera segura para gestionar, auditar y controlar toda la documentación institucional en un solo lugar.
            </p>
          </div>
          
          <div className="mt-8 md:mt-0">
            <p className="text-xs text-slate-500">
              Desarrollado para <span className="text-slate-300 font-semibold">SINFONI</span> &copy; 2026
            </p>
          </div>
        </div>

        {/* Panel Derecho: Controles de Acceso */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Iniciar Sesión</h2>
            <p className="text-xs text-slate-400 mt-1">Selecciona tu método de autenticación federada</p>
          </div>

          <div className="space-y-4">
            {/* Botón de Microsoft */}
            <button
              onClick={handleMicrosoftLogin}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-semibold py-3 px-4 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 23 23" 
                fill="none" 
                className="w-5 h-5 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 0H11V11H0V0Z" fill="#F25022"/>
                <path d="M12 0H23V11H12V0Z" fill="#7FBA00"/>
                <path d="M0 12H11V23H0V12Z" fill="#00A4EF"/>
                <path d="M12 12H23V23H12V12Z" fill="#FFB900"/>
              </svg>
              <span>Iniciar con cuenta Microsoft ({rolSeleccionado})</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-700/60"></div>
              <span className="flex-shrink mx-4 text-xs tracking-widest text-slate-500 uppercase font-medium">Roles de Prueba</span>
              <div className="flex-grow border-t border-slate-700/60"></div>
            </div>

            {/* Selectores de Rol para testing / Atajo de login rápido */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => { setRolSeleccionado('Usuario'); handleSimulatedLogin('Usuario'); }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/40 border transition-all duration-200 group ${rolSeleccionado === 'Usuario' ? 'border-blue-500/80 bg-slate-800 text-blue-400' : 'border-slate-700/50 text-slate-300 hover:text-blue-400 hover:border-blue-500/50'}`}
              >
                <span className="text-lg mb-1 group-hover:scale-110 transition-transform">👤</span>
                <span className="text-xs font-medium">Usuario / Padre</span>
              </button>
              
              <button 
                type="button"
                onClick={() => { setRolSeleccionado('Administrador'); handleSimulatedLogin('Administrador'); }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/40 border transition-all duration-200 group ${rolSeleccionado === 'Administrador' ? 'border-emerald-500/80 bg-slate-800 text-emerald-400' : 'border-slate-700/50 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50'}`}
              >
                <span className="text-lg mb-1 group-hover:scale-110 transition-transform">🔑</span>
                <span className="text-xs font-medium">Administrador</span>
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            Autenticación segura federada protegida por Microsoft Entra ID.
          </p>
        </div>

      </div>
    </div>
  );
}