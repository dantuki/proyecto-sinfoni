import React, { useState, useEffect } from 'react';

export default function Participaciones({ usuario, onVolver }) {
  const [participaciones, setParticipaciones] = useState([]);
  const [proyectosDisponibles, setProyectosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificacion, setNotificacion] = useState('');
  
  // Filtros y Búsqueda
  const [filtroRol, setFiltroRol] = useState('');
  const [busquedaProyecto, setBusquedaProyecto] = useState('');
  const [mostrarPanelFiltros, setMostrarPanelFiltros] = useState(false);
  const [participacionSeleccionada, setParticipacionSeleccionada] = useState(null);

  // Estado Modal de Inserción Real (Sustituye los datos de prueba manuales)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevaParticipacion, setNuevaParticipacion] = useState({
    proyecto_id: '',
    usuario_id: '',
    rol_proyecto: 'Coinvestigador',
    horas_dedicacion: '',
    fecha_vinculacion: '',
    estado_vinculacion: 'Activo'
  });

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Cargar las vinculaciones desde el servidor
  const cargarParticipaciones = async () => {
    setLoading(true);
    try {
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
        setError(resJson.error || 'Error al recopilar el historial de vinculaciones.');
      }
    } catch (err) {
      setError('Error de comunicación con el servidor central.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar catálogo de proyectos (para el selector del formulario)
  const cargarProyectosDropdown = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/proyectos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await response.json();
      if (response.ok) {
        setProyectosDisponibles(resJson.data || []);
      }
    } catch (err) {
      console.error('Error cargando catálogo de proyectos:', err);
    }
  };

  useEffect(() => {
    cargarParticipaciones();
    if (usuario?.rol === 'Admin') {
      cargarProyectosDropdown();
    }
  }, [filtroRol]);

  const mostrarMensajeTemporal = (msg) => {
    setNotificacion(msg);
    setTimeout(() => setNotificacion(''), 4000);
  };

  // Enviar el formulario y guardar directamente en la BD
  const handleGuardarParticipacion = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/participaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevaParticipacion)
      });
      const resJson = await response.json();

      if (response.ok) {
        mostrarMensajeTemporal('🎉 ¡Vinculación registrada e indexada en la base de datos con éxito!');
        setModalAbierto(false);
        setNuevaParticipacion({
          proyecto_id: '',
          usuario_id: '',
          rol_proyecto: 'Coinvestigador',
          horas_dedicacion: '',
          fecha_vinculacion: '',
          estado_vinculacion: 'Activo'
        });
        cargarParticipaciones();
      } else {
        alert(resJson.error || 'Ocurrió un inconveniente al guardar.');
      }
    } catch (err) {
      alert('Error de red al intentar sincronizar con MySQL.');
    }
  };

  // Filtrado local reactivo por Código o Nombre del Proyecto
  const participacionesFiltradas = participaciones.filter((part) => {
    const term = busquedaProyecto.toLowerCase().trim();
    if (!term) return true;
    return (
      part.codigo_proyecto?.toLowerCase().includes(term) ||
      part.titulo_proyecto?.toLowerCase().includes(term)
    );
  });

  // Exportar reporte estructurado a Excel en español (CSV separado por punto y coma)
  const handleExportarExcel = () => {
    if (participacionesFiltradas.length === 0) {
      mostrarMensajeTemporal('⚠️ No existen registros procesados para generar reportes.');
      return;
    }

    const headers = ['CODIGO PROYECTO', 'TITULO PROYECTO', 'ID INVESTIGADOR', 'ROL DE ASIGNACION', 'HORAS SEMANALES', 'FECHA ALTA', 'ESTADO VINCULO'];
    
    const rows = participacionesFiltradas.map(p => [
      p.codigo_proyecto,
      `"${p.titulo_proyecto.replace(/"/g, '""')}"`,
      p.usuario_id,
      p.rol_proyecto,
      p.horas_dedicacion,
      p.fecha_vinculacion ? new Date(p.fecha_vinculacion).toISOString().split('T')[0] : '—',
      p.estado_vinculacion
    ].join(';'));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + ['sep=;', headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const fechaStr = ahora.toISOString().split('T')[0];
    
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Vinculaciones_${fechaStr}_${horas}-${minutos}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarMensajeTemporal('📊 ¡Reporte de asignaciones descargado exitosamente!');
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-6 space-y-6 p-4 relative">
      
      {/* Notificación limpia flotante */}
      {notificacion && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 border border-slate-700">
          {notificacion}
        </div>
      )}

      {/* Cabecera de Navegación */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <button onClick={onVolver} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition">
          ← Volver al Panel
        </button>
        <h1 className="text-slate-700 font-extrabold uppercase text-xs tracking-wider">Historial de Colaboraciones</h1>
      </div>

      <div className="space-y-4">
        
        {/* Barra de Búsqueda Avanzada */}
        {mostrarPanelFiltros && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
              <span className="text-slate-400 text-sm">🔍</span>
              <input 
                type="text" 
                value={busquedaProyecto} 
                onChange={(e) => setBusquedaProyecto(e.target.value)} 
                placeholder="Escribe el código del proyecto o palabras del título para filtrar..." 
                className="w-full text-xs font-medium text-slate-800 focus:outline-none bg-transparent"
              />
              {busquedaProyecto && (
                <button onClick={() => setBusquedaProyecto('')} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-bold uppercase">Asociaciones: {participacionesFiltradas.length}</span>
          </div>
        )}

        {/* Módulo Principal de Datos */}
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-100">
          <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-wrap gap-4 items-center justify-between text-xs font-semibold text-slate-600">
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xl bg-indigo-50 text-indigo-600 p-1.5 rounded-lg">👥</span>
                <span className="font-bold uppercase text-slate-700 tracking-wide text-sm">
                  {usuario?.rol === 'Admin' ? 'Consola de Vinculaciones' : 'Mis Proyectos Asignados'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-slate-400 uppercase text-[10px]">Filtrar Rol</label>
                <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none text-slate-700 font-medium shadow-sm">
                  <option value="">Todos los Roles</option>
                  <option value="Coinvestigador">Coinvestigador</option>
                  <option value="Auxiliar de Investigacion">Auxiliar de Investigación</option>
                  <option value="Asesor Tecnico">Asesor Técnico</option>
                </select>
              </div>
            </div>

            {/* Panel de Botones de Acción */}
            <div className="flex items-center gap-2">
              {usuario?.rol === 'Admin' && (
                <button onClick={() => setModalAbierto(true)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition flex items-center gap-1 border border-indigo-700">
                  ➕ Vincular Investigador
                </button>
              )}

              <button onClick={handleExportarExcel} className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 shadow-sm transition flex items-center gap-1">
                📊 Exportar Lista
              </button>

              <button 
                onClick={() => setMostrarPanelFiltros(!mostrarPanelFiltros)} 
                className={`px-3 py-1.5 font-bold rounded-lg border shadow-sm transition flex items-center gap-1 ${mostrarPanelFiltros ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                🔍 {mostrarPanelFiltros ? 'Ocultar Filtros' : 'Buscar Lupa'}
              </button>
            </div>
          </div>

          {error && <div className="p-4 text-xs font-semibold text-red-600 bg-red-50 text-center border-b border-red-100">⚠️ {error}</div>}

          {loading ? (
            <div className="p-16 text-center text-xs text-slate-400 font-semibold tracking-wide uppercase">Extrayendo asignaciones desde ArchiveX...</div>
          ) : participacionesFiltradas.length === 0 ? (
            <div className="p-20 text-center text-slate-400 text-xs font-bold bg-slate-50/30 uppercase tracking-widest space-y-2">
              <div className="text-3xl opacity-40">👥</div>
              <p>No se registran datos ni asignaciones de personal bajo este criterio.</p>
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[11px] uppercase font-bold tracking-wider">
                    <th className="px-6 py-3.5 w-32">Código</th>
                    <th className="px-6 py-3.5">Proyecto Relacionado</th>
                    {usuario?.rol === 'Admin' && <th className="px-6 py-3.5 w-28 text-center">ID Usuario</th>}
                    <th className="px-6 py-3.5 w-48 text-center">Rol Asignado</th>
                    <th className="px-6 py-3.5 w-32 text-center">Dedicación</th>
                    <th className="px-6 py-3.5 w-36 text-center">Fecha Alta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {participacionesFiltradas.map((part) => {
                    const esSeleccionado = participacionSeleccionada?.id === part.id;
                    return (
                      <tr key={part.id} onClick={() => setParticipacionSeleccionada(esSeleccionado ? null : part)} className={`cursor-pointer transition-colors ${esSeleccionado ? 'bg-indigo-50/60 hover:bg-indigo-50' : 'hover:bg-slate-50/70'}`}>
                        <td className="px-6 py-4 text-indigo-600 font-bold align-middle">
                          📁 {part.codigo_proyecto}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700 uppercase tracking-wide text-[11px] leading-snug align-middle break-words">
                          {part.titulo_proyecto}
                        </td>
                        {usuario?.rol === 'Admin' && (
                          <td className="px-6 py-4 text-center font-bold text-slate-500 align-middle">
                            #{part.usuario_id}
                          </td>
                        )}
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

      {/* FORMULARIO MODAL (EXCLUSIVO ADMIN PARA INSERTAR VINCULACIONES DIRECTAS) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider">Asignar Investigador a Proyecto</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-white text-lg font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleGuardarParticipacion} className="p-6 space-y-4 text-xs font-semibold text-slate-600">
              
              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Seleccionar Proyecto</label>
                <select required value={nuevaParticipacion.proyecto_id} onChange={(e) => setNuevaParticipacion({...nuevaParticipacion, proyecto_id: e.target.value})} className="col-span-2 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-600 font-medium text-slate-800">
                  <option value="">-- Elige un Proyecto --</option>
                  {proyectosDisponibles.map(p => (
                    <option key={p.id} value={p.id}>[{p.codigo}] {p.titulo.substring(0, 45)}...</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">ID del Investigador</label>
                <input type="number" required placeholder="Ej: 1" value={nuevaParticipacion.usuario_id} onChange={(e) => setNuevaParticipacion({...nuevaParticipacion, usuario_id: e.target.value})} className="col-span-2 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-600 font-medium text-slate-800" />
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Rol en el Proyecto</label>
                <select value={nuevaParticipacion.rol_proyecto} onChange={(e) => setNuevaParticipacion({...nuevaParticipacion, rol_proyecto: e.target.value})} className="col-span-2 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-600 font-medium text-slate-800">
                  <option value="Coinvestigador">Coinvestigador</option>
                  <option value="Auxiliar de Investigacion">Auxiliar de Investigación</option>
                  <option value="Asesor Tecnico">Asesor Técnico</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Horas Semanales</label>
                <input type="number" required placeholder="Ej: 16" min="1" max="40" value={nuevaParticipacion.horas_dedicacion} onChange={(e) => setNuevaParticipacion({...nuevaParticipacion, horas_dedicacion: e.target.value})} className="col-span-2 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-600 font-medium text-slate-800" />
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Fecha Vinculación</label>
                <input type="date" required value={nuevaParticipacion.fecha_vinculacion} onChange={(e) => setNuevaParticipacion({...nuevaParticipacion, fecha_vinculacion: e.target.value})} className="col-span-2 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-600 font-medium text-slate-800" />
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Estado Inicial</label>
                <select value={nuevaParticipacion.estado_vinculacion} onChange={(e) => setNuevaParticipacion({...nuevaParticipacion, estado_vinculacion: e.target.value})} className="col-span-2 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-600 font-medium text-slate-800">
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm">Guardar en MySQL</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}