import { useState } from 'react';

function ConvocatoriasAbiertas({ alSeleccionarConvocatoria }) {
  // Datos simulados de las convocatorias creadas por el Admin
  const [convocatorias] = useState([
    {
      id: 1,
      codigo: "CONV-2026-01",
      titulo: "Convocatoria Interna para Proyectos de Innovación Tecnológica",
      descripcion: "Dirigida a docentes investigadores que busquen desarrollar prototipos funcionales de software o hardware con impacto regional.",
      fechaCierre: "2026-09-30",
      presupuestoMax: "$15,000,000 COP",
      modalidad: "Financiación Total"
    },
    {
      id: 2,
      codigo: "CONV-2026-02",
      titulo: "Apoyo a la Publicación de Artículos Científicos (Scopus/WoS)",
      descripcion: "Fondo destinado a financiar los costos de procesamiento de páginas (APC) para artículos aceptados en revistas indexadas Q1 o Q2.",
      fechaCierre: "2026-11-15",
      presupuestoMax: "$8,000,000 COP",
      modalidad: "Reembolso"
    }
  ]);

  return (
    <div className="w-full max-w-5xl mt-2">
      <div className="mb-6 text-left">
        <h2 className="text-3xl font-extrabold text-white drop-shadow-md">Convocatorias Vigentes</h2>
        <p className="text-slate-200 text-sm mt-1">Seleccione la convocatoria de su interés para radicar la documentación de su propuesta.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {convocatorias.map((conv) => (
          <div key={conv.id} className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-2xl transition-all">
            
            {/* Información de la convocatoria */}
            <div className="flex-1 space-y-2 text-left">
              <div className="flex items-center gap-3">
                <span className="bg-[#5B9BD5]/20 text-[#3a7cb8] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {conv.codigo}
                </span>
                <span className="bg-[#70AD47]/20 text-[#548433] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Cierre: {conv.fechaCierre}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800">{conv.titulo}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{conv.descripcion}</p>
              
              <div className="flex gap-6 pt-2 text-xs font-semibold text-slate-500">
                <div>💰 Topes: <span className="text-slate-700">{conv.presupuestoMax}</span></div>
                <div>📋 Modalidad: <span className="text-slate-700">{conv.modalidad}</span></div>
              </div>
            </div>

            {/* Acción */}
            <div className="w-full md:w-auto flex-shrink-0">
              <button
                onClick={() => alSeleccionarConvocatoria(conv)}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#5B9BD5] to-[#70AD47] text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity uppercase tracking-wider text-xs"
              >
                Postularse 🚀
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default ConvocatoriasAbiertas;