import { useState, useEffect } from 'react';
import axios from 'react';

const MisSolicitudes = ({ usuario, alRedireccionarConvocatorias }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  useEffect(() => {
    const obtenerSolicitudes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/postulaciones/mis-solicitudes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // CORRECCIÓN: Extrae la data interna o respalda con array vacío si no es un array
        const datosReales = response.data?.data || response.data?.solicitudes || response.data;
        setSolicitudes(Array.isArray(datosReales) ? datosReales : []);
        setCargando(false);
      } catch (err) {
        console.error('Error al cargar las solicitudes:', err);
        setError('No se pudieron cargar tus solicitudes. Por favor, intenta de nuevo más tarde.');
        setCargando(false);
      }
    };

    obtenerSolicitudes();
  }, []);

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A';
    try {
      const fechaObj = new Date(fechaStr);
      return fechaObj.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return fechaStr;
    }
  };

  const handleDescargar = (rutaPdf) => {
    if (!rutaPdf) return;
    const baseUrl = 'http://localhost:5000';
    const cleanedPath = rutaPdf.replace(/\\/g, '/');
    const urlCompleta = cleanedPath.startsWith('http') ? cleanedPath : `${baseUrl}/${cleanedPath}`;
    window.open(urlCompleta, '_blank');
  };

  const obtenerEstiloEstado = (estado) => {
    const estadoNormalizado = (estado || '').toLowerCase();
    if (estadoNormalizado.includes('radicad')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (estadoNormalizado.includes('revis') || estadoNormalizado.includes('proces') || estadoNormalizado.includes('evaluacion')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (estadoNormalizado.includes('aprob') || estadoNormalizado.includes('acept')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (estadoNormalizado.includes('rechaz')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B9BD5] mb-4"></div>
        <p className="text-slate-500 font-medium">Cargando tus solicitudes de radicación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-xl mx-auto my-10">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-lg font-bold text-red-800 mt-4">Ha ocurrido un problema</h3>
        <p className="text-red-600 text-sm mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mis Solicitudes Radicadas</h2>
          <p className="text-slate-500 text-sm mt-1">Sigue el estado en tiempo real de tus propuestas de investigación enviadas.</p>
        </div>
        <button
          onClick={alRedireccionarConvocatorias}
          className="px-5 py-2.5 bg-[#5B9BD5] hover:bg-[#4a89c0] text-white font-semibold text-sm rounded-xl transition-all shadow-sm self-start md:self-center"
        >
          Radicar Nueva Propuesta
        </button>
      </div>

      {solicitudes.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center max-w-lg mx-auto">
          <span className="text-5xl">📁</span>
          <h3 className="text-xl font-bold text-slate-700 mt-4">Aún no tienes solicitudes radicadas</h3>
          <p className="text-slate-400 text-sm mt-2">No registras ninguna propuesta enviada bajo este usuario en SINFONI.</p>
          <button
            onClick={alRedireccionarConvocatorias}
            className="mt-6 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all"
          >
            Ver Convocatorias Abiertas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Código</th>
                    <th className="px-6 py-4">Propuesta / Convocatoria</th>
                    <th className="px-6 py-4">Fecha Radicación</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {solicitudes.map((sol) => {
                    const cod = sol.codigo_solicitud || sol.codigo_propuesta || sol.codigo || `PROP-${sol.id}`;
                    const tit = sol.titulo_proyecto || sol.titulo_propuesta || sol.titulo || sol.convocatoria_titulo || 'Proyecto Radicado';
                    const fechaRad = sol.fecha_radicacion || sol.created_at;
                    const est = sol.estado || 'Radicado';
                    const pdf = sol.archivo_pdf || sol.ruta_pdf || sol.pdf_ruta || sol.ruta_archivo;

                    return (
                      <tr key={sol.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-[#5B9BD5]">
                          {cod}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{tit}</div>
                          {sol.convocatoria_nombre && (
                            <div className="text-xs text-slate-400 mt-0.5">{sol.convocatoria_nombre}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                          {formatearFecha(fechaRad)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${obtenerEstiloEstado(est)}`}>
                            {est}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                          <button
                            onClick={() => setSolicitudSeleccionada(solicitudSeleccionada?.id === sol.id ? null : sol)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                          >
                            {solicitudSeleccionada?.id === sol.id ? 'Ocultar Detalles' : 'Ver Detalles'}
                          </button>
                          {pdf && (
                            <button
                              onClick={() => handleDescargar(pdf)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors border border-emerald-100"
                            >
                              Descargar PDF
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {solicitudSeleccionada && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  Detalles de la Radicación: <span className="font-mono text-[#5B9BD5]">{solicitudSeleccionada.codigo_solicitud || solicitudSeleccionada.codigo || `PROP-${solicitudSeleccionada.id}`}</span>
                </h3>
                <button 
                  onClick={() => setSolicitudSeleccionada(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕ Cerrar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Título de la propuesta</span>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                      {solicitudSeleccionada.titulo_proyecto || solicitudSeleccionada.titulo_propuesta || solicitudSeleccionada.titulo || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Convocatoria</span>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                      {solicitudSeleccionada.convocatoria_nombre || 'Convocatoria General'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha de envío</span>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {formatearFecha(solicitudSeleccionada.fecha_radicacion || solicitudSeleccionada.created_at)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado actual</span>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${obtenerEstiloEstado(solicitudSeleccionada.estado)}`}>
                        {solicitudSeleccionada.estado || 'Radicado'}
                      </span>
                    </div>
                  </div>
                  {(solicitudSeleccionada.archivo_pdf || solicitudSeleccionada.ruta_pdf || solicitudSeleccionada.pdf_ruta || solicitudSeleccionada.ruta_archivo) && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Documento radicado</span>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-xs text-slate-500 truncate max-w-xs">
                          {solicitudSeleccionada.archivo_pdf || solicitudSeleccionada.ruta_pdf || solicitudSeleccionada.pdf_ruta || solicitudSeleccionada.ruta_archivo}
                        </span>
                        <button
                          onClick={() => handleDescargar(solicitudSeleccionada.archivo_pdf || solicitudSeleccionada.ruta_pdf || solicitudSeleccionada.pdf_ruta || solicitudSeleccionada.ruta_archivo)}
                          className="text-xs text-[#5B9BD5] hover:underline font-semibold"
                        >
                          [Ver documento]
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* MEJORA: Historial y retroalimentación para estados finales (Aprobado/Aceptado y Rechazado) */}
              {(solicitudSeleccionada.estado?.toLowerCase().includes('rechaz') || solicitudSeleccionada.estado?.toLowerCase().includes('aprob') || solicitudSeleccionada.estado?.toLowerCase().includes('acept')) && (
                <div className={`mt-6 p-4 border-l-4 rounded-r-xl ${
                  solicitudSeleccionada.estado?.toLowerCase().includes('rechaz') 
                    ? 'bg-rose-50 border-rose-500 text-rose-800' 
                    : 'bg-emerald-50 border-emerald-500 text-emerald-800'
                }`}>
                  <div className="flex">
                    <span className="text-xl mr-3">
                      {solicitudSeleccionada.estado?.toLowerCase().includes('rechaz') ? '❌' : '🎉'}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold">
                        {solicitudSeleccionada.estado?.toLowerCase().includes('rechaz') 
                          ? 'Propuesta Rechazada por el Administrador' 
                          : '¡Propuesta Aprobada con Éxito!'}
                      </h4>
                      <p className={`mt-1 text-sm leading-relaxed font-semibold ${
                        solicitudSeleccionada.estado?.toLowerCase().includes('rechaz') ? 'text-rose-700' : 'text-emerald-700'
                      }`}>
                        Retroalimentación oficial:
                      </p>
                      <p className={`mt-1 text-sm leading-relaxed ${
                        solicitudSeleccionada.estado?.toLowerCase().includes('rechaz') ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {solicitudSeleccionada.motivo_decision || solicitudSeleccionada.observaciones || 'No se detallaron observaciones en el sistema.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MisSolicitudes;