import React, { useState, useEffect } from 'react';

export default function Proyectos({ usuario, onVolver }) {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para los filtros de Sinfoni
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [vistaFiltro, setVistaFiltro] = useState('Lista');
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const cargarProyectos = async () => {
    setLoading(true);
    try {
      // 👈 Lógica de Endpoints Dinámicos según el Rol
      let url = '';
      if (usuario?.rol === 'Admin') {
        // Si es Admin, apunta al endpoint global de proyectos
        url = `http://localhost:5000/api/proyectos?estado=${estadoFiltro}`;
      } else {
        // Si es Profesor o cualquier otro, mantiene su filtro por director_id
        if (!userId) {
          setError('No se pudo identificar la sesión de usuario.');
          setLoading(false);
          return;
        }
        url = `http://localhost:5000/api/proyectos/director/${userId}?estado=${estadoFiltro}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await response.json();
      
      if (response.ok) {
        setProyectos(resJson.data || []);
      } else {
        setError(resJson.error || 'Error al cargar los proyectos.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProyectos();
  }, [estadoFiltro]);

  const handleExportar = () => {
    alert('Exportando listado de proyectos a Excel...');
  };

  const handleDocumentacion = () => {
    if (!proyectoSeleccionado) {
      alert('Por favor, selecciona primero un proyecto de la lista de abajo haciendo clic sobre él.');
      return;
    }
    alert(`Abriendo repositorio documental del proyecto: ${proyectoSeleccionado.codigo}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-6 space-y-6 p-4">
      
      {/* Barra de navegación superior rápida */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <button 
          onClick={onVolver}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200"
        >
          ← Volver al Panel
        </button>
        <h1 className="text-slate-700 font-extrabold uppercase text-xs tracking-wider">Módulo de Investigaciones</h1>
      </div>

      {/* Contenedor Principal Estilo Sinfoni */}
      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-100">
        
        {/* Fila de Filtros y Acciones de Sinfoni */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-wrap gap-4 items-center justify-between text-xs font-semibold text-slate-600">
          
          <div className="flex flex-wrap items-center gap-6">
            {/* Título de sección dinámico */}
            <div className="flex items-center gap-2">
              <span className="text-xl bg-teal-50 text-[#619c8f] p-1.5 rounded-lg">🟢</span>
              <span className="font-bold uppercase text-slate-700 tracking-wide text-sm">
                {usuario?.rol === 'Admin' ? 'Gestión de Proyectos' : 'Mis Proyectos'}
              </span>
            </div>

            {/* Selector de Estado */}
            <div className="flex items-center gap-2">
              <label className="text-slate-400 uppercase text-[10px]">Estado</label>
              <select 
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#619c8f] text-slate-700 font-medium shadow-sm"
              >
                <option value="">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Liquidado">Liquidado</option>
                <option value="En Evaluacion">En Evaluación</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>

            {/* Selector de Vista */}
            <div className="flex items-center gap-2">
              <label className="text-slate-400 uppercase text-[10px]">Vista</label>
              <select 
                value={vistaFiltro}
                onChange={(e) => setVistaFiltro(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#619c8f] text-slate-700 font-medium shadow-sm"
              >
                <option value="Lista">Lista</option>
                <option value="Cuadrícula">Cuadrícula</option>
              </select>
            </div>
          </div>

          {/* Botonera de Acciones Rápidas */}
          <div className="flex items-center gap-2">
            {/* Botón exclusivo para Administradores */}
            {usuario?.rol === 'Admin' && (
              <button 
                onClick={() => alert('Abriendo formulario para registrar nuevo proyecto institucional...')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1 border border-emerald-700"
              >
                ➕ Agregar Proyecto
              </button>
            )}

            <button 
              onClick={handleDocumentacion}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all border flex items-center gap-1 shadow-sm ${
                proyectoSeleccionado 
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              🔗 Documentación
            </button>
            <button 
              onClick={handleExportar}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 shadow-sm transition-all flex items-center gap-1"
            >
              📊 Exportar
            </button>
            <button 
              onClick={() => alert('Abriendo panel avanzado de filtros...')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 shadow-sm transition-all flex items-center gap-1"
            >
              🔍 Mostrar Filtros
            </button>
          </div>

        </div>

        {/* Alerta de Divisa */}
        <div className="bg-amber-50 border-b border-amber-100/60 px-6 py-2.5 flex items-center gap-2 text-[11px] text-amber-800 font-bold tracking-wide">
          <span>ℹ️</span> Los importes aparecen en PESO COLOMBIANO (COP)
        </div>

        {error && <div className="p-4 text-xs font-semibold text-red-600 bg-red-50 text-center border-b border-red-100">⚠️ {error}</div>}

        {/* Tabla de Resultados */}
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 font-semibold tracking-wide uppercase">Cargando portafolio de investigaciones...</div>
        ) : proyectos.length === 0 ? (
          <div className="p-20 text-center text-slate-400 text-xs font-bold bg-slate-50/30 uppercase tracking-widest space-y-2">
            <div className="text-3xl opacity-40">💼</div>
            <p>
              {usuario?.rol === 'Admin' 
                ? 'No se encontraron proyectos globales registrados en el sistema bajo este estado.' 
                : 'No se encontraron proyectos registrados como director bajo este estado.'}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-gradient-to-r from-[#619c8f] to-[#528479] text-white text-[11px] uppercase font-bold tracking-wider">
                  <th className="px-6 py-3.5 w-32">Código</th>
                  <th className="px-6 py-3.5">Título</th>
                  <th className="px-6 py-3.5 w-40 text-center">F.Comienzo</th>
                  <th className="px-6 py-3.5 w-40 text-center">F.Finalización</th>
                  <th className="px-6 py-3.5 w-36 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {proyectos.map((proj) => {
                  const esSeleccionado = proyectoSeleccionado?.id === proj.id;
                  return (
                    <tr 
                      key={proj.id} 
                      onClick={() => setProyectoSeleccionado(esSeleccionado ? null : proj)}
                      className={`cursor-pointer transition-colors ${
                        esSeleccionado ? 'bg-teal-50/60 hover:bg-teal-50' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="px-6 py-4 text-[#c23616] font-bold whitespace-nowrap align-middle">
                        <span className="mr-1.5 opacity-70">🌐</span>
                        {proj.codigo}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wide text-[11px] leading-snug align-middle break-words">
                        {proj.titulo}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium text-center align-middle">
                        {proj.fecha_inicio ? new Date(proj.fecha_inicio).toLocaleDateString('es-CO', { timeZone: 'UTC' }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium text-center align-middle">
                        {proj.fecha_fin ? new Date(proj.fecha_fin).toLocaleDateString('es-CO', { timeZone: 'UTC' }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          proj.estado === 'Activo' ? 'bg-green-100 text-green-700' :
                          proj.estado === 'Liquidado' ? 'bg-blue-100 text-blue-700' :
                          proj.estado === 'Suspendido' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {proj.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}