import React, { useState } from 'react';

export default function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 sm:p-10 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Contenedor Central */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 transition-all duration-300">
          
          {/* Logo Corporativo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
              <span className="text-white font-black text-xl tracking-tighter">A</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 leading-none tracking-tight">
                ARCHIVE<span className="text-emerald-500 font-extrabold">X</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">SaaS Enterprise</span>
            </div>
          </div>

          {/* VISTA DE LOGIN */}
          {isLogin ? (
            <div className="space-y-6 animate-fade-in">
              {/* Encabezado */}
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Autenticación</h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Introduce tus credenciales institucionales para ingresar a la plataforma corporativa.
                </p>
              </div>

              {/* Formulario */}
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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

                {/* Clon reCAPTCHA */}
                <div className="w-[304px] h-[78px] bg-[#f9f9f9] border border-[#d3d3d3] rounded-sm flex items-center justify-between p-3 mx-auto shadow-[0_0_4px_rgba(0,0,0,0.05)] select-none">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        id="recaptcha-check-login"
                        checked={captchaChecked}
                        onChange={(e) => setCaptchaChecked(e.target.checked)}
                        className="w-7 h-7 border-2 border-[#c1c1c1] rounded-sm bg-white checked:bg-white checked:border-[#c1c1c1] focus:ring-0 focus:ring-offset-0 appearance-none cursor-pointer transition-all"
                      />
                      {captchaChecked && (
                        <span className="absolute text-emerald-600 text-xl font-bold pointer-events-none -mt-1 -ml-0.5">
                          ✓
                        </span>
                      )}
                    </div>
                    <label htmlFor="recaptcha-check-login" className="text-sm font-normal text-[#282828] cursor-pointer">
                      No soy un robot
                    </label>
                  </div>
                  <div className="flex flex-col items-center justify-center pr-1">
                    <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 4 4 0 0 0 4-4h-4a6 6 0 1 1 6-6h2a10 10 0 0 0-10-10z"/>
                    </svg>
                    <span className="text-[8px] text-[#555555] font-semibold mt-0.5 leading-none">reCAPTCHA</span>
                    <div className="flex gap-1 text-[7px] text-[#555555] mt-1 leading-none">
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="hover:underline">Privacidad</a>
                      <span>-</span>
                      <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="hover:underline">Términos</a>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all duration-150 shadow-sm active:scale-[0.99] mt-2"
                >
                  Acceder al Sistema
                </button>
              </form>

              {/* Toggle hacia Registro */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  ¿No tienes credenciales asignadas?{' '}
                  <button 
                    onClick={() => { setIsLogin(false); setCaptchaChecked(false); }} 
                    className="font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Solicita una cuenta
                  </button>
                </p>
              </div>
            </div>
          ) : (
            
            /* VISTA DE REGISTRO (SOLICITAR CUENTA) */
            <div className="space-y-6 animate-fade-in">
              {/* Encabezado */}
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Solicitud de Cuenta</h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Completa tus datos para enviar una solicitud de acceso al administrador del sistema.
                </p>
              </div>

              {/* Formulario de Registro */}
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Juan Pérez"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
                  />
                </div>

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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors duration-150"
                    >
                      {showConfirmPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>

                {/* Clon reCAPTCHA para Registro */}
                <div className="w-[304px] h-[78px] bg-[#f9f9f9] border border-[#d3d3d3] rounded-sm flex items-center justify-between p-3 mx-auto shadow-[0_0_4px_rgba(0,0,0,0.05)] select-none">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        id="recaptcha-check-reg"
                        checked={captchaChecked}
                        onChange={(e) => setCaptchaChecked(e.target.checked)}
                        className="w-7 h-7 border-2 border-[#c1c1c1] rounded-sm bg-white checked:bg-white checked:border-[#c1c1c1] focus:ring-0 focus:ring-offset-0 appearance-none cursor-pointer transition-all"
                      />
                      {captchaChecked && (
                        <span className="absolute text-emerald-600 text-xl font-bold pointer-events-none -mt-1 -ml-0.5">
                          ✓
                        </span>
                      )}
                    </div>
                    <label htmlFor="recaptcha-check-reg" className="text-sm font-normal text-[#282828] cursor-pointer">
                      No soy un robot
                    </label>
                  </div>
                  <div className="flex flex-col items-center justify-center pr-1">
                    <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 4 4 0 0 0 4-4h-4a6 6 0 1 1 6-6h2a10 10 0 0 0-10-10z"/>
                    </svg>
                    <span className="text-[8px] text-[#555555] font-semibold mt-0.5 leading-none">reCAPTCHA</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all duration-150 shadow-sm active:scale-[0.99] mt-2"
                >
                  Enviar Solicitud
                </button>
              </form>

              {/* Toggle hacia Login */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  ¿Ya tienes una cuenta asignada?{' '}
                  <button 
                    onClick={() => { setIsLogin(true); setCaptchaChecked(false); }} 
                    className="font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
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