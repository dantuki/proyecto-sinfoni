import { useState, useEffect } from 'react';
import Login from './components/Login';
import InicioCards from './components/InicioCards';
import DatosPersonales from './components/DatosPersonales';
import Noticias from './components/Noticias';
import Convocatorias from "./components/Convocatorias";
import ConvocatoriasAbiertas from "./components/ConvocatoriasAbiertas";
import CrearConvocatoria from "./components/CrearConvocatoria";
import MisSolicitudes from "./components/MisSolicitudes";

const ControlUsuarios = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Control de Usuarios</h2>
      <p className="text-slate-500">Módulo administrativo para la gestión de roles, accesos y usuarios del sistema.</p>
    </div>
  );
};

function App() {
  const [usuario, setUsuario] = useState(null); 
  const [vistaActual, setVistaActual] = useState('inicio');
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState(null);

  if (!usuario) return <Login alAutenticar={setUsuario} />;

  const cambiarVistaLimpia = (nuevaVista) => {
    setConvocatoriaSeleccionada(null);
    setVistaActual(nuevaVista);
  };

  const renderizarVista = () => {
    switch(vistaActual) {
      case 'inicio': 
        return <InicioCards cambiarVista={setVistaActual} usuario={usuario} />;
      case 'datos_personales': 
        return <DatosPersonales usuario={usuario} />;
      case 'noticias': 
        return <Noticias usuario={usuario} />;
      case 'formulario_radicacion': 
        return <Convocatorias usuario={usuario} convocatoria={convocatoriaSeleccionada} />;
      case 'crear_convocatoria': 
        return (
          <CrearConvocatoria 
            convocatoriaAEditar={convocatoriaSeleccionada} 
            alFinalizar={() => setVistaActual('convocatorias_abiertas')} 
          />
        );
      case 'convocatorias_abiertas': 
        return (
          <ConvocatoriasAbiertas 
            usuario={usuario} 
            alSeleccionarConvocatoria={(c) => { 
              setConvocatoriaSeleccionada(c); 
              setVistaActual('formulario_radicacion'); 
            }} 
            alEditarConvocatoria={(c) => {
              setConvocatoriaSeleccionada(c);
              setVistaActual('crear_convocatoria');
            }}
          />
        );
      case 'mis_solicitudes':
        return (
          <MisSolicitudes 
            usuario={usuario} 
            alRedireccionarConvocatorias={() => setVistaActual('convocatorias_abiertas')} 
          />
        );
      case 'control_usuarios': 
        return <ControlUsuarios />;
      default: 
        return (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md mx-auto mt-10">
            <span className="text-4xl">🛠️</span>
            <h3 className="text-lg font-bold text-slate-700 mt-4">Módulo en Construcción</h3>
            <p className="text-slate-400 text-sm mt-2">Esta sección estará lista en las próximas fases del desarrollo.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      {/* Sidebar de Navegación */}
      <aside className="w-64 bg-[#2d3748] text-white flex flex-col shadow-2xl">
        <div 
          className="p-6 bg-white border-b border-slate-200 text-center cursor-pointer" 
          onClick={() => cambiarVistaLimpia('inicio')}
        >
          <h1 className="text-2xl font-extrabold tracking-tight text-[#5B9BD5]">SINFONI</h1>
        </div>

        <nav className="flex-1 py-4 space-y-1">
          <button 
            onClick={() => cambiarVistaLimpia('inicio')} 
            className="w-full text-left px-6 py-3 hover:bg-[#5B9BD5] transition-colors flex items-center gap-3"
          >
            <span>🏠</span> Inicio
          </button>
          
          <button 
            onClick={() => cambiarVistaLimpia('convocatorias_abiertas')} 
            className="w-full text-left px-6 py-3 hover:bg-[#5B9BD5] transition-colors flex items-center gap-3"
          >
            <span>📢</span> Convocatorias
          </button>

          {/* Menú visible para Docentes (Historial de Radicaciones) */}
          {usuario.rol === 'Docente' && (
            <button 
              onClick={() => cambiarVistaLimpia('mis_solicitudes')} 
              className="w-full text-left px-6 py-3 hover:bg-[#5B9BD5] transition-colors flex items-center gap-3"
            >
              <span>📁</span> Mis Solicitudes
            </button>
          )}

          {usuario.rol === 'Admin' && (
            <>
              <button 
                onClick={() => cambiarVistaLimpia('crear_convocatoria')} 
                className="w-full text-left px-6 py-3 hover:bg-[#5B9BD5] transition-colors flex items-center gap-3"
              >
                <span>➕</span> Crear Convocatoria
              </button>
              
              <button 
                onClick={() => cambiarVistaLimpia('control_usuarios')} 
                className="w-full text-left px-6 py-3 hover:bg-[#5B9BD5] transition-colors flex items-center gap-3"
              >
                <span>👥</span> Control Usuarios
              </button>
            </>
          )}
        </nav>
      </aside>

      {/* Área de Contenido Principal */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
          <span className="font-semibold text-slate-700">
            Usuario: <strong className="text-slate-900 font-bold">{usuario.nombre_completo}</strong>
          </span>
          <button 
            onClick={() => setUsuario(null)} 
            className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-full font-semibold transition-colors"
          >
            Cerrar Sesión
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          {renderizarVista()}
        </div>
      </main>
    </div>
  );
}

export default App;