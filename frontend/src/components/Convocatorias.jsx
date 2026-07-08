import React, { useState } from 'react';

export default function Convocatorias() {
  // Campos del formulario
  const [sedeId, setSedeId] = useState('');
  const [numSolicitud, setNumSolicitud] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  // Estado independiente para cada archivo obligatorio que pidió tu clienta
  const [archivos, setArchivos] = useState({
    presupuesto: null,
    cronograma: null,
    honestidad: null,
    planInversion: null
  });

  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [cargando, setCargando] = useState(false);

  // Manejar la selección de cada archivo individual
  const handleFileChange = (e, tipoDoc) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      alert('Por favor, selecciona solo archivos PDF.');
      e.target.value = ''; // Limpia el input
      return;
    }
    setArchivos(prev => ({ ...prev, [tipoDoc]: file }));
  };

  // Enviar el formulario al Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    // Validar que al menos estén los archivos críticos
    if (!archivos.presupuesto || !archivos.cronograma) {
      setMensaje({ tipo: 'error', texto: 'El Presupuesto y el Cronograma son obligatorios.' });
      setCargando(false);
      return;
    }

    try {
      // Usamos FormData porque vamos a enviar archivos reales binarios
      const formData = new FormData();
      
      // Datos simulación/sesión (Ajusta el usuario_id y convocatoria_id según tu login)
      formData.append('usuario_id', 1); 
      formData.append('convocatoria_id', 1); // ID de la convocatoria base 2026-1 de tu SQL
      formData.append('sede_id', sedeId);
      formData.append('num_solicitud', numSolicitud);
      formData.append('observaciones', observaciones);

      // Mapeo ordenado de archivos y sus tipos exactos para tu backend
      const listaArchivos = [];
      const listaTipos = [];

      if (archivos.presupuesto) {
        listaArchivos.push(archivos.presupuesto);
        listaTipos.push('Presupuesto');
      }
      if (archivos.cronograma) {
        listaArchivos.push(archivos.cronograma);
        listaTipos.push('Cronograma');
      }
      if (archivos.honestidad) {
        listaArchivos.push(archivos.honestidad);
        listaTipos.push('Honestidad Creativa');
      }
      if (archivos.planInversion) {
        listaArchivos.push(archivos.planInversion);
        listaTipos.push('Plan de Inversión');
      }

      // Adjuntamos cada archivo al arreglo 'archivos' que espera Multer
      listaArchivos.forEach(file => {
        formData.append('archivos', file);
      });

      // Enviamos los tipos correspondientes serializados como string
      formData.append('tipos_documentos', JSON.stringify(listaTipos));

      // Petición nativa Fetch (reemplaza por Axios si lo prefieres)
      const token = localStorage.getItem('token'); // Recuperamos tu token de autenticación
      const response = await fetch('http://localhost:5000/api/solicitudes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // NOTA: No pongas 'Content-Type': 'multipart/form-data', el navegador lo pone solo con FormData
        },
        body: formData
      });

      const resData = await response.json();

      if (response.ok) {
        setMensaje({ tipo: 'success', texto: '¡Propuesta y documentos radicados con éxito!' });
        // Limpiar el formulario
        setNumSolicitud('');
        setObservaciones('');
        setSedeId('');
        e.target.reset();
      } else {
        setMensaje({ tipo: 'error', texto: resData.message || 'Error al enviar la postulación.' });
      }
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: 'error', texto: 'No se pudo conectar con el servidor del SINFONI.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Postulación a Convocatoria de Investigación</h2>
      <p style={{ color: '#555' }}>Suba los documentos requeridos según los Términos de Referencia.</p>
      
      {mensaje.texto && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: mensaje.tipo === 'success' ? '#d4edda' : '#f8d7da', color: mensaje.tipo === 'success' ? '#155724' : '#721c24' }}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Número de Solicitud / Código Propuesta:</label>
          <input type="text" value={numSolicitud} onChange={(e) => setNumSolicitud(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} placeholder="Ej: PROP-2026-01" />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Sede de Vinculación:</label>
          <select value={sedeId} onChange={(e) => setSedeId(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
            <option value="">-- Seleccione una sede --</option>
            <option value="1">Pereira</option>
            <option value="2">Ibagué</option>
            <option value="3">Bogotá</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Observaciones Iniciales:</label>
          <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} rows="3" placeholder="Notas adicionales sobre la propuesta..." />
        </div>

        <hr />
        <h4>Documentación Obligatoria (Formatos PDF)</h4>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block' }}>1. Presupuesto General (PDF): *</label>
          <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'presupuesto')} required />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block' }}>2. Cronograma de Actividades (PDF): *</label>
          <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'cronograma')} required />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block' }}>3. Declaración de Honestidad Creativa (PDF):</label>
          <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'honestidad')} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block' }}>4. Plan de Inversión (PDF):</label>
          <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'planInversion')} />
        </div>

        <button type="submit" disabled={cargando} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginTop: '15px' }}>
          {cargando ? 'Subiendo archivos y registrando...' : 'Radicar Propuesta'}
        </button>
      </form>
    </div>
  );
}