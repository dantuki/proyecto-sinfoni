import { useState } from 'react';

const Login = ({ alAutenticar }) => {
  const [rolSeleccionado, setRolSeleccionado] = useState('Usuario');

  const manejarLoginSimulado = (proveedor) => {
    // Aquí simulamos la respuesta del backend tras autenticarse con Microsoft o Google
    const usuarioSimulado = {
      nombre: 'Nelly Clavijo Bustos',
      correo: 'nelly.clavijo@ucc.edu.co',
      rol: rolSeleccionado, // 'Administrador' o 'Usuario'
      token: 'fake-jwt-token-12345'
    };
    
    alAutenticar(usuarioSimulado);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative px-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069')" }}></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/80 to-transparent z-0"></div>

      {/* Tarjeta de Login */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl z-10 text-white">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            <span className="text-[#5B9BD5]">ARCHIVE</span><span className="text-[#70AD47]">X</span>
          </h1>
          <p className="text-slate-400 text-sm">Sistema de Gestión Documental</p>
        </div>

        {/* Selector de Rol para la simulación */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Selecciona tu Rol</label>
          <div className="grid grid-cols-2 gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
            <button 
              type="button"
              onClick={() => setRolSeleccionado('Usuario')}
              className={`py-2 text-sm font-medium rounded-lg transition-all ${rolSeleccionado === 'Usuario' ? 'bg-[#5B9BD5] text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              👤 Usuario / Padre
            </button>
            <button 
              type="button"
              onClick={() => setRolSeleccionado('Administrador')}
              className={`py-2 text-sm font-medium rounded-lg transition-all ${rolSeleccionado === 'Administrador' ? 'bg-[#70AD47] text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              🔑 Administrador
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Botón de Microsoft */}
          <button 
            onClick={() => manejarLoginSimulado('Microsoft')}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 font-semibold py-3 px-4 rounded-xl hover:bg-slate-100 transition-all shadow-lg active:scale-95"
          >
            <img src="https://docs.microsoft.com/en-us/azure/active-directory/develop/media/howto-add-branding-in-azure-ad-apps/ms-symbollockup_mssymbol_16.png" alt="Microsoft" className="w-5 h-5" />
            Iniciar con tu cuenta Institucional
          </button>

          {/* Botón de Google */}
          <button 
            onClick={() => manejarLoginSimulado('Google')}
            className="w-full flex items-center justify-center gap-3 bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl hover:bg-slate-700 transition-all border border-white/10 active:scale-95"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google__G__Logo.svg" alt="Google" className="w-5 h-5" />
            Iniciar con Google
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          Protección de datos bajo entornos institucionales cifrados.
        </div>
      </div>
    </div>
  );
};

export default Login;