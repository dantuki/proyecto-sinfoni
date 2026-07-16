import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function MisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const obtenerSolicitudes = async () => {
    setCargando(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const respuesta = await axios.get(`${API_BASE}/postulaciones/mis-solicitudes`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (respuesta.data.status === 'success') {
        setSolicitudes(respuesta.data.data);
      } else {
        throw new Error(respuesta.data.message || 'Error al procesar las solicitudes.');
      }
    } catch (err) {
      console.error("Error al cargar las solicitudes:", err);
      setError(err.response?.data?.message || err.message || 'No se pudieron cargar tus solicitudes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerSolicitudes();
  }, []);

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'Aprobado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rechazado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'En Evaluación':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Radicado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5B9BD5]"></div>
        <span className="ml-3 text-slate-600 font-medium">Cargando tu historial...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/50 border border-red-100 p-8 rounded-3xl shadow-lg text-center max-w-md mx-auto mt-10">
        <span className="text-5xl">⚠️</span>
        <h3 className="text-xl font-bold text-slate-800 mt-4">Ha ocurrido un problema</h3>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
          {error}
        </p>
        <button
          onClick={obtenerSolicitudes}
          className="mt-5 px-6 py-2.5 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors shadow-md text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full text-slate-800 border border-slate-100/80 mt-2 p-8 transition-all duration-300">
      <div className="border-b border-slate-100 pb-5 mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Mis Solicitudes Radicadas</h2>
        <p className="text-sm text-slate-500 mt-1">
          Historial de propuestas de investigación que has enviado. Puedes hacer seguimiento al estado de evaluación y las respuestas del administrador.
        </p>
      </div>

      {solicitudes.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <span className="text-4xl">📁</span>
          <h3 className="text-base font-bold text-slate-700 mt-3">Sin propuestas registradas</h3>
          <p className="text-xs text-slate-400 mt-1">Aún no has radicado ninguna postulación en el sistema.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {solicitudes.map((sol) => (
            <div 
              key={sol.id} 
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="flex-1 space-y-3 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-extrabold px-3 py-1 bg-slate-100 rounded-lg text-slate-600">
                    {sol.num_solicitud}
                  </span>
                  <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${getEstadoBadge(sol.estado)}`}>
                    {sol.estado}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800 leading-snug">
                    {sol.titulo_propuesta}
                  </h3>
                  <p className="text-xs text-[#5B9BD5] font-semibold mt-1">
                    🎯 Convocatoria: {sol.convocatoria}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p>🏛️ <strong>Sede:</strong> {sol.sede}</p>
                  <p>📅 <strong>Radicado el:</strong> {new Date(sol.created_at).toLocaleDateString()}</p>
                  {sol.observaciones && (
                    <p className="sm:col-span-2 italic text-slate-400">
                      💬 <strong>Tus observaciones:</strong> {sol.observaciones}
                    </p>
                  )}
                </div>

                {sol.motivo_decision && (
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    sol.estado === 'Aprobado' 
                      ? 'bg-green-50/70 border-green-100 text-green-800' 
                      : 'bg-red-50/70 border-red-100 text-red-800'
                  }`}>
                    <strong className="block text-[10px] uppercase font-extrabold tracking-wider mb-1">
                      Retroalimentación de la Administración:
                    </strong>
                    {sol.motivo_decision}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center gap-2.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100 md:w-56 shrink-0 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-200 pb-1.5 mb-1">
                  Documentación Anexa
                </span>
                
                <a 
                  href={`http://localhost:5000${sol.presupuesto_url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 hover:text-[#5B9BD5] font-semibold flex items-center gap-2 transition-colors"
                >
                  📄 Presupuesto.pdf
                </a>

                <a 
                  href={`http://localhost:5000${sol.cronograma_url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 hover:text-[#5B9BD5] font-semibold flex items-center gap-2 transition-colors"
                >
                  📅 Cronograma.pdf
                </a>

                <a 
                  href={`http://localhost:5000${sol.honestidad_url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 hover:text-[#5B9BD5] font-semibold flex items-center gap-2 transition-colors"
                >
                  ✍️ Honestidad.pdf
                </a>

                <a 
                  href={`http://localhost:5000${sol.id_url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 hover:text-[#5B9BD5] font-semibold flex items-center gap-2 transition-colors"
                >
                  🆔 Identificación.pdf
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MisSolicitudes;