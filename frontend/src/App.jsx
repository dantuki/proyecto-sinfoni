import { useState } from 'react';
import InicioCards from './components/InicioCards';
import DatosPersonales from './components/DatosPersonales';
import Noticias from './components/Noticias';
import FormularioSolicitud from './components/FormularioSolicitud'; // El que hicimos ayer

function App() {
  // Estado para controlar qué pantalla se ve. Por defecto es 'inicio'
  const [vistaActual, setVistaActual] = useState('inicio');

  // Función para renderizar el componente correcto
  const renderizarVista = () => {
    switch(vistaActual) {
      case 'inicio':
        return <InicioCards cambiarVista={setVistaActual} />;
      case 'datos_personales':
        return <DatosPersonales />;
      case 'noticias':
        return <Noticias />;
      case 'formulario':
        return <FormularioSolicitud />;
      default:
        return (
          <div className="text-center bg-white p-8 rounded-xl mt-10">
            <h2 className="text-2xl text-slate-600">Módulo en construcción 🚧</h2>
            <button onClick={() => setVistaActual('inicio')} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Volver</button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* SIDEBAR LATERAL (Simplificado para el ejemplo) */}
      <aside className="w-64 bg-[#2d3748] text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 bg-white border-b border-slate-200 text-center cursor-pointer" onClick={() => setVistaActual('inicio')}>
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-[#5B9BD5]">ARCHIVE</span><span className="text-[#70AD47]">X</span>
          </h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <button onClick={() => setVistaActual('inicio')} className="w-full text-left px-6 py-3 hover:bg-[#5B9BD5] transition-colors">
            🏠 Inicio / Dashboard
          </button>
          {/* Aquí irían los demás botones del sidebar si deseas navegar desde ambos lados */}
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen relative">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-slate-900/60"></div>
        </div>

        {/* TOPBAR */}
        <header className="h-16 bg-white/95 shadow-sm flex items-center justify-between px-8 z-10">
          <div className="text-slate-600 font-semibold">Sistema de Gestión Documental</div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-slate-700">CLAVIJO BUSTOS, NELLY</div>
            <button className="text-xs bg-slate-200 hover:bg-red-500 hover:text-white px-3 py-1 rounded-full transition-colors text-slate-600">Cerrar Sesión</button>
          </div>
        </header>

        {/* CONTENEDOR DINÁMICO (Aquí cambia la vista) */}
        <div className="flex-1 overflow-y-auto p-8 z-10 flex flex-col items-center">
          {vistaActual !== 'inicio' && (
            <button 
              onClick={() => setVistaActual('inicio')}
              className="self-start mb-4 bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition flex items-center gap-2"
            >
              ← Volver al Panel
            </button>
          )}
          
          {renderizarVista()}

        </div>
      </main>
    </div>
  );
}

export default App;