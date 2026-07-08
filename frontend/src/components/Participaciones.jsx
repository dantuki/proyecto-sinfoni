import React, { useState, useEffect } from 'react';

export default function Participaciones() {
  const [participaciones, setParticipaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // Estados para el formulario de nueva vinculación
  const [formData, setFormData] = useState({
    proyecto_id: '',
    usuario_id: '',
    rol_proyecto: 'Investigador Principal',
    horas_dedicacion: '',
    fecha_vinculacion: '',
    estado_vinculacion: 'Activo'
  });

  // Recuperamos la información del usuario e investigadores desde el almacenamiento local
  const token = localStorage.getItem('token');
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuario')) || {};
  const esAdmin = usuarioLogueado.rol === 'Administrador' || usuarioLogueado.rol === 'Admin';

  const cargarParticipaciones = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/participaciones', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setParticipaciones(data.data);
      } else {
        setError(data.error || 'Error al cargar las vinculaciones.');
      }
    } catch (err) {
      setError('No se pudo establecer conexión con el servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarParticipaciones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/participaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setModalAbierto(false);
        setFormData({ proyecto_id: '', usuario_id: '', rol_proyecto: 'Investigador Principal', horas_dedicacion: '', fecha_vinculacion: '', estado_vinculacion: 'Activo' });
        cargarParticipaciones();
      } else {
        alert(data.error || 'Error al procesar la vinculación.');
      }
    } catch (err) {
      alert('Error de red al intentar conectar con el servidor.');
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-600 font-medium">Cargando registros de SINFONI...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Módulo de Participaciones e Investigadores</h2>
          <p className="text-sm text-gray-500">
            {esAdmin ? 'Vista de control global de investigadores asignados.' : `Proyectos asignados al docente: ${usuarioLogueado.nombre}`}
          </p>
        </div>
        {esAdmin && (
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow"
          >
            + Vincular Investigador
          </button>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

      {participaciones.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No se encontraron vinculaciones registradas en el sistema.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50 text-left font-semibold text-gray-700 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Proyecto</th>
                {esAdmin && <th className="px-4 py-3">Docente</th>}
                <th className="px-4 py-3">Rol Investigativo</th>
                <th className="px-4 py-3">Horas Dedicación</th>
                <th className="px-4 py-3">Fecha Vinculación</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {participaciones.map((part) => (
                <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">{part.codigo_proyecto}</td>
                  <td className="px-4 py-3 max-w-xs truncate font-medium">{part.titulo_proyecto}</td>
                  {esAdmin && <td className="px-4 py-3 font-medium">{part.nombre_usuario}</td>}
                  <td className="px-4 py-3">{part.rol_proyecto}</td>
                  <td className="px-4 py-3 text-center font-semibold">{part.horas_dedicacion} hrs</td>
                  <td className="px-4 py-3">{new Date(part.fecha_vinculacion).toLocaleDateString('es-CO')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${part.estado_vinculacion === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {part.estado_vinculacion}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE VINCULACIÓN (Solo visible para Administradores) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nueva Vinculación de Investigador</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ID del Proyecto (Numérico)</label>
                <input
                  type="number"
                  required
                  placeholder="Ej: 1"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.proyecto_id}
                  onChange={(e) => setFormData({ ...formData, proyecto_id: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ID del Docente / Usuario (Numérico)</label>
                <input
                  type="number"
                  required
                  placeholder="Ej: 4"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.usuario_id}
                  onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
                />
              </div>
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
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}