import React from 'react';

const InicioCards = ({ cambiarVista, usuario }) => {
  const esAdmin = usuario?.rol === 'Admin';

  // Configuración dinámica de opciones para Convocatorias
  const opcionesConvocatorias = [
    { nombre: 'Convocatorias Abiertas', vista: 'convocatorias_abiertas' },
    { nombre: esAdmin ? 'Revisar Solicitudes' : 'Mis Solicitudes (Historial)', vista: 'participaciones' }
  ];

  if (esAdmin) {
    opcionesConvocatorias.push({ nombre: 'Crear Convocatoria', vista: 'crear_convocatoria' });
  }

  const categorias = [
    {
      titulo: 'Datos Personales',
      descripcion: 'Gestiona tu perfil, información académica y de contacto.',
      icono: '👤',
      color: 'from-blue-500 to-indigo-600',
      shadowColor: 'hover:shadow-blue-500/10',
      opciones: [
        { nombre: 'Ver mi Perfil', vista: 'datos_personales' }
      ]
    },
    {
      titulo: 'Noticias',
      descripcion: 'Entérate de las últimas circulares, avisos y novedades del sistema.',
      icono: '📰',
      color: 'from-amber-500 to-orange-600',
      shadowColor: 'hover:shadow-amber-500/10',
      opciones: [
        { nombre: esAdmin ? 'Administrar Noticias' : 'Ver Noticias', vista: 'noticias' }
      ]
    },
    {
      titulo: 'Convocatorias',
      descripcion: 'Postula propuestas de investigación y realiza el seguimiento de tus estados.',
      icono: '📑',
      color: 'from-emerald-500 to-teal-600',
      shadowColor: 'hover:shadow-emerald-500/10',
      opciones: opcionesConvocatorias
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight sm:text-4xl">
          Panel de Control SINFONI
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-base text-slate-500">
          Selecciona un módulo para gestionar tus procesos académicos y de investigación.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 group">
        {categorias.map((cat, index) => (
          <div 
            key={index}
            className={`relative bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-2 shadow-sm hover:shadow-xl ${cat.shadowColor} group-hover:opacity-60 hover:!opacity-100 overflow-hidden`}
          >
            {/* Barra de color degradado en la parte superior */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${cat.color}`} />
            
            <div className="mb-6">
              {/* Contenedor del Icono */}
              <div className="inline-flex items-center justify-center p-3 rounded-xl bg-slate-50 text-4xl mb-4 transition-transform duration-300 hover:scale-110">
                {cat.icono}
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2">{cat.titulo}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{cat.descripcion}</p>
            </div>

            {/* Listado de Opciones/Botones */}
            <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-1.5">
              {cat.opciones.map((opc, i) => (
                <button
                  key={i}
                  onClick={() => cambiarVista(opc.vista)}
                  className="w-full text-left text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between group/btn"
                >
                  <span>{opc.nombre}</span>
                  <span className="text-xs opacity-0 group-hover/btn:opacity-100 transition-all duration-200 text-blue-500 transform translate-x-1 group-hover/btn:translate-x-0">
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