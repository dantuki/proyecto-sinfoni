import { useState } from 'react';
import FormularioSolicitud from './components/FormularioSolicitud';

function App() {
  const [menuActivo, setMenuActivo] = useState('');

  const toggleMenu = (menu) => {
    setMenuActivo(menuActivo === menu ? '' : menu);
  };

  const menus = [
    {
      titulo: 'Recursos Humanos',
      icono: '👤',
      submenus: ['Datos Personales', 'Noticias']
    },
    {
      titulo: 'Proyectos',
      icono: '🌐',
      submenus: ['Mis Proyectos', 'Mis Participaciones']
    },
    {
      titulo: 'Producción Científica',
      icono: '🔬',
      submenus: ['Currículum', 'Unidades de Investigación']
    },
    {
      titulo: 'Innovación',
      icono: '💡',
      submenus: ['Ideas Propias']
    },
    {
      titulo: 'Convocatorias Propias',
      icono: '📑',
      submenus: ['Mis Solicitudes', 'Convocatorias Abiertas']
    }
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* SIDEBAR LATERAL */}
      <aside className="w-72 bg-[#2d3748] text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 bg-white border-b border-slate-200 text-center flex flex-col items-center justify-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-[#5B9BD5]">ARCHIVE</span><span className="text-[#70AD47]">X</span>
          </h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          {menus.map((menu, index) => (
            <div key={index} className="mb-1">
              <button 
                onClick={() => toggleMenu(menu.titulo)}
                className={`w-full flex items-center justify-between px-6 py-3 hover:bg-[#5B9BD5] transition-colors ${menuActivo === menu.titulo ? 'bg-[#5B9BD5]' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{menu.icono}</span>
                  <span className="font-medium text-sm tracking-wide">{menu.titulo}</span>
                </div>
                <span>{menuActivo === menu.titulo ? '▾' : '▸'}</span>
              </button>
              
              {/* SUBMENUS DESPLEGABLES */}
              {menuActivo === menu.titulo && (
                <div className="bg-[#1a202c] py-2">
                  {menu.submenus.map((sub, idx) => (
                    <button 
                      key={idx}
                      className="w-full text-left pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL CON FONDO DE IMAGEN */}
      <main className="flex-1 flex flex-col h-screen relative">
        {/* Aquí puedes cambiar la URL por la foto que desees */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-slate-900/40"></div> {/* Filtro oscuro para que resalte el contenido */}
        </div>

        {/* TOPBAR */}
        <header className="h-16 bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-between px-8 z-10 border-b border-slate-200">
          <div className="text-slate-600 font-semibold">Sistema de Gestión Documental</div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-slate-700">CLAVIJO BUSTOS, NELLY</div>
            <button className="text-xs bg-slate-200 hover:bg-red-500 hover:text-white px-3 py-1 rounded-full transition-colors text-slate-600">Cerrar Sesión</button>
          </div>
        </header>

        {/* CONTENEDOR DE TARJETAS (Glassmorphism) */}
        <div className="flex-1 overflow-y-auto p-8 z-10 flex items-start justify-center">
          
          {/* TARJETA DONDE VA TU FORMULARIO */}
          <div className="w-full max-w-4xl bg-white/85 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/40 mt-4">
            <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Nueva Solicitud</h2>
                <p className="text-[#5B9BD5] font-medium text-sm mt-1">Convocatorias Propias {'>'} Mis Solicitudes</p>
              </div>
            </div>
            
            {/* AQUÍ LLAMAMOS AL FORMULARIO QUE HICIMOS AYER */}
            <FormularioSolicitud />
            
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;