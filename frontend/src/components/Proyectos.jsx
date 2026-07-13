import React, { useState, useEffect } from 'react';

export default function Proyectos({ usuario, onVolver }) {
  const [proyectos, setProyectos] = useState([]);
  const [directores, setDirectores] = useState([]); 
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
    director_id: ''
  });

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const esAdmin = usuario?.rol === 'Admin' || usuario?.rol === 'Administrador';

  // Función obligatoria para abrir el modal generando el código de forma automática
  const abrirModalNuevoProyecto = () => {
    const consecutivoAleatorio = Math.floor(1000 + Math.random() * 9000);
    const codigoGenerado = `INV-${consecutivoAleatorio}`;
    
    setNuevoProyecto({
      codigo: codigoGenerado,
      titulo: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'Activo',
      director_id: ''
    });
    setModalAbierto(true);
  };

  const cargarDirectoresDisponibles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const resJson = await response.json();
        
        // Corregido: Extraemos la lista de usuarios usando la misma estructura que cargarProyectos
        const listaUsuarios = resJson.data || (Array.isArray(resJson) ? resJson : []);
        
        // Filtramos para que aparezcan los usuarios con rol Profesor (los encargados de dirigir)
        const profesores = listaUsuarios.filter(u => u.rol?.toLowerCase() === 'profesor');
        
        // Si el backend ya venía filtrado o por alguna razón el filtro da vacío, dejamos la lista completa como salvavidas
        setDirectores(profesores.length > 0 ? profesores : listaUsuarios);
      }
    } catch (err) {
      console.error('Error al mapear directores:', err);
    }
  };

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
      console.error('Error cargando documentos:', err);
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

  const proyectosFiltrados = proyectos.filter((proj) => {
    const term = busquedaCodigoTitulo.toLowerCase().trim();
    if (!term) return true;
    return (
      (proj.codigo?.toLowerCase() || '').includes(term) ||
      (proj.titulo?.toLowerCase() || '').includes(term)
    );
  });

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
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Proyectos_ArchiveX.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    mostrarMensajeTemporal('📊 ¡Reporte Excel descargado exitosamente!');
  };

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
        mostrarMensajeTemporal('🎉 ¡Proyecto guardado con éxito!');
        setModalAbierto(false);
        cargarProyectos();
      } else {
        alert(resJson.error || 'Error al guardar el proyecto.');
      }
    } catch (err) {
      alert('Error de conexión al servidor.');
    }
  };

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

      if (response.ok) {
        mostrarMensajeTemporal('📄 ¡Documento indexado correctamente!');
        setNuevoDoc({ nombre_archivo: '', tipo_documento: 'Propuesta Técnica' });
        cargarDocumentos(proyectoSeleccionado.id);
      } else {
        alert('Error al guardar el documento.');
      }
    } catch (err) {
      alert('Error de red en el repositorio.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-4 space-y-6 p-6 bg-white rounded-2xl shadow-xl border border-slate-200 relative">
      
      {/* Notificación flotante */}
      {notificacion && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 border border-slate-700">
          {notificacion}
        </div>
      )}

      {/* CABECERA PRINCIPAL VISTA PROYECTOS */}
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
        <button onClick={verDocumentacion ? () => setVerDocumentacion(false) : onVolver} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition">
          {verDocumentacion ? '← Volver a Proyectos' : '← Volver al Panel'}
        </button>
        <h1 className="text-slate-700 font-extrabold uppercase text-xs tracking-wider">Módulo de Investigaciones</h1>
      </div>

      {/* SUB-MÓDULO DE DOCUMENTACIÓN */}
      {verDocumentacion && proyectoSeleccionado ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 h-fit">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase">Requisitos</span>
              <h2 className="text-slate-700 font-extrabold text-sm uppercase mt-1">Adjuntar Entregable</h2>
              <p className="text-slate-500 text-[11px] font-medium leading-relaxed mt-0.5">Proyecto seleccionado: <span className="text-red-600 font-bold">{proyectoSeleccionado.codigo}</span>.</p>
            </div>

            <form onSubmit={handleSubirDocumento} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="space-y-1">
                <label className="uppercase text-[10px] text-slate-400">Nombre del Archivo</label>
                <input type="text" required placeholder="Ej: PRESUPUESTO.xlsx" value={nuevoDoc.nombre_archivo} onChange={(e) => setNuevoDoc({...nuevoDoc, nombre_archivo: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 bg-white font-medium text-slate-800 focus:outline-none focus:border-teal-600" />
              </div>

              <div className="space-y-1">
                <label className="uppercase text-[10px] text-slate-400">Tipo de Documento</label>
                <select value={nuevoDoc.tipo_documento} onChange={(e) => setNuevoDoc({...nuevoDoc, tipo_documento: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-teal-600 font-medium text-slate-800 bg-white">
                  <option value="Presupuesto Oficial">Presupuesto Oficial</option>
                  <option value="Cronograma de Actividades">Cronograma de Actividades</option>
                  <option value="Declaracion de Honestidad">Declaración de Honestidad</option>
                  <option value="Propuesta Tecnica">Propuesta Técnica</option>
                </select>
              </div>

              <button type="submit" className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm transition text-xs uppercase">
                📁 Cargar a ArchiveX
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-white border-b border-slate-200 p-4">
              <h2 className="text-slate-700 font-extrabold text-xs uppercase tracking-wider">
                Expedientes de la Investigación: <span className="text-red-600 ml-1">{proyectoSeleccionado.titulo}</span>
              </h2>
            </div>

            {loadingDocs ? (
              <div className="p-12 text-center text-xs text-slate-400 font-medium uppercase">Consultando archivos...</div>
            ) : documentos.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs font-bold space-y-2 uppercase">
                <div className="text-3xl opacity-30">📁</div>
                <p>No se han registrado documentos aún.</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200">
                      <th className="px-6 py-3">Nombre del Archivo</th>
                      <th className="px-6 py-3 w-56">Categoría</th>
                      <th className="px-6 py-3 w-40 text-center">Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {documentos.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition">
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
        
        /* PLANILLA CENTRAL DE PROYECTOS */
        <div className="space-y-4">
          
          {/* PANEL DE BÚSQUEDA FLOTANTE */}
          {mostrarPanelFiltros && (
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex-1 flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm">
                <span className="text-slate-400 text-sm">🔍</span>
                <input 
                  type="text" 
                  value={busquedaCodigoTitulo} 
                  onChange={(e) => setBusquedaCodigoTitulo(e.target.value)} 
                  placeholder="Buscar por código o palabras clave del título..." 
                  className="w-full text-xs font-medium text-slate-800 focus:outline-none bg-transparent"
                />
                {busquedaCodigoTitulo && (
                  <button onClick={() => setBusquedaCodigoTitulo('')} className="text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-bold uppercase whitespace-nowrap">Coincidencias: {proyectosFiltrados.length}</span>
            </div>
          )}

          {/* TABLA PRINCIPAL CON DISEÑO SÓLIDO BLANCO */}
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-slate-200">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between text-xs font-semibold text-slate-600">
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🟢</span>
                  <span className="font-bold uppercase text-slate-800 tracking-wide text-xs">
                    {esAdmin ? 'Gestión Global de Proyectos' : 'Mis Proyectos Asignados'}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white px-2 py-1 border border-slate-200 rounded-lg">
                  <label className="text-slate-400 uppercase text-[9px]">Estado:</label>
                  <select value={estadoFiltro} onChange={(e) => { setEstadoFiltro(e.target.value); setProyectoSeleccionado(null); }} className="bg-transparent focus:outline-none text-slate-700 font-bold text-[11px]">
                    <option value="">Todos</option>
                    <option value="Activo">Activo</option>
                    <option value="Liquidado">Liquidado</option>
                    <option value="En Evaluacion">En Evaluación</option>
                    <option value="Suspendido">Suspendido</option>
                  </select>
                </div>
              </div>

              {/* ACCIONES DEL PANEL DE CONTROL CORREGIDAS (FLEX WRAP) */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                {esAdmin && (
                  <button onClick={abrirModalNuevoProyecto} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition flex items-center gap-1 text-[11px] uppercase">
                    ➕ Agregar Proyecto
                  </button>
                )}

                <button 
                  onClick={() => proyectoSeleccionado ? setVerDocumentacion(true) : mostrarMensajeTemporal('⚠️ Selecciona un proyecto de la lista primero.')}
                  className={`px-3 py-2 font-bold rounded-lg transition border flex items-center gap-1 shadow-sm text-[11px] uppercase ${proyectoSeleccionado ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                >
                  🔗 Documentación {proyectoSeleccionado && `(${proyectoSeleccionado.codigo})`}
                </button>

                <button onClick={handleExportarExcel} className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 shadow-sm transition flex items-center gap-1 text-[11px] uppercase">
                  📊 Exportar
                </button>

                <button 
                  onClick={() => setMostrarPanelFiltros(!mostrarPanelFiltros)} 
                  className={`px-3 py-2 font-bold rounded-lg border shadow-sm transition flex items-center gap-1 text-[11px] uppercase ${mostrarPanelFiltros ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                >
                  🔍 {mostrarPanelFiltros ? 'Ocultar Filtros' : 'Buscar'}
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border-b border-amber-200/60 px-6 py-2 flex items-center gap-2 text-[10px] text-amber-800 font-bold tracking-wide uppercase">
              <span>ℹ️</span> Los importes y presupuestos se gestionan en PESO COLOMBIANO (COP)
            </div>

            {error && <div className="p-4 text-xs font-semibold text-red-600 bg-red-50 text-center border-b border-red-100">⚠️ {error}</div>}

            {loading ? (
              <div className="p-16 text-center text-xs text-slate-400 font-semibold tracking-wide uppercase bg-white">Cargando portafolio de investigaciones...</div>
            ) : proyectosFiltrados.length === 0 ? (
              <div className="p-20 text-center text-slate-400 text-xs font-bold bg-white uppercase tracking-widest space-y-2">
                <div className="text-3xl opacity-40">💼</div>
                <p>No se encontraron registros en la base de datos.</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-700 text-white text-[10px] uppercase font-bold tracking-wider border-b border-slate-600">
                      <th className="px-6 py-3.5 w-32">Código</th>
                      <th className="px-6 py-3.5">Título del Proyecto</th>
                      <th className="px-6 py-3.5 w-40 text-center">F. Comienzo</th>
                      <th className="px-6 py-3.5 w-40 text-center">F. Finalización</th>
                      <th className="px-6 py-3.5 w-36 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs text-slate-800 bg-white">
                    {proyectosFiltrados.map((proj) => {
                      const esSeleccionado = proyectoSeleccionado?.id === proj.id;
                      return (
                        <tr key={proj.id} onClick={() => setProyectoSeleccionado(esSeleccionado ? null : proj)} className={`cursor-pointer transition-colors ${esSeleccionado ? 'bg-teal-50 hover:bg-teal-100/70' : 'bg-white hover:bg-slate-50'}`}>
                          <td className="px-6 py-4 text-red-700 font-bold align-middle">
                            <span className="mr-1.5 opacity-70">🌐</span>{proj.codigo}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wide text-[11px] leading-normal align-middle">
                            {proj.titulo}
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium text-center align-middle">
                            {proj.fecha_inicio ? new Date(proj.fecha_inicio).toLocaleDateString('es-CO', { timeZone: 'UTC' }) : '—'}
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium text-center align-middle">
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

      {/* FORMULARIO MODAL (CON INPUT READONLY AUTOMÁTICO Y SÓLIDO) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider">Registrar Nuevo Proyecto</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-white text-lg font-bold">&times;</button>
            </div>
            <form onSubmit={handleGuardarProyecto} className="p-6 space-y-4 text-xs font-semibold text-slate-600 bg-white">
              
              {/* CAMPO TOTALMENTE AUTOMÁTICO (BLOQUEADO) */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Código Proyecto</label>
                <div className="col-span-2 relative">
                  <input 
                    type="text" 
                    readOnly 
                    value={nuevoProyecto.codigo} 
                    className="w-full border border-slate-300 bg-slate-100 text-slate-600 font-extrabold tracking-widest rounded-lg p-2.5 cursor-not-allowed focus:outline-none border-dashed"
                  />
                  <span className="absolute right-2 top-2.5 text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded uppercase">Auto</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Título Completo</label>
                <textarea required placeholder="Nombre de la investigación..." value={nuevoProyecto.titulo} onChange={(e) => setNuevoProyecto({...nuevoProyecto, titulo: e.target.value})} className="col-span-2 border border-slate-300 bg-white text-slate-800 rounded-lg p-2 h-16 uppercase focus:outline-none focus:border-slate-600 font-medium" />
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Fecha Inicio</label>
                <input type="date" required value={nuevoProyecto.fecha_inicio} onChange={(e) => setNuevoProyecto({...nuevoProyecto, fecha_inicio: e.target.value})} className="col-span-2 border border-slate-300 bg-white text-slate-800 rounded-lg p-2 focus:outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Fecha Fin</label>
                <input type="date" required value={nuevoProyecto.fecha_fin} onChange={(e) => setNuevoProyecto({...nuevoProyecto, fecha_fin: e.target.value})} className="col-span-2 border border-slate-300 bg-white text-slate-800 rounded-lg p-2 focus:outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Estado Inicial</label>
                <select value={nuevoProyecto.estado} onChange={(e) => setNuevoProyecto({...nuevoProyecto, estado: e.target.value})} className="col-span-2 border border-slate-300 bg-white text-slate-800 rounded-lg p-2 focus:outline-none">
                  <option value="Activo">Activo</option>
                  <option value="Liquidado">Liquidado</option>
                  <option value="En Evaluacion">En Evaluación</option>
                  <option value="Suspendido">Suspendido</option>
                </select>
              </div>

              {/* CAMPO DE SELECCIÓN DE DIRECTOR (PROFESORES DE MYSQL CORREGIDOS) */}
              <div className="grid grid-cols-3 gap-2 items-center">
                <label className="uppercase text-[10px] text-slate-400">Director</label>
                <select
                  required
                  value={nuevoProyecto.director_id}
                  onChange={(e) => setNuevoProyecto({...nuevoProyecto, director_id: e.target.value})}
                  className="col-span-2 border border-slate-300 bg-white text-slate-800 rounded-lg p-2 focus:outline-none text-xs uppercase font-medium"
                >
                  <option value="">-- Seleccione el Profesor Encargado --</option>
                  {directores.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre_completo || d.nombre || 'Usuario'} (ID: #{d.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition">Guardar en MySQL</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}