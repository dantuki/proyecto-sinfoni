import { useState } from 'react';

const FormularioSolicitud = () => {
  const [formData, setFormData] = useState({
    usuario_id: '',
    convocatoria_id: '',
    sede_id: '',
    num_solicitud: '' // Se envía vacío para que el backend lo genere solo
  });
  const [archivo, setArchivo] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos a enviar:", formData);
    console.log("Archivo seleccionado:", archivo);
    // Pronto pondremos Axios aquí
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">ID Usuario</label>
          <input
            type="number"
            name="usuario_id"
            onChange={handleInputChange}
            className="border-2 border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:border-[#5B9BD5] transition-all bg-slate-50 hover:bg-white text-slate-700 font-medium"
            placeholder="Ej: 1"
            required
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">ID Convocatoria</label>
          <input
            type="number"
            name="convocatoria_id"
            onChange={handleInputChange}
            className="border-2 border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:border-[#5B9BD5] transition-all bg-slate-50 hover:bg-white text-slate-700 font-medium"
            placeholder="Ej: 1"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">ID Sede</label>
          <input
            type="number"
            name="sede_id"
            onChange={handleInputChange}
            className="border-2 border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:border-[#5B9BD5] transition-all bg-slate-50 hover:bg-white text-slate-700 font-medium"
            placeholder="Ej: 1"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">N° Solicitud</label>
          <input
            type="text"
            name="num_solicitud"
            value="SE GENERARÁ AUTOMÁTICAMENTE"
            disabled
            autoComplete="off"
            className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-100 text-slate-400 font-semibold cursor-not-allowed select-none focus:outline-none"
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
          <div className="mt-3 bg-green-50 text-[#70AD47] p-3 rounded-lg border border-green-100 flex items-center">
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