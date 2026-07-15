import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function Convocatorias({ usuario, convocatoria }) {
  const [sedes, setSedes] = useState([]);
  const [cargandoSedes, setCargandoSedes] = useState(true);
  const [errorSedes, setErrorSedes] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const [formData, setFormData] = useState({
    codigoPropuesta: '', 
    titulo_propuesta: '',
    sede: '', 
    observaciones: ''
  });

  const [archivos, setArchivos] = useState({
    presupuesto: null,
    cronograma: null,
    honestidad: null,
    id: null 
  });

  const generarCodigoPropuesta = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let aleatorio = '';
    for (let i = 0; i < 5; i++) {
      aleatorio += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return `PROP-2026-${aleatorio}`;
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      codigoPropuesta: generarCodigoPropuesta()
    }));

    const obtenerSedesAPI = async () => {
      try {
        const token = localStorage.getItem('token');
        const respuesta = await axios.get(`${API_BASE}/sedes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (respuesta.data.status === 'success') {
          setSedes(respuesta.data.data);
        } else {
          throw new Error(respuesta.data.message || 'Error al procesar el listado de sedes.');
        }
      } catch (err) {
        console.error("Error al cargar sedes:", err);
        setErrorSedes(err.response?.data?.message || err.message);
      } finally {
        setCargandoSedes(false);
      }
    };

    obtenerSedesAPI();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, tipo) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (archivo.type !== 'application/pdf') {
      alert('Error: Solo se admiten archivos en formato PDF.');
      e.target.value = '';
      return;
    }

    if (archivo.size > MAX_FILE_SIZE) {
      alert('Error: El archivo no puede superar los 10MB.');
      e.target.value = '';
      return;
    }

    setArchivos(prev => ({ ...prev, [tipo]: archivo }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!convocatoria) {
      alert("Error: Debes seleccionar una convocatoria activa primero.");
      return;
    }

    if (!archivos.presupuesto || !archivos.cronograma || !archivos.honestidad || !archivos.id) {
      alert("Error: Por favor, sube todos los documentos obligatorios.");
      return;
    }

    setEnviando(true);
    const token = localStorage.getItem('token');
    
    const payload = new FormData();
    payload.append('codigoPropuesta', formData.codigoPropuesta);
    payload.append('titulo_propuesta', formData.titulo_propuesta);
    payload.append('sede', formData.sede);
    payload.append('convocatoriaId', convocatoria.id);
    payload.append('observaciones', formData.observaciones);
    payload.append('presupuesto', archivos.presupuesto);
    payload.append('cronograma', archivos.cronograma);
    payload.append('honestidad', archivos.honestidad);
    payload.append('id', archivos.id);

    try {
      const response = await axios.post(`${API_BASE}/postulaciones/radicar`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        alert(`¡Propuesta Radicada con Éxito!\nCódigo asignado: ${formData.codigoPropuesta}`);
        setFormData({
          codigoPropuesta: generarCodigoPropuesta(),
          titulo_propuesta: '',
          sede: '',
          observaciones: ''
        });
        setArchivos({ presupuesto: null, cronograma: null, honestidad: null, id: null });
        e.target.reset();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Ocurrió un error al intentar radicar la postulación.');
    } finally {
      setEnviando(false);
    }
  };

  if (!convocatoria) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-md mx-auto mt-10 border border-slate-100">
        <span className="text-5xl">⚠️</span>
        <h3 className="text-xl font-bold text-slate-800 mt-4">Acceso al Formulario</h3>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
          Por favor, navega al módulo de convocatorias y haz clic en el botón <strong className="text-[#5B9BD5]">"Postularse 🚀"</strong> de la convocatoria de tu interés.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl max-w-3xl w-full text-slate-800 border border-slate-100/80 mt-2 p-8 transition-all duration-300">
      <div className="bg-blue-50/50 border border-blue-100/60 p-5 rounded-2xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left">
          <span className="text-[10px] uppercase font-extrabold text-[#5B9BD5] tracking-wider block">Postulándote a la convocatoria:</span>
          <h4 className="text-lg font-bold text-slate-800 mt-0.5">{convocatoria.titulo}</h4>
          <p className="text-xs text-slate-500 mt-0.5">ID Identificador: <span className="font-mono font-bold text-slate-700">{convocatoria.codigo}</span></p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm text-xs font-bold text-slate-700 self-stretch sm:self-auto text-center whitespace-nowrap">
          💰 Tope Máx: {convocatoria.presupuesto_max || 'Estándar'}
        </div>
      </div>

      <div className="border-b border-slate-100 pb-5 mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Radicación de Propuesta</h2>
        <p className="text-sm text-slate-500 mt-1">
          Sube la documentación reglamentaria requerida en formato PDF. SINFONI enlazará automáticamente tu perfil académico.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Código Único de Propuesta (Automático)
            </label>
            <input 
              type="text"
              name="codigoPropuesta"
              value={formData.codigoPropuesta}
              readOnly
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none text-slate-700 font-mono font-bold text-sm cursor-not-allowed select-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Sede de Vinculación *
            </label>
            <select
              name="sede"
              value={formData.sede}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5]/20 focus:border-[#5B9BD5] transition-all text-sm text-slate-700 font-medium"
              required
              disabled={cargandoSedes}
            >
              {cargandoSedes ? (
                <option value="">Cargando sedes...</option>
              ) : errorSedes ? (
                <option value="">Error al cargar sedes</option>
              ) : (
                <>
                  <option value="">-- Seleccione una sede --</option>
                  {sedes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre_sede}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Título de la Propuesta *
          </label>
          <input 
            type="text"
            name="titulo_propuesta"
            value={formData.titulo_propuesta}
            onChange={handleInputChange}
            placeholder="Escriba el título definitivo de su propuesta de investigación"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5]/20 focus:border-[#5B9BD5] transition-all text-sm text-slate-700 placeholder:text-slate-400 font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Observaciones Iniciales
          </label>
          <textarea
            name="observaciones"
            rows="3"
            placeholder="Comentarios o aclaraciones breves para los evaluadores..."
            value={formData.observaciones}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5]/20 focus:border-[#5B9BD5] transition-all text-sm text-slate-700 placeholder:text-slate-400 resize-none font-medium"
          />
        </div>

        <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 pb-2">
            Documentación Obligatoria (Formatos PDF)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="font-bold text-slate-700 block mb-2">1. Presupuesto General *</span>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => handleFileChange(e, 'presupuesto')} 
                className="w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#5B9BD5] hover:file:bg-blue-100 cursor-pointer" 
                required 
              />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="font-bold text-slate-700 block mb-2">2. Cronograma de Actividades *</span>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => handleFileChange(e, 'cronograma')} 
                className="w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#5B9BD5] hover:file:bg-blue-100 cursor-pointer" 
                required 
              />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="font-bold text-slate-700 block mb-2">3. Declaración de Honestidad *</span>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => handleFileChange(e, 'honestidad')} 
                className="w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#5B9BD5] hover:file:bg-blue-100 cursor-pointer" 
                required 
              />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="font-bold text-slate-700 block mb-2">4. Soporte Documento Identidad *</span>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => handleFileChange(e, 'id')} 
                className="w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#5B9BD5] hover:file:bg-blue-100 cursor-pointer" 
                required 
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full py-3.5 bg-gradient-to-r from-[#5B9BD5] to-[#70AD47] text-white font-extrabold rounded-2xl shadow-md hover:opacity-95 transition-opacity uppercase tracking-wider text-xs mt-2 disabled:opacity-50"
        >
          {enviando ? 'Subiendo Documentos...' : 'Enviar Propuesta de Investigación'}
        </button>
      </form>
    </div>
  );
}

export default Convocatorias;