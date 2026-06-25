import React, { useState } from 'react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 sm:p-10 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Contenedor Central del Formulario */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          
          {/* Logo Corporativo */}
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 text-white font-black p-2 rounded-xl text-xl tracking-tighter shadow-sm shadow-blue-200 w-10 h-10 flex items-center justify-center">
              A
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 leading-none tracking-tight">ARCHIVEX</h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Saas Enterprise</span>
            </div>
          </div>

          {/* Encabezado */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Autenticación</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Introduce tus credenciales institucionales para ingresar a la plataforma corporativa.
            </p>
          </div>

          {/* Formulario */}
          <form className="space-y-4.5" onSubmit={(e) => e.preventDefault()}>
            
            {/* Input: Correo */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Correo Corporativo
              </label>
              <input
                type="email"
                placeholder="ejemplo@sinfoni.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Input: Contraseña */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Contraseña
                </label>
                <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors duration-150"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {/* Recuadro de reCAPTCHA */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                />
                <span className="text-xs font-medium text-slate-600">No soy un robot</span>
              </label>
              <div className="flex flex-col items-center justify-center scale-75 origin-right opacity-50">
                <span className="text-[9px] font-bold text-slate-500 tracking-tight">reCAPTCHA</span>
                <span className="text-[7px] text-slate-400">Privacy - Terms</span>
              </div>
            </div>

            {/* Botón de Acción */}
            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all duration-150 shadow-sm active:scale-[0.99] mt-2"
            >
              Acceder al Sistema
            </button>
          </form>

          {/* Registro / Soporte */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              ¿No tienes credenciales asignadas?{' '}
              <a href="#" className="font-semibold text-blue-600 hover:underline">
                Solicita una cuenta
              </a>
            </p>
          </div>
          
        </div>
      </div>

      {/* Footer Fijo Inferior */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center border-t border-slate-200/60 pt-4 text-[11px] font-medium text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          Infraestructura Segura (SSL)
        </span>
        <span>Versión 2026.1</span>
      </div>

    </div>
  );
}