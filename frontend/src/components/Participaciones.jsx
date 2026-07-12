import React, { useState, useEffect } from 'react';

export default function Participaciones({ usuario }) {
  const [participaciones, setParticipaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [archivo, setArchivo] = useState(null);
  
  const [formData, setFormData] = useState({
    proyecto_id: '',
    usuario_id: '',
    rol_proyecto: 'Investigador Principal',
    horas_dedicacion: '',
    fecha_vinculacion: '',
    estado_vinculacion: 'Pendiente'
  });

  const token = localStorage.getItem('token');
  const esAdmin = usuario?.rol === 'Admin' || usuario?.rol === 'Administrador';
  const nombreUsuario = usuario?.nombre_completo || usuario?.nombre || 'Docente';
  const currentUserId = usuario?.id || usuario?.id_usuario || localStorage.getItem('userId');

  const cargarParticipaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = 'http://localhost:5000/api/participaciones';

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const txtError = await res.text();
        try {
          const jsonError = JSON.parse(txtError);
          setError(jsonError.error || 'No se pudieron consultar las participaciones.');
        } catch {
          setError(`Error ${res.status}: El servidor no devolvió una respuesta válida.`);
        }
        setParticipaciones([]);
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setParticipaciones(data.data || []);
      } else {
        setParticipaciones([]);
        setError(data.error || 'No se pudieron consultar las participaciones.');
      }
    } catch (err) {
      console.error('Error al conectar con backend:', err);
      setError('Verifica que el servidor Backend (Node.js) esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId || esAdmin) {
      cargarParticipaciones();
    }
  }, [currentUserId, esAdmin]);

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`http://localhost:5000/api/participaciones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado_vinculacion: nuevoEstado })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Solicitud actualizada a: ${nuevoEstado}`);
        cargarParticipaciones();
      } else {
        alert(data.error || 'Error al actualizar el estado de la vinculación.');
      }
    } catch (err) {
      alert('Error de red al intentar conectar con el servidor.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Usamos FormData para empaquetar el flujo de datos mixtos (Texto + PDF)
      const dataToSend = new FormData();
      dataToSend.append('proyecto_id', formData.proyecto_id);
      dataToSend.append('rol_proyecto', formData.rol_proyecto);
      dataToSend.append('horas_dedicacion', formData.horas_dedicacion);
      dataToSend.append('fecha_vinculacion', formData.fecha_vinculacion);
      
      if (esAdmin) {
        dataToSend.append('usuario_id', formData.usuario_id);
      }
      if (archivo) {
        dataToSend.append('archivo', archivo);
      }

      const res = await fetch('http://localhost:5000/api/participaciones', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // IMPORTANTE: Dejar vacío el Content-Type para que el navegador configure el boundary multipart automáticamente
        },
        body: dataToSend
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        setModalAbierto(false);
        setArchivo(null);
        setFormData({ 
          proyecto_id: '', 
          usuario_id: '', 
          rol_proyecto: 'Investigador Principal', 
          horas_dedicacion: '', 
          fecha_vinculacion: '', 
          estado_vinculacion: 'Pendiente' 
        });
        cargarParticipaciones();
      } else {
        alert(data.error || 'Error al procesar la vinculación.');
      }
    } catch (err) {
      alert('Error de red al intentar conectar con el servidor.');
    }
  };

  const obtenerEstiloEstado = (estado) => {
    switch (estado) {
      case 'Activo':
      case 'Aprobado':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Rechazado':
      case 'Inactivo':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Pendiente':
      default:
        return 'bg-amber-100 text-amber-800 border border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600 font-medium bg-white rounded-xl shadow-lg max-w-5xl w-full">
        Cargando registros de SINFONI...
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-5xl">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Módulo de Participaciones y Solicitudes</h2>
          <p className="text-sm text-gray-500">
            {esAdmin ? 'Panel global de administración y aprobación de propuestas.' : `Historial de propuestas de: ${nombreUsuario}`}
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow text-xs uppercase tracking-wider"
        >
          {esAdmin ? '+ Vincular Manualmente' : '+ Solicitar Vinculación'}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

      {participaciones.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-xl">
          No se encontraron vinculaciones ni postulaciones registradas en este momento.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Proyecto / Propuesta</th>
                {esAdmin && <th className="px-4 py-3">Docente Postulado</th>}
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Dedicación</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-center">Acciones de Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {participaciones.map((part) => (
                <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">
                    {part.codigo_proyecto || part.proyecto_id || 'N/A'}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate font-medium">
                    {part.titulo_proyecto || 'Propuesta de Investigación Sin Título'}
                  </td>
                  {esAdmin && <td className="px-4 py-3 font-medium text-slate-600">{part.nombre_usuario}</td>}
                  <td className="px-4 py-3 text-xs">{part.rol_proyecto}</td>
                  <td className="px-4 py-3 text-center font-semibold">{part.horas_dedicacion} hrs</td>
                  <td className="px-4 py-3 text-xs">
                    {part.fecha_vinculacion ? new Date(part.fecha_vinculacion).toLocaleDateString('es-CO') : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${obtenerEstiloEstado(part.estado_vinculacion)}`}>
                      {part.estado_vinculacion}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          if (part.soporte_url) {
                            window.open(part.soporte_url, '_blank');
                          } else {
                            alert('No se cargó ningún documento PDF de soporte para esta postulación.');
                          }
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold border transition"
                        title="Ver soporte digital cargado"
                      >
                        📄 Ver PDF
                      </button>
                      
                      {esAdmin && (
                        <>
                          {part.estado_vinculacion === 'Pendiente' ? (
                            <>
                              <button
                                onClick={() => handleCambiarEstado(part.id, 'Aprobado')}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition"
                              >
                                Aprobar ✔
                              </button>
                              <button
                                onClick={() => handleCambiarEstado(part.id, 'Rechazado')}
                                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold transition"
                              >
                                Rechazar ✖
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Evaluado</span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CON REFACTORIZACIÓN COMPORTAMENTAL */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {esAdmin ? 'Nueva Vinculación Manual (Admin)' : 'Formulario de Postulación de Propuesta'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ID del Proyecto</label>
                <input
                  type="number"
                  required
                  placeholder="Ej: 1"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.proyecto_id}
                  onChange={(e) => setFormData({ ...formData, proyecto_id: e.target.value })}
                />
              </div>

              {esAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ID del Docente / Usuario</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 4"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.usuario_id}
                    onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rol en el Proyecto</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={formData.rol_proyecto}
                  onChange={(e) => setFormData({ ...formData, rol_proyecto: e.target.value })}
                >
                  <option value="Investigador Principal">Investigador Principal</option>
                  <option value="Coinvestigador">Coinvestigador</option>
                  <option value="Asistente de Investigación">Asistente de Investigación</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Horas Semanales Dedicadas</label>
                <input
                  type="number"
                  required
                  placeholder="Ej: 12"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.horas_dedicacion}
                  onChange={(e) => setFormData({ ...formData, horas_dedicacion: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Fecha de Vinculación</label>
                <input
                  type="date"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.fecha_vinculacion}
                  onChange={(e) => setFormData({ ...formData, fecha_vinculacion: e.target.value })}
                />
              </div>

              {!esAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Soporte Aval (Formato PDF obligatorio)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border p-2 rounded-lg"
                    onChange={(e) => setArchivo(e.target.files[0])}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalAbierto(false);
                    setArchivo(null);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow"
                >
                  {esAdmin ? 'Vincular Directo' : 'Enviar Postulación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}