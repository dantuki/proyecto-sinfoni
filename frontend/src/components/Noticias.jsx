import React, { useState, useEffect } from 'react';

export default function Noticias({ onVolver }) {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para el formulario (Crear / Editar)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [fecha, setFecha] = useState('');
  const [archivo, setArchivo] = useState(null);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Cargar noticias desde el backend filtradas por el usuario logueado
  const cargarNoticias = async () => {
    if (!userId) {
      setError('No se pudo identificar tu sesión de usuario.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/noticias/usuario/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await response.json();
      if (response.ok) {
        setNoticias(resJson.data || []);
      } else {
        setError(resJson.error || 'Error al procesar el historial.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarNoticias();
  }, [userId]);

  const abrirCrear = () => {
    setEditandoId(null);
    setTitulo('');
    setContenido('');
    setFecha(new Date().toISOString().split('T')[0]); // Carga la fecha actual por defecto
    setArchivo(null);
    setModalAbierto(true);
  };

  const abrirEditar = (item) => {
    setEditandoId(item.id);
    setTitulo(item.titulo);
    setContenido(item.contenido || '');
    setFecha(item.fecha.split('T')[0]);
    setArchivo(null);
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('usuario_id', userId);
    formData.append('titulo', titulo);
    formData.append('contenido', contenido);
    formData.append('fecha', fecha);
    if (archivo) formData.append('archivo', archivo);

    const url = editandoId 
      ? `http://localhost:5000/api/noticias/${editandoId}`
      : 'http://localhost:5000/api/noticias';
    
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setModalAbierto(false);
        cargarNoticias();
      } else {
        const errData = await response.json();
        alert(errData.error || 'Ocurrió un error al guardar');
      }
    } catch (err) {
      alert('Error de red al intentar guardar los datos.');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás completamente seguro de eliminar este registro?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/noticias/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        cargarNoticias();
      } else {
        alert('No se pudo eliminar el registro.');
      }
    } catch (err) {
      alert('Error al conectar con el servidor.');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 space-y-4 p-2">
      
      {/* Botones de Navegación superiores */}
      <div className="flex justify-between items-center">
        <button 
          onClick={onVolver}
          className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-sm transition-colors"
        >
          ← Volver al Panel
        </button>
        
        <button 
          onClick={abrirCrear}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-sm transition-colors"
        >
          + Agregar Registro
        </button>
      </div>

      {/* Contenedor Principal de la Tabla */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
        
        {/* Encabezado con tu Color Original (#619c8f) */}
        <div className="bg-[#619c8f] px-4 py-3 flex items-center gap-2">
          <span className="text-white text-xl">📰</span>
          <h2 className="text-white font-bold tracking-wider uppercase text-sm">NOTICIAS / HISTORIAL PERSONAL</h2>
        </div>
        
        {error && <div className="p-3 text-xs text-red-600 bg-red-50 text-center border-b border-slate-100">⚠️ {error}</div>}

        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400 font-medium">Cargando tus registros personalizados...</div>
        ) : noticias.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold bg-slate-50/50 uppercase tracking-wide">
            No tienes documentos ni publicaciones registradas aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {/* Header con tu Color Original (#8abeb2) */}
                <tr className="bg-[#8abeb2] text-white text-xs uppercase font-bold tracking-wider">
                  <th className="p-3 border-r border-white/30 w-36">Fecha</th>
                  <th className="p-3 border-r border-white/30">Título / Soporte</th>
                  <th className="p-3 text-center w-44">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {noticias.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-500 font-semibold border-r border-slate-100">
                      {new Date(item.fecha).toLocaleDateString('es-CO', { timeZone: 'UTC' })}
                    </td>
                    <td className="p-3 border-r border-slate-100">
                      {/* Título con tu Color Original (#c23616) */}
                      <div className="text-[#c23616] font-bold uppercase tracking-wide text-sm mb-0.5">
                        {item.titulo}
                      </div>
                      {item.contenido && <p className="text-slate-500 normal-case mb-1">{item.contenido}</p>}
                      {item.archivo_url && (
                        <a 
                          href={`http://localhost:5000${item.archivo_url}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-bold mt-1"
                        >
                          📎 Ver Documento Adjunto
                        </a>
                      )}
                    </td>
                    <td className="p-3 text-center space-x-1.5 whitespace-nowrap">
                      <button 
                        onClick={() => abrirEditar(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] uppercase transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleEliminar(item.id)}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded text-[10px] uppercase transition-colors"
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Footer con tu Color Original (#619c8f) */}
        <div className="bg-[#619c8f] px-4 py-2.5 flex justify-between items-center text-white text-xs font-medium">
          <p>Elementos registrados: {noticias.length}</p>
          <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Recursos Humanos</span>
        </div>
      </div>

      {/* MODAL EMERGENTE (CREAR / EDITAR) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
              {editandoId ? '📝 Editar Publicación / Soporte' : '✨ Nuevo Registro de Historial'}
            </h3>
            
            <form onSubmit={handleGuardar} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1 text-[10px]">Título</label>
                <input 
                  type="text" 
                  required 
                  value={titulo} 
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Acta de Grado, Certificado laboral"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#619c8f] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1 text-[10px]">Descripción (Opcional)</label>
                <textarea 
                  value={contenido} 
                  onChange={(e) => setContenido(e.target.value)}
                  placeholder="Información adicional útil..."
                  rows="3"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#619c8f] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1 text-[10px]">Fecha</label>
                <input 
                  type="date" 
                  required
                  value={fecha} 
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#619c8f] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1 text-[10px]">Subir Documento o Imagen</label>
                <input 
                  type="file" 
                  onChange={(e) => setArchivo(e.target.files[0])}
                  className="w-full text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#619c8f] hover:bg-[#528479] text-white font-semibold rounded-lg shadow-sm transition-colors"
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