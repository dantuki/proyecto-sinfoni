import { useState, useEffect } from 'react';

const ControlUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const consultarUsuarios = async () => {
    try {
      setCargando(true);
      setError(null);
      const respuesta = await fetch('http://localhost:5000/api/usuarios');
      const resultado = await respuesta.json();
      
      if (resultado.status === 'success') {
        setUsuarios(resultado.data);
      } else {
        setError('No se pudo procesar la lista de usuarios.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor de datos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    consultarUsuarios();
  }, []);

  const eliminarUsuario = async (id, nombre) => {
    if (!window.confirm(`¿Estás completamente seguro de eliminar permanentemente al usuario "${nombre}"?`)) {
      return;
    }

    try {
      const respuesta = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
        method: 'DELETE',
      });
      const resultado = await respuesta.json();

      if (resultado.status === 'success') {
        alert('Usuario removido del sistema de forma correcta.');
        setUsuarios((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert(resultado.message || 'Error al intentar eliminar el usuario.');
      }
    } catch (err) {
      alert('Error de red al procesar la desvinculación.');
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const termino = busqueda.toLowerCase();
    return (
      u.nombre_completo?.toLowerCase().includes(termino) ||
      u.cedula?.toString().includes(termino) ||
      u.email?.toLowerCase().includes(termino) ||
      u.rol?.toLowerCase().includes(termino)
    );
  });

  const obtenerInsigniaRol = (rol) => {
    const r = rol ? rol.toLowerCase() : '';
    if (r === 'admin') return 'bg-red-50 text-red-700 border-red-100';
    if (r === 'evaluador') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    return 'bg-blue-50 text-blue-700 border-blue-100';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Control General de Usuarios</h2>
          <p className="text-slate-400 text-xs mt-0.5">Módulo de administración global para gestión de credenciales y personal de SINFONI.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={consultarUsuarios}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            🔄 Refrescar
          </button>
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o rol..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#5B9BD5] transition-colors shadow-2xs"
            />
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-12">
          <p className="text-sm text-slate-400">Sincronizando registros con la base de datos MySQL...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
          <p className="text-xs font-semibold text-red-600">{error}</p>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-xs text-slate-400">No se encontraron usuarios que coincidan con los criterios de búsqueda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-3xs">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-100">
                <th className="p-4">Identificación / Cédula</th>
                <th className="p-4">Nombre Completo</th>
                <th className="p-4">Correo Electrónico</th>
                <th className="p-4 text-center">Rol Asignado</th>
                <th className="p-4">Contacto Telefónico</th>
                <th className="p-4 text-center">Acción Administrativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {usuariosFiltrados.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-mono font-medium text-slate-600">{u.cedula}</td>
                  <td className="p-4 font-semibold text-slate-900">{u.nombre_completo}</td>
                  <td className="p-4 text-slate-500">{u.email}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full border ${obtenerInsigniaRol(u.rol)}`}>
                      {u.rol || 'Docente'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{u.telefono || 'No registrado'}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => eliminarUsuario(u.id, u.nombre_completo)}
                      className="text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Eliminar Registro
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ControlUsuarios;