import React, { useState, useEffect } from 'react';

export default function DatosPersonales() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const [userId, setUserId] = useState(null);
  const [cedula, setCedula] = useState('');
  const [email, setEmail] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  useEffect(() => {
    const cargarDatosPerfil = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');

        if (!token || !storedUserId) {
          setError('No hay una sesión activa. Vuelve a iniciar sesión.');
          setLoading(false);
          return;
        }

        const idUsuario = parseInt(storedUserId, 10);
        setUserId(idUsuario);

        const response = await fetch(`http://localhost:5000/api/usuarios/${idUsuario}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data) {
          const usuario = Array.isArray(data) ? data[0] : data;
          setCedula(usuario.cedula || '');
          setEmail(usuario.email || '');
          setNombreCompleto(usuario.nombre_completo || '');
          setTelefono(usuario.telefono || '');
          setDireccion(usuario.direccion || '');
          setFotoUrl(usuario.foto_url || '');
        }
      } catch (err) {
        setError('Error al conectar con el servidor para traer tu perfil.');
      } finally {
        setLoading(false);
      }
    };

    cargarDatosPerfil();
  }, []);

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);
    formData.append('nombre_completo', nombreCompleto);
    formData.append('telefono', telefono);
    formData.append('direccion', direccion);

    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/${userId}`, {
        method: 'PUT',
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'No se pudo subir la imagen.');
        return;
      }

      setFotoUrl(data.foto_url);
      setMensajeExito('¡Foto de perfil actualizada y archivo anterior purgado!');
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (err) {
      setError('Error de red al intentar subir la foto.');
    }
  };

  const handleGuardarCambios = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: nombreCompleto,
          telefono,
          direccion
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al guardar los datos.');
        return;
      }

      setMensajeExito('¡Datos personales guardados con éxito en la base de datos!');
      setIsEditing(false);
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (err) {
      setError('No se pudo actualizar el perfil.');
    }
  };

  if (loading) {
    return <div className="text-center py-10 font-semibold text-slate-500">Cargando datos de perfil corporativo...</div>;
  }

  return (
    <div className="w-full max-w-4xl bg-white shadow-sm rounded-2xl border border-slate-100 p-8 mx-auto mt-6 space-y-6">
      
      {error && <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 rounded-xl border border-red-100 text-center">⚠️ {error}</div>}
      {mensajeExito && <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100 text-center">🎉 {mensajeExito}</div>}

      <div className="flex flex-col md:flex-row gap-8">
        
        <div className="flex flex-col items-center w-full md:w-1/3 space-y-4">
          <div className="relative group w-40 h-40">
            {fotoUrl ? (
              <img 
                src={`http://localhost:5000${fotoUrl}`} 
                alt="Perfil Real" 
                className="w-full h-full object-cover rounded-full border-4 border-slate-50 shadow-sm" 
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-5xl shadow-inner uppercase">
                {nombreCompleto ? nombreCompleto.charAt(0) : 'U'}
              </div>
            )}
            
            <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-center p-2">
              <span className="text-xl">📷</span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Cambiar Foto</span>
              <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
            </label>
          </div>

          <div className="text-center w-full bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documento de Identidad</p>
            <p className="text-slate-700 font-bold text-lg">{cedula || 'Sin Cédula'}</p>
          </div>
        </div>

        <form onSubmit={handleGuardarCambios} className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nombre Completo</label>
            {isEditing ? (
              <input 
                type="text" 
                value={nombreCompleto} 
                onChange={(e) => setNombreCompleto(e.target.value)} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            ) : (
              <p className="text-slate-800 text-xl font-bold tracking-tight uppercase bg-slate-50/40 px-3 py-2 rounded-lg border border-dashed border-slate-200">{nombreCompleto || 'REGISTRE SU NOMBRE'}</p>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Correo Electrónico</label>
            <p className="text-slate-600 text-sm font-medium bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100">{email}</p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Teléfono de Contacto</label>
            {isEditing ? (
              <input 
                type="text" 
                value={telefono} 
                onChange={(e) => setTelefono(e.target.value)} 
                placeholder="Ej. 3123456789"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            ) : (
              <p className="text-slate-700 text-sm font-semibold bg-slate-50/40 px-3 py-2.5 rounded-lg border border-dashed border-slate-200">{telefono || 'No asignado (Clic en Editar)'}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Dirección de Residencia</label>
            {isEditing ? (
              <input 
                type="text" 
                value={direccion} 
                onChange={(e) => setDireccion(e.target.value)} 
                placeholder="Calle, Carrera, Barrio..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            ) : (
              <div className="flex items-center gap-3 bg-slate-50/40 px-3 py-2.5 rounded-lg border border-dashed border-slate-200">
                <span className="text-base">📍</span>
                <p className="text-slate-700 text-sm font-semibold">{direccion || 'No asignada aún'}</p>
              </div>
            )}
          </div>

          <div className="col-span-2 flex justify-end gap-3 pt-2">
            {isEditing ? (
              <>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
                >
                  Guardar Cambios
                </button>
              </>
            ) : (
              <button 
                type="button" 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
              >
                Editar Perfil
              </button>
            )}
          </div>

        </form>
      </div>

    </div>
  );
}