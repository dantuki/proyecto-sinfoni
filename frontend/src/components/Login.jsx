import React, { useState } from 'react';
import fondoS from '../assets/fondoS.png';

export default function Login({ alAutenticar }) {
  // Manejo de vistas: 'login' | 'register' | 'forgot'
  const [vista, setVista] = useState('login');
  
  // Estados de los formularios
  const [formData, setFormData] = useState({
    cedula: '',
    nombre_completo: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'Profesor' // Valor por defecto del ENUM en tu SQL
  });

  const [captchaVerificado, setCaptchaVerificado] = useState(false);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Validaciones comunes de Frontend
  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const ejecutarValidaciones = (tipo) => {
    if (!validarEmail(formData.email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return false;
    }

    if (!captchaVerificado) {
      setError('Por favor, completa la verificación "No soy un robot".');
      return false;
    }

    if (tipo === 'register') {
      if (!formData.cedula || !formData.nombre_completo) {
        setError('Todos los campos son obligatorios.');
        return false;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return false;
      }
    }

    if (tipo === 'login' && !formData.password) {
      setError('La contraseña es obligatoria.');
      return false;
    }

    return true;
  };

  // Procesar el Inicio de Sesión
  const handleSubmitLogin = (e) => {
    e.preventDefault();
    if (!ejecutarValidaciones('login')) return;

    // Aquí conectarás tu fetch/axios al backend
    console.log("Enviando login al backend...", { email: formData.email, password: formData.password });
    
    // Simulación de respuesta exitosa del backend
    const usuarioSimulado = {
      nombre: "Usuario Autenticado",
      correo: formData.email,
      rol: "Admin", 
      token: "jwt-token-generado-por-backend"
    };
    alAutenticar(usuarioSimulado);
  };

  // Procesar el Registro de Usuario
  const handleSubmitRegister = (e) => {
    e.preventDefault();
    if (!ejecutarValidaciones('register')) return;

    // Aquí conectarás el POST a tu API (/api/register)
    console.log("Registrando usuario en la base de datos...", formData);
    
    setMensajeExito('¡Registro exitoso! Ya puedes iniciar sesión.');
    setTimeout(() => {
      setMensajeExito('');
      setVista('login');
      setCaptchaVerificado(false);
    }, 2500);
  };

  // Procesar Recuperación de Contraseña
  const handleSubmitForgot = (e) => {
    e.preventDefault();
    if (!validarEmail(formData.email)) {
      setError('Ingresa un correo válido.');
      return false;
    }
    if (!captchaVerificado) {
      setError('Completa la verificación de seguridad.');
      return false;
    }

    console.log("Solicitando enlace de recuperación para:", formData.email);
    setMensajeExito('Se ha enviado un enlace de restauración a tu Gmail.');
    setTimeout(() => {
      setMensajeExito('');
      setVista('login');
      setCaptchaVerificado(false);
    }, 4000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden font-sans">
      
      {/* Imagen de fondo controlada mediante assets */}
      <div className="absolute inset-0 z-0">
        <img 
          src={fondoS} 
          alt="Background" 
          className="w-full h-full object-cover opacity-30 filter blur-xs scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/85 to-transparent" />
      </div>

      {/* Tarjeta Contenedora Principal */}
      <div className="relative z-10 w-full max-w-4xl mx-4 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 min-h-[550px]">
        
        {/* Panel Izquierdo: Branding Corporativo */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 bg-gradient-to-b from-slate-900/40 to-transparent">
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
              Plataforma institucional para el control, auditoría y trazabilidad de solicitudes académicas y convocatorias de investigación.
            </p>
          </div>
          
          <div className="mt-8 md:mt-0">
            <p className="text-xs text-slate-500">
              Desarrollado para <span className="text-slate-300 font-semibold">SINFONI</span> &copy; 2026
            </p>
          </div>
        </div>

        {/* Panel Derecho: Formularios Dinámicos */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          
          {/* Alertas de error o éxito */}
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">{error}</div>}
          {mensajeExito && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl">{mensajeExito}</div>}

          {/* ================= VISTA: INICIAR SESIÓN ================= */}
          {vista === 'login' && (
            <form onSubmit={handleSubmitLogin} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Bienvenido</h2>
                <p className="text-xs text-slate-400 mt-1">Ingresa tus credenciales para acceder al sistema</p>
              </div>

              <div className="space-y-3">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Correo institucional" 
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
                <input 
                  type="password" 
                  name="password"
                  placeholder="Contraseña" 
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              <div className="text-right">
                <button 
                  type="button" 
                  onClick={() => { setVista('forgot'); setError(''); }} 
                  className="text-xs text-cyan-400 hover:underline bg-transparent border-none cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Módulo CAPTCHA */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer text-slate-300 text-xs">
                  <input 
                    type="checkbox" 
                    checked={captchaVerificado}
                    onChange={(e) => setCaptchaVerificado(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded border-slate-700 bg-slate-800"
                  />
                  <span>No soy un robot</span>
                </label>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-slate-500 font-bold tracking-widest">reCAPTCHA</span>
                  <span className="text-[7px] text-slate-600">Privacidad - Términos</span>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all duration-200"
              >
                Iniciar Sesión
              </button>

              <p className="text-center text-xs text-slate-400 mt-4">
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={() => { setVista('register'); setError(''); }} className="text-cyan-400 font-semibold hover:underline">
                  Regístrate aquí
                </button>
              </p>
            </form>
          )}

          {/* ================= VISTA: REGISTRO ================= */}
          {vista === 'register' && (
            <form onSubmit={handleSubmitRegister} className="space-y-3">
              <div>
                <h2 className="text-xl font-bold text-white">Crear Cuenta</h2>
                <p className="text-xs text-slate-400 mt-1">Registra tus datos de usuario en la plataforma</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  name="cedula"
                  placeholder="Cédula" 
                  value={formData.cedula}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
                <select 
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="Profesor">Profesor</option>
                  <option value="Evaluador">Evaluador</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <input 
                type="text" 
                name="nombre_completo"
                placeholder="Nombre Completo" 
                value={formData.nombre_completo}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />

              <input 
                type="email" 
                name="email"
                placeholder="Correo Electrónico" 
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="password" 
                  name="password"
                  placeholder="Contraseña" 
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="Confirmar" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Módulo CAPTCHA */}
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <label className="flex items-center gap-3 cursor-pointer text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={captchaVerificado}
                    onChange={(e) => setCaptchaVerificado(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded border-slate-700 bg-slate-800"
                  />
                  <span>No soy un robot</span>
                </label>
                <span className="text-[8px] text-slate-600 font-bold tracking-widest">reCAPTCHA</span>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-all"
              >
                Registrar Cuenta
              </button>

              <p className="text-center text-xs text-slate-400 mt-2">
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={() => { setVista('login'); setError(''); }} className="text-cyan-400 font-semibold hover:underline">
                  Inicia sesión
                </button>
              </p>
            </form>
          )}

          {/* ================= VISTA: RECUPERACIÓN ================= */}
          {vista === 'forgot' && (
            <form onSubmit={handleSubmitForgot} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Recuperar Acceso</h2>
                <p className="text-xs text-slate-400 mt-1">Ingresa tu correo para recibir un enlace de restauración</p>
              </div>

              <input 
                type="email" 
                name="email"
                placeholder="Correo electrónico registrado" 
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />

              {/* Módulo CAPTCHA */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer text-slate-300 text-xs">
                  <input 
                    type="checkbox" 
                    checked={captchaVerificado}
                    onChange={(e) => setCaptchaVerificado(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded border-slate-700 bg-slate-800"
                  />
                  <span>No soy un robot</span>
                </label>
                <span className="text-[9px] text-slate-500 font-bold tracking-widest">reCAPTCHA</span>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all"
              >
                Enviar Enlace a Gmail
              </button>

              <div className="text-center">
                <button type="button" onClick={() => { setVista('login'); setError(''); }} className="text-xs text-slate-400 hover:underline">
                  Volver al Inicio de Sesión
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}