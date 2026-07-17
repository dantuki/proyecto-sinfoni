import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export default function AuthContainer({ alAutenticar }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  const recaptchaRef = useRef(null);

  // Estados para capturar los datos de los formularios
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Profesor');
  
  // Estados para alertas y feedback
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Cambiar entre Login y Registro limpiando estados
  const alternarVista = (v) => {
    setIsLogin(v);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setCaptchaToken(null);
    setError('');
    setMensajeExito('');
    setEmail('');
    setPassword('');
    setNombreCompleto('');
    setRol('Profesor');
  };

  // 1. Manejador del Login (Entrar)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    if (!email || !password) {
      setError('Por favor, rellena todos los campos.');
      return;
    }

    if (!captchaToken) {
      setError('Por favor, completa el reCAPTCHA de seguridad.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captchaToken })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.details || 'Error al iniciar sesión.');
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setCaptchaToken(null);
        return;
      }

      // Guardamos tanto en sessionStorage como en localStorage para mayor seguridad e integración de componentes
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('userId', data.user.id);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);

      const usuarioFormateado = {
        id: data.user.id,
        nombre_completo: data.user.nombre_completo, 
        email: data.user.email,
        rol: data.user.rol 
      };

      alAutenticar(usuarioFormateado);

    } catch (err) {
      setError('No se pudo conectar con el servidor. Verifica que esté encendido.');
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken(null);
    }
  };

  // 2. Manejador del Registro (Crear Cuenta)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    if (!nombreCompleto || !email || !password) {
      setError('Todos los campos son obligatorios para el registro.');
      return;
    }

    if (!captchaToken) {
      setError('Por favor, completa el reCAPTCHA de seguridad.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: nombreCompleto,
          email,
          password,
          rol,
          captchaToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Mostramos el error del backend (incluidos detalles de SQL si ocurriesen)
        setError(data.error || data.details || 'Error al crear la cuenta.');
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setCaptchaToken(null);
        return;
      }

      setMensajeExito(`¡Cuenta con rol [${rol}] guardada con éxito en la base de datos!`);
      
      setTimeout(() => {
        alternarVista(true);
      }, 2000);

    } catch (err) {
      setError('Error de red. No se pudo guardar el usuario.');
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 sm:p-10 font-sans selection:bg-blue-500 selection:text-white">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 transition-all duration-300">
          
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => alternarVista(true)}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
              <span className="text-white font-black text-xl tracking-tighter">A</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 leading-none tracking-tight">
                ARCHIVE<span className="text-emerald-500 font-extrabold">X</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Gestion de Archivos</span>
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 rounded-xl border border-red-100 text-center whitespace-pre-wrap">
              ⚠️ {error}
            </div>
          )}
          {mensajeExito && (
            <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              🎉 {mensajeExito}
            </div>
          )}

          {isLogin ? (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inicia Sesión</h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Introduce tu Correo y Contraseña con la que iniciaste sesión 
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@gmail.com"
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <div className="flex justify-center my-2">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LfwDj4tAAAAANDLp_sh7UeUC1e8sgZ1LUfMBglj"
                    onChange={(token) => setCaptchaToken(token)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all duration-150 shadow-sm active:scale-[0.99] mt-2"
                >
                  Acceder al Sistema
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  ¿No tienes credenciales asignadas?{' '}
                  <button 
                    onClick={() => alternarVista(false)} 
                    className="font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Regístrate
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Solicitud de Cuenta</h1>
              </div>

              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@gmail.com"
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Rol de Usuario (Desarrollo)
                  </label>
                  <select 
                    value={rol} 
                    onChange={(e) => setRol(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 cursor-pointer"
                  >
                    <option value="Profesor">Profesor</option>
                    <option value="Admin">Administrador (Admin)</option>
                    <option value="Evaluador">Evaluador</option>
                  </select>
                </div>

                <div className="flex justify-center my-2">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LfwDj4tAAAAANDLp_sh7UeUC1e8sgZ1LUfMBglj"
                    onChange={(token) => setCaptchaToken(token)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all duration-150 shadow-sm active:scale-[0.99] mt-2"
                >
                  Registrarse
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  ¿Ya tienes una cuenta asignada?{' '}
                  <button 
                    onClick={() => alternarVista(true)} 
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