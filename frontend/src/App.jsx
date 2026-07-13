import { useState, useEffect } from 'react';
import Login from './components/Login';
import InicioCards from './components/InicioCards';
import DatosPersonales from './components/DatosPersonales';
import Noticias from './components/Noticias';
import FormularioSolicitud from './components/FormularioSolicitud';
import Proyectos from './components/Proyectos';
import Participaciones from './components/Participaciones';
import Convocatorias from "./components/Convocatorias";
import ConvocatoriasAbiertas from "./components/ConvocatoriasAbiertas";
import CrearConvocatoria from "./components/CrearConvocatoria";

// Sub-componente interno para la visualización del panel de control de usuarios
function ControlUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/usuarios', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok && json.data) {
          setUsuarios(json.data);
        }
      } catch (err) {
        console.error("Error cargando el panel de auditoría de usuarios", err);
      } finally {
        setLoading(false);
      }
    };
    obtenerUsuarios();
  }, []);

  if (loading) return <div className="text-white text-center font-bold">Cargando base de investigadores...</div>;

  return (
    <div className="w-full max-w-5xl bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Control de Usuarios e Investigadores registrados</h2>
        <p className="text-xs text-slate-500">Mapeo del sistema para control de accesos, roles y verificación documental.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white text-xs font-bold uppercase">
              <th className="p-3 rounded-l-lg">ID</th>
              <th className="p-3">Nombre Completo</th>
              <th className="p-3">Cédula</th>
              <th className="p-3">Correo Electrónico</th>
              <th className="p-3">Nivel Educativo</th>
              <th className="p-3 rounded-r-lg">Rol Asignado</th>
            </tr>
          </thead>
          <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 font-bold text-indigo-600">#{u.id}</td>
                <td className="p-3 font-semibold uppercase">{u.nombre_completo || 'No registrado'}</td>
                <td className="p-3 font-mono">{u.cedula || '---'}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 text-slate-500 font-medium">{u.nivel_educativo || 'No especificado'}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.rol === 'Admin' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {u.rol}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function App() {
  const [usuario, setUsuario] = useState(null); 
  const [vistaActual, setVistaActual] = useState('inicio');
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState(null);

  // Guardar datos clave en localStorage al autenticar para asegurar persistencia
  useEffect(() => {
    if (usuario) {
      if (usuario.id) localStorage.setItem('userId', usuario.id);
      if (usuario.rol) localStorage.setItem('userRol', usuario.rol);
    }
  }, [usuario]);

  if (!usuario) {
    return <Login alAutenticar={setUsuario} />;
  }

  const irAPostulacion = (convocatoria) => {
    setConvocatoriaSeleccionada(convocatoria);
    setVistaActual('formulario_radicacion');
  };

  const irAEdicion = (convocatoria) => {
    setConvocatoriaSeleccionada(convocatoria);
    setVistaActual('crear_convocatoria');
  };

  const cambiarVistaLimpia = (nuevaVista) => {
    setConvocatoriaSeleccionada(null); // Limpia contextos anteriores al saltar de sección
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
      case 'formulario':
        return <FormularioSolicitud usuario={usuario} convocatoria={convocatoriaSeleccionada} />;
      case 'proyectos':
        return <Proyectos usuario={usuario} onVolver={() => setVistaActual('inicio')} />;
      case 'participaciones':
        return <Participaciones usuario={usuario} onVolver={() => setVistaActual('inicio')} />;
      case 'convocatorias_abiertas':
        return (
          <ConvocatoriasAbiertas 
            usuario={usuario}
            alSeleccionarConvocatoria={irAPostulacion} 
            alEditarConvocatoria={irAEdicion}
          />
        );
      case 'formulario_radicacion':
        return <Convocatorias usuario={usuario} convocatoria={convocatoriaSeleccionada} />;
      case 'crear_convocatoria': 
        return (
          <CrearConvocatoria 
            convocatoriaAEditar={convocatoriaSeleccionada}
            alFinalizar={() => {
              setConvocatoriaSeleccionada(null);
              setVistaActual('convocatorias_abiertas');
            }} 
          />
        );
      case 'control_usuarios':
        return <ControlUsuarios />;
      default:
        return (
          <div className="text-center bg-white p-8 rounded-xl mt-10 shadow-lg">
            <h2 className="text-2xl text-slate-600 font-bold">Módulo en construcción 🚧</h2>
            <p className="text-slate-400 mt-2">Pronto conectaremos esta sección para el rol {usuario.rol}.</p>
            <button onClick={() => setVistaActual('inicio')} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">Volver</button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#2d3748] text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 bg-white border-b border-slate-200 text-center cursor-pointer" onClick={() => cambiarVistaLimpia('inicio')}>
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-[#5B9BD5]">ARCHIVE</span><span className="text-[#70AD47]">X</span>
          </h1>
          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider block mt-1">
            Módulo {usuario.rol}
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <button 
            onClick={() => cambiarVistaLimpia('inicio')} 
            className={`w-full text-left px-6 py-3 hover:bg-[#5B9BD5] transition-colors flex items-center gap-2 ${vistaActual === 'inicio' ? 'bg-[#5B9BD5]' : ''}`}
          >
            🏠 Inicio / Dashboard
          </button>

          <button 
            onClick={() => cambiarVistaLimpia('convocatorias_abiertas')} 
            className={`w-full text-left px-6 py-3 hover:bg-[#5B9BD5] transition-colors flex items-center gap-2 ${vistaActual === 'convocatorias_abiertas' ? 'bg-[#5B9BD5]' : ''}`}
          >
            📢 Convocatorias Abiertas
          </button>

          <button 
            onClick={() => cambiarVistaLimpia('participaciones')} 
            className={`w-full text-left px-6 py-3 hover:bg-[#5B9BD5] transition-colors flex items-center gap-2 ${vistaActual === 'participaciones' ? 'bg-[#5B9BD5]' : ''}`}
          >
            📋 Mis Participaciones
          </button>
          
          {usuario.rol === 'Admin' && (
            <>
              <div className="mt-4 px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Panel Admin
              </div>
              <button 
                onClick={() => {
                  setConvocatoriaSeleccionada(null);
                  setVistaActual('crear_convocatoria');
                }} 
                className={`w-full text-left px-6 py-3 hover:bg-[#5B9BD5] transition-colors flex items-center gap-2 ${vistaActual === 'crear_convocatoria' ? 'bg-[#5B9BD5]' : ''}`}
              >
                ➕ Crear Convocatoria
              </button>
              <button 
                onClick={() => cambiarVistaLimpia('control_usuarios')} 
                className={`w-full text-left px-6 py-3 hover:bg-[#5B9BD5] transition-colors flex items-center gap-2 ${vistaActual === 'control_usuarios' ? 'bg-[#5B9BD5]' : ''}`}
              >
                👥 Control de Usuarios
              </button>
            </>
          )}
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen relative">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069')" }}
        >
          <div className="absolute inset-0 bg-slate-900/60"></div>
        </div>

        {/* TOPBAR */}
        <header className="h-16 bg-white/95 shadow-sm flex items-center justify-between px-8 z-10">
          <div className="text-slate-600 font-semibold">Sistema de Gestión Documental</div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-slate-700 uppercase">{usuario.nombre_completo}</div>
            <button 
              onClick={() => { 
                setUsuario(null); 
                setVistaActual('inicio');
              }}
              className="text-xs bg-slate-200 hover:bg-red-500 hover:text-white px-3 py-1 rounded-full transition-colors text-slate-600"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* CONTENEDOR DINÁMICO */}
        <div className="flex-1 overflow-y-auto p-8 z-10 flex flex-col items-center w-full">
          {vistaActual !== 'inicio' && (
            <button 
              onClick={() => cambiarVistaLimpia('inicio')}
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