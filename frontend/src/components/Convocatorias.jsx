import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

function Convocatorias({ usuario, convocatoria }) {
  const [sedes, setSedes] = useState([]);
  const [cargandoSedes, setCargandoSedes] = useState(true);
  const [errorSedes, setErrorSedes] = useState(null);

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
        const respuesta = await fetch(`${API_BASE}/sedes`);
        if (!respuesta.ok) {
          throw new Error('No se pudo conectar con el servidor de sedes.');
        }
        const dataJSON = await respuesta.json();
        if (dataJSON.status === 'success') {
          setSedes(dataJSON.data);
        } else {
          throw new Error(dataJSON.message || 'Error en la respuesta.');
        }
      } catch (err) {
        console.error("Error al cargar sedes:", err);
        setErrorSedes(err.message);
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
    if (e.target.files && e.target.files[0]) {
      setArchivos(prev => ({ ...prev, [tipo]: e.target.files[0] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!convocatoria) {
      alert("Error: Debes seleccionar una convocatoria activa primero.");
      return;
    }

    const idUsuarioRemitente = usuario?.id || localStorage.getItem('userId');

    console.log("--- Payload Autoprotegido ---");
    console.log("ID del Investigador:", idUsuarioRemitente);
    console.log("ID de la Convocatoria Asociada:", convocatoria.id);
    console.log("Datos del Formulario:", formData);
    console.log("Archivos Adjuntos:", archivos);

    const sedeSeleccionada = sedes.find(s => s.id === parseInt(formData.sede));
    const nombreSede = sedeSeleccionada ? sedeSeleccionada.nombre_sede : 'Sede Desconocida';

    alert(`¡Solicitud radicada con éxito!\n\nCódigo: ${formData.codigoPropuesta}\nPropuesta: "${formData.titulo_propuesta}"\nSede: ${nombreSede}\nAsociada a Convocatoria: ${convocatoria.titulo} (ID: ${convocatoria.id})`);
  };

  if (!convocatoria) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md mx-auto mt-10 border border-slate-200">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-lg font-bold text-slate-700 mt-4">Acceso al Formulario</h3>
        <p className="text-slate-500 text-sm mt-2">
          Por favor, ve al módulo de convocatorias y haz clic en <strong>"Postularse 🚀"</strong> en la convocatoria de tu interés.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-3xl w-full text-slate-800 border border-slate-100 mt-2">
      {/* Banner de la Convocatoria Seleccionada */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="text-left">
          <span className="text-[10px] uppercase font-extrabold text-blue-500 tracking-wider">Postulándote a:</span>
          <h4 className="text-base font-bold text-slate-800">{convocatoria.titulo}</h4>
          <p className="text-xs text-slate-500 mt-0.5">Código Convocatoria: {convocatoria.codigo}</p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-lg border border-blue-100 text-xs font-semibold text-slate-600 self-stretch sm:self-auto text-center">
          💰 Tope: {convocatoria.presupuesto_max || 'Estándar'}
        </div>
      </div>

      <div className="border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Radicación de Propuesta</h2>
        <p className="text-sm text-slate-500 mt-1">
          Suba la documentación reglamentaria requerida. El sistema enlazará automáticamente su perfil académico.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Código Único de Propuesta (Automático)
            </label>
            <input 
              type="text"
              name="codigoPropuesta"
              value={formData.codigoPropuesta}
              readOnly
              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-semibold text-sm cursor-not-allowed select-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Sede de Vinculación *
            </label>
            <select
              name="sede"
              value={formData.sede}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5] transition-all text-sm"
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Título de la Propuesta *
          </label>
          <input 
            type="text"
            name="titulo_propuesta"
            value={formData.titulo_propuesta}
            onChange={handleInputChange}
            placeholder="Escriba el título definitivo de su propuesta de investigación"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5] transition-all text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Observaciones Iniciales
          </label>
          <textarea
            name="observaciones"
            rows="3"
            placeholder="Comentarios o aclaraciones breves para los evaluadores..."
            value={formData.observaciones}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5] transition-all text-sm resize-none"
          />
        </div>

        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">
            Documentación Obligatoria (Formatos PDF)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <span className="font-semibold text-slate-700 block mb-1">1. Presupuesto General *</span>
              <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'presupuesto')} className="w-full text-slate-500" required />
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <span className="font-semibold text-slate-700 block mb-1">2. Cronograma de Actividades *</span>
              <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'cronograma')} className="w-full text-slate-500" required />
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <span className="font-semibold text-slate-700 block mb-1">3. Declaración de Honestidad *</span>
              <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'honestidad')} className="w-full text-slate-500" required />
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <span className="font-semibold text-slate-700 block mb-1">4. Soporte Documento Identidad *</span>
              <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'id')} className="w-full text-slate-500" required />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-[#5B9BD5] to-[#70AD47] text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity uppercase tracking-wider text-sm mt-2"
        >
          Enviar Propuesta de Investigación
        </button>
      </form>
    </div>
  );
}

export default Convocatorias;