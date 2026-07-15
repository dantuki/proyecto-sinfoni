import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function RevisarSolicitudes({ usuario }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  const obtenerSolicitudes = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      const respuesta = await axios.get(`${API_BASE}/postulaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (respuesta.data.status === 'success') {
        const listado = Array.isArray(respuesta.data.data) ? respuesta.data.data : respuesta.data.data?.postulaciones || [];
        setSolicitudes(listado);
      } else {
        throw new Error(respuesta.data.message || 'Error al obtener solicitudes.');
      }
    } catch (err) {
      console.error("Error al cargar postulaciones:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerSolicitudes();
  }, []);

  const descargarDocumento = (nombreArchivo) => {
    if (!nombreArchivo) {
      alert("Este documento no fue cargado correctamente o no está disponible.");
      return;
    }
    const urlCompleta = nombreArchivo.startsWith('http') 
      ? nombreArchivo 
      : `http://localhost:5000/uploads/${nombreArchivo}`;
    
    window.open(urlCompleta, '_blank');
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await axios.put(`${API_BASE}/postulaciones/${id}/estado`, 
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (respuesta.data.status === 'success') {
        setSolicitudes(prev => 
          prev.map(sol => sol.id === id ? { ...sol, estado: nuevoEstado } : sol)
        );
      } else {
        alert("No se pudo actualizar el estado de la propuesta.");
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert(err.response?.data?.message || "Ocurrió un error al actualizar el estado en el servidor.");
    }
  };

  const solicitudesFiltradas = solicitudes.filter(sol => {
    const coincideTexto = 
      sol.codigoPropuesta?.toLowerCase().includes(busqueda.toLowerCase()) ||
      sol.titulo_propuesta?.toLowerCase().includes(busqueda.toLowerCase()) ||
      sol.docente_nombre?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado = filtroEstado === 'Todos' || sol.estado === filtroEstado;

    return coincideTexto && coincideEstado;
  });

  // Estilos visuales sincronizados con los estados de tu MySQL ENUM
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
      {/* Encabezado Principal */}
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
          onClick={obtenerSolicitudes}
          className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-[#5B9BD5] bg-white border border-slate-200 hover:border-[#5B9BD5]/30 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          🔄 Sincronizar Bandeja
        </button>
      </div>

      {/* Filtros y Buscador Premium */}
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

      {/* Estados del Contenido */}
      {cargando ? (
        <div className="bg-white p-16 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[#5B9BD5] rounded-full" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="text-slate-500 text-sm font-medium mt-4">Consultando base de datos de SINFONI...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50/50 p-8 rounded-3xl border border-red-100/60 text-center max-w-md mx-auto">
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
        /* Tabla Principal Premium */
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
                  <tr key={sol.id} className="hover:bg-slate-50/40 transition-colors group">
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
                      <div className="flex flex-col gap-2">
                        <select
                          value={sol.estado}
                          onChange={(e) => handleCambiarEstado(sol.id, e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none transition-all cursor-pointer ${getBadgeStyles(sol.estado)}`}
                        >
                          <option value="Radicado">📁 Radicado</option>
                          <option value="En Evaluación">🔍 En Evaluación</option>
                          <option value="Aprobado">✅ Aprobado</option>
                          <option value="Rechazado">❌ Rechazado</option>
                        </select>
                        <span className="text-[10px] text-slate-400 text-center font-medium">
                          Registrado: {sol.fecha_radicacion ? new Date(sol.fecha_radicacion).toLocaleDateString() : 'Recientemente'}
                        </span>
                      </div>
                    </td>
                  </tr>
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