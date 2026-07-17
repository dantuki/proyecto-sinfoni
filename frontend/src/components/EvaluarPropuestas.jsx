import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

const EvaluarPropuestas = ({ usuario }) => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el formulario de calificación
  const [propuestaSeleccionada, setPropuestaSeleccionada] = useState(null);
  const [puntaje, setPuntaje] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  useEffect(() => {
    if (usuario?.id) {
      obtenerAsignaciones();
    }
  }, [usuario]);

  const obtenerAsignaciones = async () => {
    if (!usuario?.id) return;

    try {
      setCargando(true);
      setError(null);
      
      const res = await fetch(`${API_BASE}/asignaciones/evaluador/${usuario.id}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      const resData = await res.json();

      if (res.ok && resData.status === 'success') {
        setAsignaciones(resData.data);
      } else {
        setError(resData.error || resData.message || 'Error al cargar las propuestas asignadas.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const descargarDocumento = (nombreArchivo) => {
    if (!nombreArchivo) {
      alert("Este documento no está disponible o no fue cargado.");
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

  const abrirCalificacion = (propuesta) => {
    setPropuestaSeleccionada(propuesta);
    setPuntaje(propuesta.puntaje || '');
    setComentarios(propuesta.comentarios || '');
    setMensajeExito('');
  };

  const guardarCalificacion = async (e) => {
    e.preventDefault();

    const pts = parseFloat(puntaje);
    if (isNaN(pts) || pts < 0 || pts > 100) {
      alert('Por favor ingresa un puntaje válido entre 0 y 100.');
      return;
    }
    if (!comentarios.trim()) {
      alert('Por favor añade comentarios de retroalimentación.');
      return;
    }

    try {
      setGuardando(true);
      const res = await fetch(`${API_BASE}/asignaciones/${propuestaSeleccionada.asignacion_id}/calificar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({
          puntaje: pts,
          comentarios: comentarios.trim()
        })
      });

      const resData = await res.json();

      if (res.ok && resData.status === 'success') {
        setMensajeExito('¡Evaluación guardada y finalizada exitosamente!');
        await obtenerAsignaciones();
        
        setTimeout(() => {
          setPropuestaSeleccionada(null);
        }, 2000);
      } else {
        alert(resData.message || 'Ocurrió un error al registrar la calificación.');
      }
    } catch (err) {
      alert('Error de conexión con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Panel de Evaluaciones</h2>
          <p className="text-slate-500 text-sm mt-1">
            Aquí puedes ver, descargar la documentación y calificar los proyectos de investigación asignados a tu perfil.
          </p>
        </div>
        <button 
          onClick={obtenerAsignaciones}
          className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-[#5B9BD5] bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl transition-all shadow-sm"
        >
          🔄 Actualizar Lista
        </button>
      </div>

      {cargando ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500">Cargando propuestas asignadas...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 text-red-600 rounded-2xl border border-red-100 shadow-sm">
          <p className="font-bold">Error del Servidor</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      ) : asignaciones.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-4xl">📁</span>
          <p className="text-slate-500 font-medium mt-4">No tienes propuestas asignadas en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className={`${propuestaSeleccionada ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
            {asignaciones.map((asig) => (
              <div 
                key={asig.asignacion_id}
                className={`p-6 bg-white rounded-2xl shadow-sm border transition-all ${
                  propuestaSeleccionada?.asignacion_id === asig.asignacion_id 
                    ? 'border-[#5B9BD5] ring-2 ring-[#5B9BD5]/10' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                    {asig.codigoPropuesta || 'SIN-CODIGO'}
                  </span>
                  
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    asig.estado_evaluacion === 'Finalizado' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {asig.estado_evaluacion === 'Finalizado' ? '✓ Evaluado' : '⏱️ Pendiente de Calificar'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base mb-2">{asig.titulo_propuesta}</h3>
                <p className="text-slate-500 text-sm mb-3"><strong>Docente Responsable:</strong> {asig.docente_nombre}</p>

                {/* Descarga completa de documentación para el Evaluador */}
                <div className="flex flex-wrap gap-2 mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <span className="w-full text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1 block">
                    Documentación del Proyecto:
                  </span>
                  {asig.presupuesto && (
                    <button
                      onClick={() => descargarDocumento(asig.presupuesto)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 bg-white hover:bg-blue-50 hover:text-[#5B9BD5] border border-slate-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      📋 Presupuesto
                    </button>
                  )}
                  {asig.cronograma && (
                    <button
                      onClick={() => descargarDocumento(asig.cronograma)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 bg-white hover:bg-blue-50 hover:text-[#5B9BD5] border border-slate-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      📅 Cronograma
                    </button>
                  )}
                  {asig.honestidad && (
                    <button
                      onClick={() => descargarDocumento(asig.honestidad)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 bg-white hover:bg-blue-50 hover:text-[#5B9BD5] border border-slate-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      ✍️ Honestidad
                    </button>
                  )}
                  {asig.id_documento && (
                    <button
                      onClick={() => descargarDocumento(asig.id_documento)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 bg-white hover:bg-blue-50 hover:text-[#5B9BD5] border border-slate-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      🪪 Identidad
                    </button>
                  )}
                </div>

                {asig.estado_evaluacion === 'Finalizado' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/60 mb-4 text-xs space-y-1">
                    <p className="text-slate-700"><strong>Puntaje de evaluación:</strong> {asig.puntaje} / 100</p>
                    <p className="text-slate-600"><strong>Comentarios registrados:</strong> "{asig.comentarios}"</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => abrirCalificacion(asig)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm border cursor-pointer ${
                      asig.estado_evaluacion === 'Finalizado'
                        ? 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                        : 'bg-[#5B9BD5] text-white hover:bg-[#4a8bc4] border-transparent'
                    }`}
                  >
                    {asig.estado_evaluacion === 'Finalizado' ? '📝 Re-evaluar' : '✏️ Calificar Propuesta'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {propuestaSeleccionada && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800">Evaluando Propuesta</h3>
                <button 
                  onClick={() => setPropuestaSeleccionada(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400">Título del Proyecto:</span>
                <p className="text-slate-700 text-sm font-semibold">{propuestaSeleccionada.titulo_propuesta}</p>
              </div>

              {mensajeExito && (
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold text-center border border-emerald-100">
                  {mensajeExito}
                </div>
              )}

              <form onSubmit={guardarCalificacion} className="space-y-4 text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Puntaje (0 - 100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={puntaje}
                    onChange={(e) => setPuntaje(e.target.value)}
                    placeholder="Ej. 85.5"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B9BD5]/30 focus:border-[#5B9BD5]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Comentarios de Retroalimentación
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    placeholder="Escribe aquí las observaciones, fortalezas y puntos de mejora del proyecto..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B9BD5]/30 focus:border-[#5B9BD5]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={guardando}
                    className="flex-1 bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 text-xs cursor-pointer"
                  >
                    {guardando ? 'Guardando...' : '✓ Guardar Calificación'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropuestaSeleccionada(null)}
                    className="bg-slate-100 text-slate-600 font-bold py-2 px-4 rounded-xl hover:bg-slate-200 transition-colors text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default EvaluarPropuestas;