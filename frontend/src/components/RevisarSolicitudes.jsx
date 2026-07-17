import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Subcomponente premium para manejar el estado independiente de cada solicitud en la tabla
function FilaSolicitud({ sol, evaluadores, descargarDocumento, getBadgeStyles, onActualizarEstado, onAsignarEvaluador }) {
  const [nuevoEstado, setNuevoEstado] = useState(sol.estado);
  const [motivo, setMotivo] = useState(sol.motivo_decision || '');
  const [mostrarMotivoInput, setMostrarMotivoInput] = useState(sol.estado === 'Rechazado');
  const [mostrarEvaluadorInput, setMostrarEvaluadorInput] = useState(sol.estado === 'En Evaluación');
  const [evaluadorSeleccionado, setEvaluadorSeleccionado] = useState(sol.evaluador_id || '');
  const [enviando, setEnviando] = useState(false);

  // Sincronizar el componente hijo con nuevas cargas desde la base de datos
  useEffect(() => {
    setNuevoEstado(sol.estado);
    setMotivo(sol.motivo_decision || '');
    setMostrarMotivoInput(sol.estado === 'Rechazado');
    setMostrarEvaluadorInput(sol.estado === 'En Evaluación');
    setEvaluadorSeleccionado(sol.evaluador_id || '');
  }, [sol]);

  const handleEstadoChange = async (e) => {
    const estadoSeleccionado = e.target.value;
    setNuevoEstado(estadoSeleccionado);
    
    if (estadoSeleccionado === 'Rechazado') {
      setMostrarMotivoInput(true);
      setMostrarEvaluadorInput(false);
    } else if (estadoSeleccionado === 'En Evaluación') {
      setMostrarEvaluadorInput(true);
      setMostrarMotivoInput(false);
    } else {
      setMostrarMotivoInput(false);
      setMostrarEvaluadorInput(false);
      // Actualizamos automáticamente si el nuevo estado no es un Rechazo ni una Evaluación pendiente de asignar
      await guardarCambioEstado(estadoSeleccionado, null);
    }
  };

  const guardarCambioEstado = async (estadoDestino, motivoTexto) => {
    setEnviando(true);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      const respuesta = await axios.put(`${API_BASE}/postulaciones/${sol.id}/estado`, {
        estado: estadoDestino,
        motivo_decision: estadoDestino === 'Rechazado' ? motivoTexto : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (respuesta.data.status === 'success') {
        onActualizarEstado(sol.id, estadoDestino, estadoDestino === 'Rechazado' ? motivoTexto : null);
        if (estadoDestino !== 'Rechazado') {
          alert("Estado actualizado correctamente.");
        } else {
          alert("Propuesta rechazada con éxito.");
        }
      } else {
        alert("No se pudo actualizar el estado de la propuesta.");
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert(err.response?.data?.message || "Ocurrió un error al actualizar el estado.");
      setNuevoEstado(sol.estado);
      setMostrarMotivoInput(sol.estado === 'Rechazado');
      setMostrarEvaluadorInput(sol.estado === 'En Evaluación');
    } finally {
      setEnviando(false);
    }
  };

  const handleConfirmarRechazo = async () => {
    if (!motivo.trim()) {
      alert("Error: Para rechazar una propuesta debes escribir obligatoriamente el motivo.");
      return;
    }
    await guardarCambioEstado('Rechazado', motivo);
  };

  const handleConfirmarAsignacion = async () => {
    if (!evaluadorSeleccionado) {
      alert("Error: Debes seleccionar un evaluador de la lista.");
      return;
    }
    setEnviando(true);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      // Enviamos la petición para guardar la asignación del evaluador en la base de datos
      const respuesta = await axios.post(`${API_BASE}/asignacion`, {
        postulacionId: sol.id,
        evaluadorId: parseInt(evaluadorSeleccionado)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (respuesta.data.status === 'success') {
        // Ejecutamos la actualización de estado a 'En Evaluación'
        await guardarCambioEstado('En Evaluación', null);
        onAsignarEvaluador(sol.id, evaluadorSeleccionado);
        alert("Evaluador asignado y propuesta puesta en evaluación.");
      } else {
        alert("No se pudo completar la asignación del evaluador.");
      }
    } catch (err) {
      console.error("Error al asignar evaluador:", err);
      alert(err.response?.data?.message || "Ocurrió un error al asignar el evaluador.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <tr className="hover:bg-slate-50/40 transition-colors group">
      <td className="py-5 px-6 max-w-xs">
        <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200/50 mb-1.5">
          {sol.codigoPropuesta}
        </span>
        <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#5B9BD5] transition-colors">
          {sol.titulo_propuesta}
        </h3>
        {sol.observaciones && (
          <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
            Nota: "{sol.observaciones}"
          </p>
        )}
        {sol.estado === 'Rechazado' && sol.motivo_decision && !mostrarMotivoInput && (
          <div className="mt-2 p-2 bg-red-50/60 border border-red-100/50 rounded-xl text-[11px] text-red-700 leading-relaxed">
            <strong>Motivo registrado:</strong> {sol.motivo_decision}
          </div>
        )}
        {sol.evaluador_nombre && (
          <div className="mt-2 p-2 bg-blue-50/60 border border-blue-100/50 rounded-xl text-[11px] text-blue-700 leading-relaxed">
            <strong>Evaluador asignado:</strong> {sol.evaluador_nombre}
          </div>
        )}
      </td>

      <td className="py-5 px-6">
        <div className="font-semibold text-slate-800">{sol.docente_nombre || 'Docente Asociado'}</div>
        <div className="text-xs text-slate-500 mt-0.5">{sol.docente_correo || 'Correo no especificado'}</div>
        <div className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-slate-500 bg-slate-100/60 px-2 py-0.5 rounded-md border border-slate-200/40">
          📍 {sol.nombre_sede || `Sede (ID: ${sol.sede})`}
        </div>
      </td>

      <td className="py-5 px-6">
        <div className="grid grid-cols-2 gap-1.5 max-w-[280px]">
          <button
            onClick={() => descargarDocumento(sol.presupuesto)}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-[#5B9BD5] border border-slate-200/60 transition-colors flex items-center justify-center gap-1"
            title="Presupuesto"
          >
            📋 Presupuesto
          </button>
          <button
            onClick={() => descargarDocumento(sol.cronograma)}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-[#5B9BD5] border border-slate-200/60 transition-colors flex items-center justify-center gap-1"
            title="Cronograma"
          >
            📅 Cronograma
          </button>
          <button
            onClick={() => descargarDocumento(sol.honestidad)}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-[#5B9BD5] border border-slate-200/60 transition-colors flex items-center justify-center gap-1"
            title="Declaración de Honestidad"
          >
            ✍️ Honestidad
          </button>
          <button
            onClick={() => descargarDocumento(sol.id_documento)}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-[#5B9BD5] border border-slate-200/60 transition-colors flex items-center justify-center gap-1"
            title="Soporte de Identidad"
          >
            🪪 Identidad
          </button>
        </div>
      </td>

      <td className="py-5 px-6">
        <div className="flex flex-col gap-2 min-w-[170px]">
          <select
            value={nuevoEstado}
            onChange={handleEstadoChange}
            disabled={enviando}
            className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none transition-all cursor-pointer ${getBadgeStyles(nuevoEstado)}`}
          >
            <option value="Radicado">📁 Radicado</option>
            <option value="En Evaluación">🔍 En Evaluación</option>
            <option value="Aprobado">✅ Aprobado</option>
            <option value="Rechazado">❌ Rechazado</option>
          </select>

          {/* Selector condicional para asignar Evaluador Docente */}
          {mostrarEvaluadorInput && (
            <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl space-y-2 mt-1">
              <label className="block text-[9px] uppercase font-extrabold text-amber-800 tracking-wider">
                Seleccionar Evaluador *
              </label>
              <select
                value={evaluadorSeleccionado}
                onChange={(e) => setEvaluadorSeleccionado(e.target.value)}
                disabled={enviando}
                className="w-full p-2 border border-amber-200 rounded-lg text-[11px] focus:ring-2 focus:ring-amber-200 outline-none bg-white text-slate-700 font-medium"
              >
                <option value="">-- Elige un docente --</option>
                {evaluadores.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.nombre_completo} ({ev.correo})
                  </option>
                ))}
              </select>
              <button
                onClick={handleConfirmarAsignacion}
                disabled={enviando || !evaluadorSeleccionado}
                className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                {enviando ? 'Asignando...' : 'Confirmar Asignación'}
              </button>
            </div>
          )}

          {/* Formulario Inline Condicional para exigir la justificación */}
          {mostrarMotivoInput && (
            <div className="bg-red-50/50 border border-red-100 p-3 rounded-xl space-y-2 mt-1">
              <label className="block text-[9px] uppercase font-extrabold text-red-700 tracking-wider">
                Motivo de Rechazo Obligatorio *
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Especifica el por qué..."
                rows="2"
                disabled={enviando}
                className="w-full p-2 border border-red-200 rounded-lg text-[11px] focus:ring-2 focus:ring-red-200 outline-none resize-none bg-white text-slate-700"
                required
              />
              <button
                onClick={handleConfirmarRechazo}
                disabled={enviando}
                className="w-full py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                {enviando ? 'Guardando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          )}

          <span className="text-[10px] text-slate-400 text-center font-medium">
            Registrado: {sol.fecha_radicacion ? new Date(sol.fecha_radicacion).toLocaleDateString() : 'Recientemente'}
          </span>
        </div>
      </td>
    </tr>
  );
}

function RevisarSolicitudes({ usuario }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [evaluadores, setEvaluadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  const obtenerDatos = async () => {
    try {
      setCargando(true);
      setError(null);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');

      // 1. Obtener listado de postulaciones
      const respuestaPost = await axios.get(`${API_BASE}/postulaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (respuestaPost.data.status === 'success') {
        const listado = Array.isArray(respuestaPost.data.data) ? respuestaPost.data.data : respuestaPost.data.data?.postulaciones || [];
        setSolicitudes(listado);
      } else {
        throw new Error(respuestaPost.data.message || 'Error al obtener solicitudes.');
      }

      // 2. Obtener listado de Evaluadores disponibles
      const respuestaEv = await axios.get(`${API_BASE}/usuarios/evaluadores`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (respuestaEv.data.status === 'success') {
        setEvaluadores(respuestaEv.data.data || []);
      }
    } catch (err) {
      console.error("Error al cargar datos en panel de revisión:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const descargarDocumento = (nombreArchivo) => {
    if (!nombreArchivo) {
      alert("Este documento no fue cargado correctamente o no está disponible.");
      return;
    }

    if (nombreArchivo.startsWith('http')) {
      window.open(nombreArchivo, '_blank');
      return;
    }

    let nombreLimpio = nombreArchivo.replace(/^\/+/, '');

    if (nombreLimpio.startsWith('uploads/')) {
      nombreLimpio = nombreLimpio.replace(/^uploads\//, '');
    }

    const urlCompleta = `http://localhost:5000/uploads/${nombreLimpio}`;
    window.open(urlCompleta, '_blank');
  };

  const handleActualizarEstadoLocal = (id, nuevoEstado, motivoDecision) => {
    setSolicitudes(prev => 
      prev.map(sol => sol.id === id ? { ...sol, estado: nuevoEstado, motivo_decision: motivoDecision } : sol)
    );
  };

  const handleAsignarEvaluadorLocal = (id, evaluadorId) => {
    const evaluadorEncontrado = evaluadores.find(ev => ev.id === parseInt(evaluadorId));
    setSolicitudes(prev => 
      prev.map(sol => sol.id === id ? { 
        ...sol, 
        evaluador_id: evaluadorId, 
        evaluador_nombre: evaluadorEncontrado ? evaluadorEncontrado.nombre_completo : 'Evaluador asignado' 
      } : sol)
    );
  };

  const solicitudesFiltradas = solicitudes.filter(sol => {
    const coincideTexto = 
      sol.codigoPropuesta?.toLowerCase().includes(busqueda.toLowerCase()) ||
      sol.titulo_propuesta?.toLowerCase().includes(busqueda.toLowerCase()) ||
      sol.docente_nombre?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado = filtroEstado === 'Todos' || sol.estado === filtroEstado;

    return coincideTexto && coincideEstado;
  });

  const getBadgeStyles = (estado) => {
    switch (estado) {
      case 'Aprobado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Rechazado':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      case 'En Evaluación':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'Radicado':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 mb-8 gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#5B9BD5]/10 text-[#5B9BD5] mb-2 uppercase tracking-wide">
            🛡️ Consola del Administrador
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Revisión de Solicitudes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona, descarga la documentación y actualiza los estados de las propuestas de investigación radicadas.
          </p>
        </div>
        <button 
          onClick={obtenerDatos}
          className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-[#5B9BD5] bg-white border border-slate-200 hover:border-[#5B9BD5]/30 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          🔄 Sincronizar Bandeja
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 relative">
          <input
            type="text"
            placeholder="Buscar por código de propuesta, título o nombre del docente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5]/20 focus:border-[#5B9BD5] transition-all text-sm font-medium text-slate-700"
          />
          <span className="absolute left-4 top-3.5 text-slate-400 text-sm">🔍</span>
        </div>

        <div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5]/20 focus:border-[#5B9BD5] transition-all text-sm text-slate-700 font-semibold"
          >
            <option value="Todos">Filtro: Todos los Estados</option>
            <option value="Radicado">Radicado</option>
            <option value="En Evaluación">En Evaluación</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
      </div>

      {cargando ? (
        <div className="bg-white p-16 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[#5B9BD5] rounded-full" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="text-slate-500 text-sm font-medium mt-4">Consultando base de datos de SINFONI...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50/50 p-8 rounded-3xl border border-red-100/60 text-center max-w-md mx-auto animate-fade-in">
          <span className="text-4xl">❌</span>
          <h3 className="text-lg font-bold text-red-800 mt-4">Error de Comunicación</h3>
          <p className="text-red-600 text-xs mt-1 leading-relaxed">{error}</p>
        </div>
      ) : solicitudesFiltradas.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl shadow-sm border border-slate-100 text-center">
          <span className="text-5xl">📁</span>
          <h3 className="text-lg font-bold text-slate-700 mt-4">No se encontraron propuestas</h3>
          <p className="text-slate-400 text-sm mt-1">No hay solicitudes que coincidan con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-md border border-slate-100/80 overflow-hidden transition-all">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-4.5 px-6">Propuesta / Código</th>
                  <th className="py-4.5 px-6">Autor / Sede</th>
                  <th className="py-4.5 px-6">Documentación Requerida (PDFs)</th>
                  <th className="py-4.5 px-6">Estado de Evaluación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {solicitudesFiltradas.map((sol) => (
                  <FilaSolicitud
                    key={sol.id}
                    sol={sol}
                    evaluadores={evaluadores}
                    descargarDocumento={descargarDocumento}
                    getBadgeStyles={getBadgeStyles}
                    onActualizarEstado={handleActualizarEstadoLocal}
                    onAsignarEvaluador={handleAsignarEvaluadorLocal}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default RevisarSolicitudes;