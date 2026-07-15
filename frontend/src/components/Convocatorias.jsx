import { useState, useEffect } from 'react';

function Convocatorias({ usuario }) {
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

const idUsuarioRemitente = usuario?.id || localStorage.getItem('userId');

console.log("--- Payload Autoprotegido ---");
console.log("ID del Investigador (Automático):", idUsuarioRemitente);
console.log("Datos del Formulario:", formData);
console.log("Archivos Adjuntos (PDFs):", archivos);

alert(`¡Solicitud radicada con éxito! Código asignado: ${formData.codigoPropuesta} para la propuesta "${formData.titulo_propuesta}" bajo el registro de Investigador #${idUsuarioRemitente}`);
};

return (
<div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-3xl w-full text-slate-800 border border-slate-100 mt-2">
<div className="border-b border-slate-200 pb-4 mb-6">
<h2 className="text-2xl font-bold text-slate-800">Postulación a Convocatoria de Investigación</h2>
<p className="text-sm text-slate-500 mt-1">
Suba los documentos requeridos según los Términos de Referencia. Sus credenciales se indexarán automáticamente.
</p>
</div>

<form onSubmit={handleSubmit} className="space-y-5">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
Número de Solicitud / Código Propuesta
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
Sede de Vinculación
</label>
<select
name="sede"
value={formData.sede}
onChange={handleInputChange}
className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B9BD5] transition-all text-sm"
required
>
<option value="">-- Seleccione una sede --</option>
<option value="pereira">Pereira</option>
<option value="cartago">Cartago</option>
<option value="ibague">Ibagué</option>
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
placeholder="Notas adicionales sobre la propuesta..."
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
<span className="font-semibold text-slate-700 block mb-1">4. Documento de Identidad (Soporte PDF) *</span>
<input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'id')} className="w-full text-slate-500" required />
</div>
</div>
</div>

<button
type="submit"
className="w-full py-3 bg-gradient-to-r from-[#5B9BD5] to-[#70AD47] text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity uppercase tracking-wider text-sm mt-2"
>
Procesar Solicitud con 4 Archivos
</button>
</form>
</div>
);
}

export default Convocatorias;