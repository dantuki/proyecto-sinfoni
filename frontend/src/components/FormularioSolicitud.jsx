import { useState, useEffect } from 'react';
import axios from 'axios';

const FormularioSolicitud = () => {
  const [formData, setFormData] = useState({
    usuario_id: '',
    convocatoria_id: '',
    sede_id: '',
    num_solicitud: '' 
  });
  
  const [convocatorias, setConvocatorias] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Cargar ID de usuario y lista de convocatorias disponibles
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setFormData(prev => ({ ...prev, usuario_id: storedUserId }));
    }

    const cargarConvocatorias = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/convocatorias');
        if (response.data.status === 'success') {
          setConvocatorias(response.data.data);
        }
      } catch (err) {
        console.error("Error al traer convocatorias para el formulario:", err);
      }
    };

    cargarConvocatorias();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (!formData.convocatoria_id || !formData.sede_id) {
      setMensaje({ tipo: 'error', texto: 'Por favor seleccione una convocatoria y una sede.' });
      return;
    }

    // Preparar FormData para envío con archivo binario
    const dataToSend = new FormData();
    dataToSend.append('usuario_id', formData.usuario_id);
    dataToSend.append('convocatoria_id', formData.convocatoria_id);
    dataToSend.append('sede_id', formData.sede_id);
    if (archivo) dataToSend.append('documento', archivo);

    console.log("Enviando Solicitud Automatizada...");
    
    // Aquí puedes descomentar tu llamada de Axios cuando gustes:
    // try {
    //   const token = localStorage.getItem('token');
    //   const res = await axios.post('http://localhost:5000/api/solicitudes', dataToSend, {
    //     headers: { 'Authorization': `Bearer ${token}` }
    //   });
    //   if(res.data.status === 'success') setMensaje({ tipo: 'success', texto: '¡Solicitud enviada exitosamente!' });
    // } catch(err) { setMensaje({ tipo: 'error', texto: 'Error al procesar la solicitud.' }); }

    setMensaje({ tipo: 'success', texto: '¡Datos listos para enviar de forma transparente sin escribir IDs!' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-3xl bg-white p-6 rounded-2xl shadow-md">
      
      {mensaje.texto && (
        <div className={`p-3 rounded-xl text-xs font-semibold border ${mensaje.tipo === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Convocatoria Desplegable */}
        <div className="flex flex-col">
          <label className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Seleccionar Convocatoria</label>
          <select
            name="convocatoria_id"
            value={formData.convocatoria_id}
            onChange={handleInputChange}
            className="border-2 border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-[#5B9BD5] transition-all bg-slate-50 hover:bg-white text-slate-700 font-medium text-sm"
            required
          >
            <option value="">-- Elija un programa vigente --</option>
            {convocatorias.map(c => (
              <option key={c.id} value={c.id}>{c.titulo} ({c.codigo})</option>
            ))}
          </select>
        </div>
        
        {/* Sede Desplegable */}
        <div className="flex flex-col">
          <label className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Sede Universitaria</label>
          <select
            name="sede_id"
            value={formData.sede_id}
            onChange={handleInputChange}
            className="border-2 border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-[#5B9BD5] transition-all bg-slate-50 hover:bg-white text-slate-700 font-medium text-sm"
            required
          >
            <option value="">-- Seleccione Destino --</option>
            <option value="1">Sede Pereira</option>
            <option value="2">Sede Cartago</option>
            <option value="3">Sede Ibagué</option>
          </select>
        </div>

        {/* N° Solicitud Oculto / Bloqueado */}
        <div className="flex flex-col">
          <label className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">N° Solicitud</label>
          <input
            type="text"
            value="SE GENERARÁ AUTOMÁTICAMENTE"
            disabled
            className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-100 text-slate-400 font-semibold cursor-not-allowed select-none focus:outline-none text-sm"
          />
        </div>

        {/* Muestra ID del Profesor sin dejarlo editar */}
        <div className="flex flex-col">
          <label className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">ID Investigador Asignado</label>
          <input
            type="text"
            value={`Profesor Conectado: #${formData.usuario_id || 'Cargando...'}`}
            disabled
            className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-indigo-50/50 text-indigo-600 font-bold cursor-not-allowed select-none focus:outline-none text-sm"
          />
        </div>
      </div>

      <div className="mt-8">
        <label className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider block">Documento Adjunto (PDF)</label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-[#70AD47] transition-all duration-300">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 mb-3 text-[#5B9BD5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="mb-2 text-sm text-slate-500"><span className="font-semibold text-[#5B9BD5]">Haz clic para explorar</span> o arrastra tu archivo</p>
              <p className="text-xs text-slate-400">Solo formato PDF</p>
            </div>
            <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" required />
          </label>
        </div>
        {archivo && (
          <div className="mt-3 bg-green-50 text-[#70AD47] p-3 rounded-lg border border-green-100 flex items-center text-xs">
            <span className="font-bold mr-2">✓ Archivo listo:</span> {archivo.name}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-[#5B9BD5] to-[#70AD47] text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 mt-8 text-lg uppercase tracking-wide"
      >
        Procesar Solicitud
      </button>
    </form>
  );
};

export default FormularioSolicitud;