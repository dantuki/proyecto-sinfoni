import React from 'react';

const InicioCards = ({ cambiarVista, usuario }) => {
  const esAdmin = usuario?.rol === 'Admin';
  const esEvaluador = usuario?.rol === 'Evaluador';

  // Configuración dinámica de opciones para Convocatorias / Calificaciones
  let opcionesConvocatorias = [];

  if (esAdmin) {
    opcionesConvocatorias = [
      { nombre: 'Convocatorias Abiertas', vista: 'convocatorias_abiertas' },
      { nombre: 'Revisar Solicitudes (Admin)', vista: 'revisar_solicitudes' },
      { nombre: 'Crear Convocatoria', vista: 'crear_convocatoria' }
    ];
  } else if (esEvaluador) {
    // Si es evaluador, solo dejamos la opción para calificar las propuestas asignadas por el Admin
    opcionesConvocatorias = [
      { nombre: 'Ver Evaluaciones Asignadas', vista: 'evaluar_propuestas' }
    ];
  } else {
    // Caso por defecto (Docente común)
    opcionesConvocatorias = [
      { nombre: 'Convocatorias Abiertas', vista: 'convocatorias_abiertas' },
      { nombre: 'Mis Solicitudes (Historial)', vista: 'mis_solicitudes' }
    ];
  }

  const categorias = [
    {
      titulo: 'Datos Personales',
      descripcion: 'Gestiona tu perfil, información académica y de contacto dentro del sistema.',
      icono: '👤',
      color: 'from-blue-500 to-indigo-600',
      shadowColor: 'hover:shadow-indigo-500/20',
      bgGlow: 'bg-indigo-500/5',
      opciones: [
        { nombre: 'Ver mi Perfil', vista: 'datos_personales' }
      ]
    }
  ];

  // Regla estricta de negocio: El evaluador no necesita la sección "Noticias"
  if (!esEvaluador) {
    categorias.push({
      titulo: 'Noticias',
      descripcion: 'Entérate de las últimas circulares, avisos y novedades del sistema ArchiveX.',
      icono: '📰',
      color: 'from-amber-500 to-orange-600',
      shadowColor: 'hover:shadow-orange-500/20',
      bgGlow: 'bg-orange-500/5',
      opciones: [
        { nombre: esAdmin ? 'Administrar Noticias' : 'Ver Noticias', vista: 'noticias' }
      ]
    });
  }

  // Agregamos la sección de Convocatorias o Calificaciones según el rol
  categorias.push({
    titulo: esEvaluador ? 'Calificaciones' : 'Convocatorias',
    descripcion: esEvaluador 
      ? 'Gestiona y califica las propuestas de investigación asignadas bajo estrictos criterios académicos.'
      : 'Postula propuestas de investigación y realiza el seguimiento de tus estados.',
    icono: esEvaluador ? '📝' : '📑',
    color: 'from-emerald-500 to-teal-600',
    shadowColor: 'hover:shadow-teal-500/20',
    bgGlow: 'bg-teal-500/5',
    opciones: opcionesConvocatorias
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#5B9BD5]/10 text-[#5B9BD5] mb-4">
          ✨ Sistema Integrado ArchiveX
        </span>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight sm:text-4xl bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
          Panel de Control ArchiveX
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-base text-slate-500">
          Bienvenido, <span className="font-semibold text-slate-700">{usuario?.nombre_completo || 'Usuario'}</span> ({usuario?.rol || 'Rol'}). Selecciona un módulo para gestionar tus procesos académicos y de investigación.
        </p>
      </div>

      <div className={`grid grid-cols-1 ${esEvaluador ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-8 group max-w-5xl mx-auto`}>
        {categorias.map((cat, index) => (
          <div 
            key={index}
            className={`relative bg-white rounded-3xl border border-slate-100 p-8 flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-2.5 shadow-md hover:shadow-2xl ${cat.shadowColor} group-hover:opacity-50 hover:!opacity-100 overflow-hidden`}
          >
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${cat.bgGlow} blur-2xl pointer-events-none transition-all duration-300`} />
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${cat.color}`} />
            
            <div className="mb-8">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100/50 text-3xl mb-5 transition-transform duration-300 hover:rotate-6 hover:scale-110 shadow-sm">
                {cat.icono}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">{cat.titulo}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-normal">{cat.descripcion}</p>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-2.5">
              {cat.opciones.map((opc, i) => (
                <button
                  key={i}
                  onClick={() => cambiarVista(opc.vista)}
                  className="w-full text-left text-sm font-semibold text-slate-600 hover:text-[#5B9BD5] hover:bg-slate-50/80 px-4 py-3 rounded-2xl transition-all duration-200 border border-transparent hover:border-slate-100 flex items-center justify-between group/btn"
                >
                  <span>{opc.nombre}</span>
                  <span className="text-xs opacity-0 group-hover/btn:opacity-100 transition-all duration-300 text-[#5B9BD5] transform translate-x-2 group-hover/btn:translate-x-0 font-bold">
                    ➔
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InicioCards;