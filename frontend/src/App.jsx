import { useState, useEffect } from 'react';
import Login from './components/Login';
import InicioCards from './components/InicioCards';
import DatosPersonales from './components/DatosPersonales';
import Noticias from './components/Noticias';
import FormularioSolicitud from './components/FormularioSolicitud';
import Convocatorias from "./components/Convocatorias";
import ConvocatoriasAbiertas from "./components/ConvocatoriasAbiertas";
import CrearConvocatoria from "./components/CrearConvocatoria";

// ... (El componente ControlUsuarios lo mantienes exactamente igual como lo tienes ahora) ...

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
      case 'inicio': return <InicioCards cambiarVista={setVistaActual} usuario={usuario} />;
      case 'datos_personales': return <DatosPersonales usuario={usuario} />;
      case 'noticias': return <Noticias usuario={usuario} />;
      case 'formulario_radicacion': return <Convocatorias usuario={usuario} convocatoria={convocatoriaSeleccionada} />;
      case 'crear_convocatoria': return <CrearConvocatoria convocatoriaAEditar={convocatoriaSeleccionada} alFinalizar={() => setVistaActual('convocatorias_abiertas')} />;
      case 'convocatorias_abiertas': return <ConvocatoriasAbiertas usuario={usuario} alSeleccionarConvocatoria={(c) => { setConvocatoriaSeleccionada(c); setVistaActual('formulario_radicacion'); }} />;
      case 'control_usuarios': return <ControlUsuarios />;
      default: return <div className="text-white p-10">Módulo en construcción</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      <aside className="w-64 bg-[#2d3748] text-white flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="p-6 bg-white border-b border-slate-200 text-center cursor-pointer" onClick={() => cambiarVistaLimpia('inicio')}>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#5B9BD5]">ARCHIVEX</h1>
        </div>
        
        <nav className="flex-1 py-4">
          <button onClick={() => cambiarVistaLimpia('inicio')} className="w-full text-left px-6 py-3 hover:bg-[#5B9BD5]">🏠 Inicio</button>
          <button onClick={() => cambiarVistaLimpia('convocatorias_abiertas')} className="w-full text-left px-6 py-3 hover:bg-[#5B9BD5]">📢 Convocatorias</button>
          
          {usuario.rol === 'Admin' && (
            <>
              <button onClick={() => cambiarVistaLimpia('crear_convocatoria')} className="w-full text-left px-6 py-3 hover:bg-[#5B9BD5]">➕ Crear Convocatoria</button>
              <button onClick={() => cambiarVistaLimpia('control_usuarios')} className="w-full text-left px-6 py-3 hover:bg-[#5B9BD5]">👥 Control Usuarios</button>
            </>
          )}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
          <span className="font-bold text-slate-700">{usuario.nombre_completo}</span>
          <button onClick={() => setUsuario(null)} className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full">Cerrar Sesión</button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">{renderizarVista()}</div>
      </main>
    </div>
  );
}

export default App;