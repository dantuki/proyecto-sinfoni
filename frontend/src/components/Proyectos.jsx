import React, { useState, useEffect } from 'react';

export default function Proyectos({ usuario, onVolver }) {
  const [proyectos, setProyectos] = useState([]);
  const [directores, setDirectores] = useState([]); // Estado nuevo para almacenar los docentes/usuarios de la BD
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificacion, setNotificacion] = useState('');
  
  // Filtros y Búsqueda Avanzada
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [busquedaCodigoTitulo, setBusquedaCodigoTitulo] = useState('');
  const [mostrarPanelFiltros, setMostrarPanelFiltros] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  // Estados del Sub-Módulo de Documentación
  const [verDocumentacion, setVerDocumentacion] = useState(false);
  const [documentos, setDocumentos] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [nuevoDoc, setNuevoDoc] = useState({ nombre_archivo: '', tipo_documento: 'Propuesta Técnica' });

  // Estado del Modal de inserción de proyectos
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoProyecto, setNuevoProyecto] = useState({
    codigo: '',
    titulo: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'Activo',
    director_id: '' // Inicializado vacío para forzar la selección interactiva
  });

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  
  // Normalización del rol de administrador
  const esAdmin = usuario?.rol === 'Admin' || usuario?.rol === 'Administrador';

  // Cargar lista de directores/usuarios de la base de datos (Solo para el Admin)
  const cargarDirectoresDisponibles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const resJson = await response.json();
        if (resJson.success) {
          setDirectores(resJson.data || []);
        } else if (Array.isArray(resJson)) {
          setDirectores(resJson);
        }
      }
    } catch (err) {
      console.error('Error al mapear directores en el select:', err);
    }
  };

  // Cargar proyectos desde el Servidor
  const cargarProyectos = async () => {
    setLoading(true);
    setError('');
    try {
      let url = esAdmin
        ? `http://localhost:5000/api/proyectos?estado=${estadoFiltro}`
        : `http://localhost:5000/api/proyectos/director/${userId}?estado=${estadoFiltro}`;

      if (!esAdmin && !userId) {
        setError('No se pudo identificar la sesión de usuario de forma segura.');
        setLoading(false);
        return;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await response.json();
      
      if (response.ok) {
        setProyectos(resJson.data || []);
      } else {
        setError(resJson.error || 'Error al cargar los proyectos institucionales.');
      }
    } catch (err) {
      setError('Error crítico al conectar con el servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!verDocumentacion) {
      cargarProyectos();
    }
    if (esAdmin) {
      cargarDirectoresDisponibles();
    }
  }, [estadoFiltro, verDocumentacion, userId, esAdmin]);

  // Cargar documentos del proyecto seleccionado
  const cargarDocumentos = async (proyectoId) => {
    setLoadingDocs(true);
    try {
      const response = await fetch(`http://localhost:5000/api/proyectos/${proyectoId}/documentos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await response.json();
      if (response.ok) {
        setDocumentos(resJson.data || []);
      }
    } catch (err) {
      console.error('Error cargando la bóveda de documentos:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (verDocumentacion && proyectoSeleccionado) {
      cargarDocumentos(proyectoSeleccionado.id);
    }
  }, [verDocumentacion, proyectoSeleccionado]);

  const mostrarMensajeTemporal = (msg) => {
    setNotificacion(msg);
    setTimeout(() => setNotificacion(''), 4000);
  };

  // Filtrado reactivo local por Código o Título
  const proyectosFiltrados = proyectos.filter((proj) => {
    const term = busquedaCodigoTitulo.toLowerCase().trim();
    if (!term) return true;
    return (
      (proj.codigo?.toLowerCase() || '').includes(term) ||
      (proj.titulo?.toLowerCase() || '').includes(term)
    );
  });

  // Exportar a archivo CSV para Excel (Sistemas en Español)
  const handleExportarExcel = () => {
    if (proyectosFiltrados.length === 0) {
      mostrarMensajeTemporal('⚠️ No hay filas disponibles para exportar.');
      return;
    }

    const headers = ['CODIGO', 'TITULO', 'FECHA COMIENZO', 'FECHA FINALIZACION', 'ESTADO'];
    
    const rows = proyectosFiltrados.map(p => [
      p.codigo || '—',
      `"${(p.titulo || '').replace(/"/g, '""')}"`,
      p.fecha_inicio ? new Date(p.fecha_inicio).toISOString().split('T')[0] : '—',
      p.fecha_fin ? new Date(p.fecha_fin).toISOString().split('T')[0] : '—',
      p.estado || '—'
    ].join(';'));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + ['sep=;', headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const fechaStr = ahora.toISOString().split('T')[0];
    
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Proyectos_ArchiveX_${fechaStr}_${horas}-${minutos}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarMensajeTemporal('📊 ¡Reporte Excel actualizado y descargado exitosamente!');
  };

  // Guardar nuevo proyecto (Modal MySQL)
  const handleGuardarProyecto = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/proyectos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevoProyecto)
      });
      const resJson = await response.json();

      if (response.ok) {
        mostrarMensajeTemporal('🎉 ¡Proyecto guardado y sincronizado en MySQL con éxito!');
        setModalAbierto(false);
        setNuevoProyecto({ codigo: '', titulo: '', fecha_inicio: '', fecha_fin: '', estado: 'Activo', director_id: '' });
        cargarProyectos();
      } else {
        alert(resJson.error || 'Error al guardar el proyecto institucional.');
      }
    } catch (err) {
      alert('Error de conexión al intentar guardar el registro.');
    }
  };

  // Registrar nuevo archivo en la sección de documentación
  const handleSubirDocumento = async (e) => {
    e.preventDefault();
    if (!nuevoDoc.nombre_archivo.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/proyectos/${proyectoSeleccionado.id}/documentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevoDoc)
      });
      const resJson = await response.json();

      if (response.ok) {
        mostrarMensajeTemporal('📄 ¡Documento indexado correctamente en el repositorio!');
        setNuevoDoc({ nombre_archivo: '', tipo_documento: 'Propuesta Técnica' });
        cargarDocumentos(proyectoSeleccionado.id);
      } else {
        alert(resJson.error || 'Error al guardar el documento en el servidor.');
      }
    } catch (err) {
      alert('Error de red al conectar con el repositorio de ArchiveX.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-6 space-y-6 p-4 relative">
      
      {/* Notificación limpia flotante */}
      {notificacion && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 border border-slate-700">
          {notificacion}
        </div>
      )}

      {/* CABECERA PRINCIPAL VISTA PROYECTOS */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <button onClick={verDocumentacion ? () => setVerDocumentacion(false) : onVolver} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition">
          {verDocumentacion ? '← Volver a Proyectos' : '← Volver al Panel'}
        </button>
        <h1 className="text-slate-700 font-extrabold uppercase text-xs tracking-wider">Módulo de Investigaciones</h1>
      </div>

      {/* SUB-MÓDULO DE DOCUMENTACIÓN ACTIVO */}
      {verDocumentacion && proyectoSeleccionado ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Formulario para indexar archivos */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 h-fit">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase">Requisitos Convocatoria</span>
              <h2 className="text-slate-700 font-extrabold text-sm uppercase mt-1">Adjuntar Entregable</h2>
              <p className="text-slate-400 text-[11px] font-medium leading-relaxed mt-0.5">Sube los documentos exigidos (Presupuesto, Cronograma, etc.) para: <span className="text-red-600 font-bold">{proyectoSeleccionado.codigo}</span>.</p>
            </div>

            <form onSubmit={handleSubirDocumento} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="space-y-1">
                <label className="uppercase text-[10px] text-slate-400">Nombre del Documento / Archivo</label>
                <input type="text" required placeholder="Ej: PRESUPUESTO_DETALLADO_UCC.xlsx" value={nuevoDoc.nombre_archivo} onChange={(e) => setNuevoDoc({...nuevoDoc, nombre_archivo: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-teal-600 font-medium text-slate-800" />
              </div>

              <div className="space-y-1">
                <label className="uppercase text-[10px] text-slate-400">Tipo de Documento Legal</label>
                <select value={nuevoDoc.tipo_documento} onChange={(e) => setNuevoDoc({...nuevoDoc, tipo_documento: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-teal-600 font-medium text-slate-800 bg-white">
                  <option value="Presupuesto Oficial">Presupuesto Oficial</option>
                  <option value="Cronograma de Actividades">Cronograma de Actividades</option>
                  <option value="Declaracion de Honestidad">Declaración de Honestidad Creativa</option>
                  <option value="Plan de Inversion">Plan de Inversión</option>
                  <option value="Propuesta Tecnica">Propuesta Técnica</option>
                  <option value="Anexos / Adiciones">Anexos / Adiciones</option>
                </select>
              </div>

              <button type="submit" className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm transition border border-teal-700 text-xs uppercase tracking-wider">
                📁 Cargar a ArchiveX
              </button>
            </form>
          </div>

          {/* Listado de archivos indexados en MySQL */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-4">
              <h2 className="text-slate-700 font-extrabold text-xs uppercase tracking-wider">
                Expedientes de la Investigación: <span className="text-[#c23616] ml-1">{proyectoSeleccionado.titulo}</span>
              </h2>
            </div>

            {loadingDocs ? (
              <div className="p-12 text-center text-xs text-slate-400 font-medium uppercase tracking-wide">Consultando bóveda de archivos...</div>
            ) : documentos.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs font-bold space-y-2 uppercase tracking-wider">
                <div className="text-3xl opacity-30">📁</div>
                <p>No se han registrado documentos o actas para esta investigación aún.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200">
                      <th className="px-6 py-3">Nombre del Archivo</th>
                      <th className="px-6 py-3 w-56">Categoría Requisito</th>
                      <th className="px-6 py-3 w-40 text-center">Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {documentos.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-3.5 text-blue-600 font-bold flex items-center gap-2 break-all">
                          <span>📄</span> {doc.nombre_archivo}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            {doc.tipo_documento}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center text-slate-400 text-[11px]">
                          {doc.fecha_subida ? new Date(doc.fecha_subida).toLocaleString('es-CO') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        
        /* PLANILLA CENTRAL DE PROYECTOS (VISTA DE TABLA PRINCIPAL) */
        <div className="space-y-4">
          
          {/* PANEL DE BÚSQUEDA FLOTANTE */}
          {mostrarPanelFiltros && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                <span className="text-slate-400 text-sm">🔍</span>
                <input 
                  type="text" 
                  value={busquedaCodigoTitulo} 
                  onChange={(e) => setBusquedaCodigoTitulo(e.target.value)} 
                  placeholder="Buscar por código (ej: INV4000) o palabras clave del título..." 
                  className="w-full text-xs font-medium text-slate-800 focus:outline-none bg-transparent"
                />
                {busquedaCodigoTitulo && (
                  <button onClick={() => setBusquedaCodigoTitulo('')} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-bold uppercase">Coincidencias: {proyectosFiltrados.length}</span>
            </div>
          )}

          <div className="white shadow-sm rounded-2xl overflow-hidden border border-slate-100">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-wrap gap-4 items-center justify-between text-xs font-semibold text-slate-600">
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-xl bg-teal-50 text-[#619c8f] p-1.5 rounded-lg">🟢</span>
                  <span className="font-bold uppercase text-slate-700 tracking-wide text-sm">
                    {esAdmin ? 'Gestión Global de Proyectos' : 'Mis Proyectos Asignados'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-slate-400 uppercase text-[10px]">Estado</label>
                  <select value={estadoFiltro} onChange={(e) => { setEstadoFiltro(e.target.value); setProyectoSeleccionado(null); }} className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none text-slate-700 font-medium shadow-sm">
                    <option value="">Todos</option>
                    <option value="Activo">Activo</option>
                    <option value="Liquidado">Liquidado</option>
                    <option value="En Evaluacion">En Evaluación</option>
                    <option value="Suspendido">Suspendido</option>
                  </select>
                </div>
              </div>

              {/* ACCIONES DEL PANEL DE CONTROL */}
              <div className="flex items-center gap-2">
                {esAdmin && (
                  <button onClick={() => setModalAbierto(true)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition flex items-center gap-1 border border-emerald-700">
                    ➕ Agregar Proyecto
                  </button>
                )}

                <button 
                  onClick={() => proyectoSeleccionado ? setVerDocumentacion(true) : mostrarMensajeTemporal('⚠️ Selecciona un proyecto de la lista primero.')}
                  className={`px-3 py-1.5 font-bold rounded-lg transition border flex items-center gap-1 shadow-sm ${proyectoSeleccionado ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                >
                  🔗 Documentación {proyectoSeleccionado && `(${proyectoSeleccionado.codigo})`}
                </button>

                <button onClick={handleExportarExcel} className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 shadow-sm transition flex items-center gap-1">
                  📊 Exportar
                </button>

                <button 
                  onClick={() => setMostrarPanelFiltros(!mostrarPanelFiltros)} 
                  className={`px-3 py-1.5 font-bold rounded-lg border shadow-sm transition flex items-center gap-1 ${mostrarPanelFiltros ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                >
                  🔍 {mostrarPanelFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border-b border-amber-100/60 px-6 py-2.5 flex items-center gap-2 text-[11px] text-amber-800 font-bold tracking-wide">
              <span>ℹ️</span> Los importes y presupuestos se gestionan en PESO COLOMBIANO (COP)
            </div>

            {error && <div className="p-4 text-xs font-semibold text-red-600 bg-red-50 text-center border-b border-red-100">⚠️ {error}</div>}

            {loading ? (
              <div className="p-16 text-center text-xs text-slate-400 font-semibold tracking-wide uppercase">Cargando portafolio de investigaciones...</div>
            ) : proyectosFiltrados.length === 0 ? (
              <div className="p-20 text-center text-slate-400 text-xs font-bold bg-slate-50/30 uppercase tracking-widest space-y-2">
                <div className="text-3xl opacity-40">💼</div>
                <p>No se encontraron registros que coincidan con los filtros aplicados.</p>
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
                    {proyectosFiltrados.map((proj) => {
                      const esSeleccionado = proyectoSeleccionado?.id === proj.id;
                      return (
                        <tr key={proj.id} onClick={() => setProyectoSeleccionado(esSeleccionado ? null : proj)} className={`cursor-pointer transition-colors ${esSeleccionado ? 'bg-teal-50/60 hover:bg-teal-50' : 'hover:bg-slate-50/70'}`}>
                          <td className="px-6 py-4 text-[#c23616] font-bold align-middle">
                            <span className="mr-1.5 opacity-70">🌐</span>{proj.codigo}
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
                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${proj.estado === 'Activo' ? 'bg-green-100 text-green-700' : proj.estado === 'Liquidado' ? 'bg-blue-100 text-blue-700' : proj.estado === 'Suspendido' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
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
      )}

      {/* FORMULARIO MODAL FLOTANTE (NUEVOS PROYECTOS) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider">Registrar Nuevo Proyecto Institucional</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-white text-lg font-bold">&times;</button>
            </div>
            <form onSubmit={handleGuardarProyecto} className="p-6 space-y-4 text-xs font-semibold text-slate-600">
              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Código Proyecto</label>
                <input type="text" required placeholder="Ej: INV3500" value={nuevoProyecto.codigo} onChange={(e) => setNuevoProyecto({...nuevoProyecto, codigo: e.target.value})} className="col-span-2 border border-slate-200 rounded-lg p-2 uppercase focus:outline-none focus:border-emerald-600 font-medium text-slate-800" />
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Título Completo</label>
                <textarea required placeholder="Nombre de la investigación..." value={nuevoProyecto.titulo} onChange={(e) => setNuevoProyecto({...nuevoProyecto, titulo: e.target.value})} className="col-span-2 border border-slate-200 rounded-lg p-2 h-16 uppercase focus:outline-none focus:border-emerald-600 font-medium text-slate-800" />
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Fecha Inicio</label>
                <input type="date" value={nuevoProyecto.fecha_inicio} onChange={(e) => setNuevoProyecto({...nuevoProyecto, fecha_inicio: e.target.value})} className="col-span-2 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-600 font-medium text-slate-800" />
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Fecha Finalización</label>
                <input type="date" value={nuevoProyecto.fecha_fin} onChange={(e) => setNuevoProyecto({...nuevoProyecto, fecha_fin: e.target.value})} className="col-span-2 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-600 font-medium text-slate-800" />
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Estado Inicial</label>
                <select value={nuevoProyecto.estado} onChange={(e) => setNuevoProyecto({...nuevoProyecto, estado: e.target.value})} className="col-span-2 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-600 font-medium text-slate-800 bg-white">
                  <option value="Activo">Activo</option>
                  <option value="Liquidado">Liquidado</option>
                  <option value="En Evaluacion">En Evaluación</option>
                  <option value="Suspendido">Suspendido</option>
                </select>
              </div>

              {/* SELECT AUTOMATIZADO CON DATA REAL DE LA BD */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Director (Docente)</label>
                <select
                  required
                  value={nuevoProyecto.director_id}
                  onChange={(e) => setNuevoProyecto({...nuevoProyecto, director_id: e.target.value})}
                  className="col-span-2 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-600 font-medium text-slate-800 bg-white"
                >
                  <option value="">-- Seleccione un Director --</option>
                  {directores.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre || d.nombre_completo || 'Usuario'} (ID: #{d.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm">Guardar en MySQL</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}