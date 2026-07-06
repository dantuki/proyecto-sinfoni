import React, { useState, useEffect } from 'react';

export default function Participaciones({ usuario, onVolver }) {
  const [participaciones, setParticipaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificacion, setNotificacion] = useState('');
  
  // Filtros y Búsqueda
  const [filtroRol, setFiltroRol] = useState('');
  const [busquedaProyecto, setBusquedaProyecto] = useState('');
  const [mostrarPanelFiltros, setMostrarPanelFiltros] = useState(false);
  const [participacionSeleccionada, setParticipacionSeleccionada] = useState(null);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Cargar participaciones desde el API
  const cargarParticipaciones = async () => {
    setLoading(true);
    try {
      // Si es Admin puede ver todas las vinculaciones, si no, solo las del usuario en sesión
      const url = usuario?.rol === 'Admin'
        ? `http://localhost:5000/api/participaciones?rol_proyecto=${filtroRol}`
        : `http://localhost:5000/api/participaciones/usuario/${userId}?rol_proyecto=${filtroRol}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await response.json();
      
      if (response.ok) {
        setParticipaciones(resJson.data || []);
      } else {
        setError(resJson.error || 'Error al cargar las participaciones.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarParticipaciones();
  }, [filtroRol]);

  const mostrarMensajeTemporal = (msg) => {
    setNotificacion(msg);
    setTimeout(() => setNotificacion(''), 4000);
  };

  // Filtrado reactivo por Código de Proyecto o Título
  const participacionesFiltradas = participaciones.filter((part) => {
    const term = busquedaProyecto.toLowerCase().trim();
    if (!term) return true;
    return (
      part.codigo_proyecto?.toLowerCase().includes(term) ||
      part.titulo_proyecto?.toLowerCase().includes(term)
    );
  });

  // Exportar a Excel (CSV en español) con horas, minutos y separador de punto y coma
  const handleExportarExcel = () => {
    if (participacionesFiltradas.length === 0) {
      mostrarMensajeTemporal('⚠️ No hay participaciones para exportar.');
      return;
    }

    const headers = ['CODIGO PROYECTO', 'TITULO PROYECTO', 'ROL EN PROYECTO', 'HORAS DEDICACION', 'FECHA VINCULACION', 'ESTADO'];
    
    const rows = participacionesFiltradas.map(p => [
      p.codigo_proyecto,
      `"${p.titulo_proyecto.replace(/"/g, '""')}"`,
      p.rol_proyecto,
      p.horas_dedicacion || 0,
      p.fecha_vinculacion ? new Date(p.fecha_vinculacion).toISOString().split('T')[0] : '—',
      p.estado_vinculacion || 'Activo'
    ].join(';'));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + ['sep=;', headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const fechaStr = ahora.toISOString().split('T')[0];
    
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mis_Participaciones_ArchiveX_${fechaStr}_${horas}-${minutos}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarMensajeTemporal('📊 ¡Listado de participaciones exportado con éxito!');
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-6 space-y-6 p-4 relative">
      
      {/* Alerta flotante */}
      {notificacion && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 border border-slate-700">
          {notificacion}
        </div>
      )}

      {/* Cabecera */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <button onClick={onVolver} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition">
          ← Volver al Panel
        </button>
        <h1 className="text-slate-700 font-extrabold uppercase text-xs tracking-wider">Historial de Colaboraciones</h1>
      </div>

      <div className="space-y-4">
        
        {/* Panel de búsqueda reactiva */}
        {mostrarPanelFiltros && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
              <span className="text-slate-400 text-sm">🔍</span>
              <input 
                type="text" 
                value={busquedaProyecto} 
                onChange={(e) => setBusquedaProyecto(e.target.value)} 
                placeholder="Filtrar por código de proyecto o palabras clave del título..." 
                className="w-full text-xs font-medium text-slate-800 focus:outline-none bg-transparent"
              />
              {busquedaProyecto && (
                <button onClick={() => setBusquedaProyecto('')} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-bold uppercase">Resultados: {participacionesFiltradas.length}</span>
          </div>
        )}

        {/* Tabla Principal */}
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-100">
          <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-wrap gap-4 items-center justify-between text-xs font-semibold text-slate-600">
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xl bg-indigo-50 text-indigo-600 p-1.5 rounded-lg">👥</span>
                <span className="font-bold uppercase text-slate-700 tracking-wide text-sm">
                  {usuario?.rol === 'Admin' ? 'Todas las Participaciones' : 'Proyectos Asociados'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-slate-400 uppercase text-[10px]">Rol Asignado</label>
                <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none text-slate-700 font-medium shadow-sm">
                  <option value="">Todos los Roles</option>
                  <option value="Coinvestigador">Coinvestigador</option>
                  <option value="Auxiliar de Investigacion">Auxiliar de Investigación</option>
                  <option value="Asesor Tecnico">Asesor Técnico</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleExportarExcel} className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 shadow-sm transition flex items-center gap-1">
                📊 Exportar Todo
              </button>

              <button 
                onClick={() => setMostrarPanelFiltros(!mostrarPanelFiltros)} 
                className={`px-3 py-1.5 font-bold rounded-lg border shadow-sm transition flex items-center gap-1 ${mostrarPanelFiltros ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                🔍 {mostrarPanelFiltros ? 'Ocultar Filtros' : 'Buscar'}
              </button>
            </div>
          </div>

          {error && <div className="p-4 text-xs font-semibold text-red-600 bg-red-50 text-center border-b border-red-100">⚠️ {error}</div>}

          {loading ? (
            <div className="p-16 text-center text-xs text-slate-400 font-semibold tracking-wide uppercase">Sincronizando asignaciones de personal...</div>
          ) : participacionesFiltradas.length === 0 ? (
            <div className="p-20 text-center text-slate-400 text-xs font-bold bg-slate-50/30 uppercase tracking-widest space-y-2">
              <div className="text-3xl opacity-40">👥</div>
              <p>No registras vinculaciones vigentes bajo los criterios seleccionados.</p>
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[11px] uppercase font-bold tracking-wider">
                    <th className="px-6 py-3.5 w-32">Proyecto</th>
                    <th className="px-6 py-3.5">Título del Proyecto</th>
                    <th className="px-6 py-3.5 w-48 text-center">Rol Institucional</th>
                    <th className="px-6 py-3.5 w-32 text-center">Dedicación</th>
                    <th className="px-6 py-3.5 w-36 text-center">Vinculación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {participacionesFiltradas.map((part) => {
                    const esSeleccionado = participacionSeleccionada?.id === part.id;
                    return (
                      <tr key={part.id} onClick={() => setParticipacionSeleccionada(esSeleccionado ? null : part)} className={`cursor-pointer transition-colors ${esSeleccionado ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50/70'}`}>
                        <td className="px-6 py-4 text-indigo-600 font-bold align-middle">
                          📁 {part.codigo_proyecto}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wide text-[11px] leading-snug align-middle break-words">
                          {part.titulo_proyecto}
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            {part.rol_proyecto}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-bold text-center align-middle">
                          {part.horas_dedicacion} h/semana
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-medium text-center align-middle">
                          {part.fecha_vinculacion ? new Date(part.fecha_vinculacion).toLocaleDateString('es-CO', { timeZone: 'UTC' }) : '—'}
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
    </div>
  );
}