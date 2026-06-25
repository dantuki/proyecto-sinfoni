import React, { useState } from 'react';

export default function Login({ alAutenticar }) {
  // Manejo de estados de la interfaz: 'login' | 'register' | 'forgot'
  const [vista, setVista] = useState('login');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [captchaVerificado, setCaptchaVerificado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Formulario unificado adaptado a tu esquema SQL (sinfoni_db)
  const [formData, setFormData] = useState({
    cedula: '',
    nombre_completo: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'Profesor' // Valor por defecto en la base de datos
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const procesarValidacion = (tipo) => {
    if (!validarEmail(formData.email)) {
      setError('Escribe una dirección de correo electrónico institucional válida.');
      return false;
    }
    if (!captchaVerificado) {
      setError('La verificación de seguridad anti-bots es obligatoria.');
      return false;
    }
    if (tipo === 'register') {
      if (!formData.cedula || !formData.nombre_completo) {
        setError('Todos los campos de identidad son requeridos.');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Por seguridad, la contraseña debe contener al menos 6 caracteres.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('La confirmación no coincide con la contraseña ingresada.');
        return false;
      }
    }
    if (tipo === 'login' && !formData.password) {
      setError('La contraseña de acceso es requerida.');
      return false;
    }
    return true;
  };

  const ejecutarSubmitLogin = (e) => {
    e.preventDefault();
    if (!procesarValidacion('login')) return;

    setLoading(true);
    // Simulación de latencia de red para mostrar el estado de carga profesional
    setTimeout(() => {
      setLoading(false);
      const autenticacionCorrecta = {
        nombre: formData.email.split('@')[0].toUpperCase(),
        correo: formData.email,
        rol: 'Admin', // Simulación de rol retornado por la base de datos
        token: 'session_jwt_secure_token_2026'
      };
      alAutenticar(autenticacionCorrecta);
    }, 1200);
  };

  const ejecutarSubmitRegister = (e) => {
    e.preventDefault();
    if (!procesarValidacion('register')) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMensajeExito('Registro procesado correctamente. Cuenta creada en sinfoni_db.');
      setTimeout(() => {
        setMensajeExito('');
        setVista('login');
        setCaptchaVerificado(false);
      }, 2000);
    }, 1200);
  };

  const ejecutarSubmitForgot = (e) => {
    e.preventDefault();
    if (!validarEmail(formData.email)) {
      setError('Ingresa un correo válido para buscar la cuenta.');
      return;
    }
    if (!captchaVerificado) {
      setError('Por favor confirma que no eres un robot.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMensajeExito('Se ha enviado un token criptográfico de restauración a tu Gmail.');
      setTimeout(() => {
        setMensajeExito('');
        setVista('login');
        setCaptchaVerificado(false);
      }, 3500);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-white flex text-slate-900 font-sans antialiased">
      
      {/* COLUMNA IZQUIERDA: Formulario de Autenticación */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-white z-10 shadow-2xl lg:shadow-none">
        
        {/* Encabezado / Identidad de la Marca */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
              <span className="text-white font-black text-lg tracking-tighter">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900">
                ARCHIVE<span className="text-emerald-500 font-extrabold">X</span>
              </span>
              <span className="text-[9px] text-slate-400 font-medium tracking-wider -mt-1 uppercase">SaaS Enterprise</span>
            </div>
          </div>
        </div>

        {/* Contenedor Central de Formularios con Ancho Controlado */}
        <div className="w-full max-w-md mx-auto my-auto py-12">
          
          {/* Feedback Visual de Alertas */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-100 flex items-center gap-2 animate-fade-in">
              <span className="text-sm">⚠️</span> {error}
            </div>
          )}
          {mensajeExito && (
            <div className="mb-6 p-3.5 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-xl border border-emerald-100 flex items-center gap-2 animate-fade-in">
              <span className="text-sm">✨</span> {mensajeExito}
            </div>
          )}

          {/* ================= VISTA: INICIAR SESIÓN ================= */}
          {vista === 'login' && (
            <form onSubmit={ejecutarSubmitLogin} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Autenticación</h2>
                <p className="text-xs text-slate-500 mt-2">
                  Introduce tus credenciales institucionales para ingresar a la plataforma corporativa.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Correo Corporativo</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@sinfoni.com" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all placeholder-slate-400 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Contraseña</label>
                    <button 
                      type="button" 
                      onClick={() => { setVista('forgot'); setError(''); }}
                      className="text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={mostrarPassword ? "text" : "password"} 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all placeholder-slate-400 font-mono tracking-widest"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-medium"
                    >
                      {mostrarPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Módulo CAPTCHA Premium */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between transition-all hover:bg-slate-50/50">
                <label className="flex items-center gap-3 cursor-pointer text-slate-700 text-xs font-medium select-none">
                  <input 
                    type="checkbox" 
                    checked={captchaVerificado}
                    onChange={(e) => setCaptchaVerificado(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 bg-white transition-all cursor-pointer"
                  />
                  <span>No soy un robot</span>
                </label>
                <div className="flex flex-col items-end opacity-60">
                  <span className="text-[9px] text-slate-600 font-black tracking-widest">reCAPTCHA</span>
                  <span className="text-[7px] text-slate-500">Security Privacy</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-slate-900/10 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Acceder al Sistema"}
              </button>

              <p className="text-center text-xs text-slate-500 pt-2">
                ¿No tienes credenciales asignadas?{' '}
                <button type="button" onClick={() => { setVista('register'); setError(''); }} className="text-blue-600 font-semibold hover:underline">
                  Solicita una cuenta
                </button>
              </p>
            </form>
          )}

          {/* ================= VISTA: REGISTRO SOLICITUD ================= */}
          {vista === 'register' && (
            <form onSubmit={ejecutarSubmitRegister} className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Formulario de Registro</h2>
                <p className="text-xs text-slate-500 mt-2">Ingresa tu información técnica para darte de alta en el sistema.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Documento / Cédula</label>
                  <input 
                    type="text" 
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleChange}
                    placeholder="1088......" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Rol Institucional</label>
                  <select 
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer font-medium"
                  >
                    <option value="Profesor">Profesor / Investigador</option>
                    <option value="Evaluador">Evaluador Externo</option>
                    <option value="Admin">Administrador General</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Nombre Completo</label>
                <input 
                  type="text" 
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  placeholder="Escribe tus nombres y apellidos" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Correo Electrónico</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="usuario@sinfoni.com" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Contraseña</label>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 carac." 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Confirmar</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repite la contraseña" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Módulo CAPTCHA para Registro */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <label className="flex items-center gap-3 cursor-pointer text-slate-700 font-medium">
                  <input 
                    type="checkbox" 
                    checked={captchaVerificado}
                    onChange={(e) => setCaptchaVerificado(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span>Verificar identidad humana</span>
                </label>
                <span className="text-[8px] text-slate-400 font-bold tracking-widest">reCAPTCHA</span>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-blue-600/10 flex items-center justify-center"
              >
                {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Completar Registro Institucional"}
              </button>

              <p className="text-center text-xs text-slate-500 mt-2">
                ¿Ya posees una cuenta registrada?{' '}
                <button type="button" onClick={() => { setVista('login'); setError(''); }} className="text-blue-600 font-semibold hover:underline">
                  Inicia sesión
                </button>
              </p>
            </form>
          )}

          {/* ================= VISTA: RECUPERACIÓN ================= */}
          {vista === 'forgot' && (
            <form onSubmit={ejecutarSubmitForgot} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Recuperación de Cuenta</h2>
                <p className="text-xs text-slate-500 mt-2">Introduce tu dirección de correo electrónico para buscar tu perfil en la base de datos.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Correo de Recuperación</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu_usuario@sinfoni.com" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer text-slate-300 text-xs">
                  <input 
                    type="checkbox" 
                    checked={captchaVerificado}
                    onChange={(e) => setCaptchaVerificado(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 bg-white cursor-pointer"
                  />
                  <span className="text-slate-700 font-medium">Confirmar proceso legítimo</span>
                </label>
                <span className="text-[9px] text-slate-400 font-bold tracking-widest">reCAPTCHA</span>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center"
              >
                {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Enviar Enlace Seguro"}
              </button>

              <div className="text-center">
                <button type="button" onClick={() => { setVista('login'); setError(''); }} className="text-xs text-slate-500 font-semibold hover:text-slate-800 transition-colors">
                  ← Volver a la pantalla de ingreso
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer Informativo de la Columna */}
        <div className="text-xs text-slate-400 font-medium flex justify-between items-center border-t border-slate-100 pt-4">
          <span>Infraestructura Segura (SSL)</span>
          <span className="text-slate-300">|</span>
          <span>Versión 2026.1</span>
        </div>
      </div>

      {/* COLUMNA DERECHA: Visual Modular de Inteligencia Documental (Oculto en móviles) */}
      <div className="hidden lg:flex lg:w-[55%] bg-slate-950 p-12 flex-col justify-between relative overflow-hidden">
        
        {/* Efecto de luces ambientales abstractas de fondo */}
        <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Cuadrícula de fondo sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        {/* Eslogan de la Aplicación */}
        <div className="relative z-10 max-w-md">
          <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Plataforma Institucional
          </span>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mt-6 leading-tight">
            "El poder del conocimiento, en un solo lugar."
          </h2>
        </div>

        {/* COMPONENTE INTERACTIVO DE UI EN CÓDIGO (Simulación de Gestión de Flujo Documental) */}
        <div className="relative z-10 w-full max-w-xl mx-auto my-auto bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-red-500 rounded-full" />
              <div className="h-3 w-3 bg-yellow-500 rounded-full" />
              <div className="h-3 w-3 bg-green-500 rounded-full" />
              <span className="text-xs text-slate-400 font-mono ml-2">monitor_solicitudes_trazabilidad.log</span>
            </div>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-mono">
              Live Monitor
            </span>
          </div>

          <div className="space-y-4">
            {/* Registro de Auditoría 1 */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between transition-all hover:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">
                  PDF
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200">Propuesta_Investigacion_2026.pdf</span>
                  <span className="text-[10px] text-slate-500">Convocatoria General • Hash Encriptado</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                  Aprobado
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Hace 2m</span>
              </div>
            </div>

            {/* Registro de Auditoría 2 */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between transition-all hover:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold">
                  DOC
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200">Recurso_Reposicion_Sede_Pereira.docx</span>
                  <span className="text-[10px] text-slate-500">Solicitud #4829 • Auditado por Evaluador</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                  En Evaluación
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Hace 14m</span>
              </div>
            </div>

            {/* Módulo de Métricas e Indicadores de Rendimiento */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block font-medium uppercase tracking-wider">Trazabilidad Total</span>
                <span className="text-lg font-bold text-white mt-0.5 block">99.98%</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block font-medium uppercase tracking-wider">Solicitudes Activas</span>
                <span className="text-lg font-bold text-blue-400 mt-0.5 block">142</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block font-medium uppercase tracking-wider">Nodos de Auditoría</span>
                <span className="text-lg font-bold text-emerald-400 mt-0.5 block">3 Sedes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje inferior del Branding */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Sistema de Control y Gestión Documental</span>
          <span>SINFONI Cloud Engine</span>
        </div>

      </div>

    </div>
  );
}