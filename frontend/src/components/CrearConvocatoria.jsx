import { useState } from 'react';
import axios from 'axios';

function CrearConvocatoria({ alFinalizar }) {
  const [formData, setFormData] = useState({
    codigo: '', // Opcional, si se deja vacío el backend lo genera
    titulo: '',
    descripcion: '',
    tipo: 'General',
    fecha_inicio: '',
    fecha_cierre: '',
    presupuesto_max: '',
    modalidad: '',
    bases_url: ''
  });

  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [cargando, setCargando] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      // Obtenemos el token del admin almacenado al iniciar sesión
      const token = localStorage.getItem('token'); 

      // Petición POST al endpoint protegido del backend
      const response = await axios.post('http://localhost:5000/api/convocatorias', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        setMensaje({
          tipo: 'success',
          texto: `¡Convocatoria creada con éxito! Código: ${response.data.data.codigo}`
        });
        // Limpiamos el formulario
        setFormData({
          codigo: '',
          titulo: '',
          descripcion: '',
          tipo: 'General',
          fecha_inicio: '',
          fecha_cierre: '',
          presupuesto_max: '',
          modalidad: '',
          bases_url: ''
        });
        
        // Redirigir o refrescar después de un momento si se desea
        if (alFinalizar) {
          setTimeout(() => alFinalizar(), 2000);
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error de conexión con el servidor';
      setMensaje({ tipo: 'error', texto: msg });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-3xl w-full text-slate-800 border border-slate-100 mt-2 mx-auto">
      <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Crear Nueva Convocatoria</h2>
          <p className="text-sm text-slate-500 mt-1">Sube una nueva oferta de investigación al sistema.</p>
        </div>
        {alFinalizar && (
          <button 
            onClick={alFinalizar}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
          >
            ← Volver
          </button>
        )}
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-xl text-sm mb-5 font-semibold ${
          mensaje.tipo === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Fila 1: Título de la Convocatoria */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Título de la Convocatoria *</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleInputChange}
            placeholder="Ej: Convocatoria Interna para Proyectos de Innovación 2026"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5] text-sm"
            required
          />
        </div>

        {/* Fila 2: Descripción */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Descripción del Programa *</label>
          <textarea
            name="descripcion"
            rows="3"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Escriba un resumen detallado del enfoque de la convocatoria..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5] text-sm resize-none"
            required
          />
        </div>

        {/* Fila 3: Código (Opcional), Tipo y Modalidad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Código (Opcional)</label>
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleInputChange}
              placeholder="Ej: CNV-INV-01"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Tipo de Convocatoria *</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5] text-sm"
              required
            >
              <option value="General">General</option>
              <option value="Mediana">Mediana</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Modalidad de Financiación</label>
            <input
              type="text"
              name="modalidad"
              value={formData.modalidad}
              onChange={handleInputChange}
              placeholder="Ej: Financiación Total"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5] text-sm"
            />
          </div>
        </div>

        {/* Fila 4: Fechas (Inicio y Cierre) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Fecha de Inicio *</label>
            <input
              type="datetime-local"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5] text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Fecha de Cierre *</label>
            <input
              type="datetime-local"
              name="fecha_cierre"
              value={formData.fecha_cierre}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5] text-sm"
              required
            />
          </div>
        </div>

        {/* Fila 5: Presupuesto Máximo y URL de los términos de referencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Presupuesto Máximo</label>
            <input
              type="text"
              name="presupuesto_max"
              value={formData.presupuesto_max}
              onChange={handleInputChange}
              placeholder="Ej: $15,000,000 COP"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">URL de Bases / Términos (PDF)</label>
            <input
              type="text"
              name="bases_url"
              value={formData.bases_url}
              onChange={handleInputChange}
              placeholder="Ej: https://miuniversidad.edu.co/terminos.pdf"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5] text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full py-3 bg-gradient-to-r from-[#5B9BD5] to-[#70AD47] text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity uppercase tracking-wider text-sm mt-2 disabled:opacity-50"
        >
          {cargando ? 'Guardando en Base de Datos...' : 'Publicar Convocatoria en SINFONI'}
        </button>
      </form>
    </div>
  );
}

export default CrearConvocatoria;