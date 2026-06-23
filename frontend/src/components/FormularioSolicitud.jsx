import { useState } from 'react';

const FormularioSolicitud = () => {
  const [formData, setFormData] = useState({
    usuario_id: '',
    convocatoria_id: '',
    sede_id: '',
    num_solicitud: ''
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
    // Aquí irá la petición Axios al backend
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">ID Usuario</label>
          <input 
            type="number" 
            name="usuario_id"
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">ID Convocatoria</label>
          <input 
            type="number" 
            name="convocatoria_id"
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">ID Sede</label>
          <input 
            type="number" 
            name="sede_id"
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Número de Solicitud</label>
          <input 
            type="text" 
            name="num_solicitud"
            placeholder="Ej: SOL-2026-002"
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-gray-700 font-semibold mb-1">Documento PDF (doc_par_1)</label>
        <input 
          type="file" 
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:outline-none"
          required
        />
      </div>

      <button 
        type="submit" 
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 mt-6"
      >
        Enviar Solicitud
      </button>
    </form>
  );
};

export default FormularioSolicitud;