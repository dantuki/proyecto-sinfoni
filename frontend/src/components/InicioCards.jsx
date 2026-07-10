const InicioCards = ({ cambiarVista, usuario }) => {
  const esAdmin = usuario?.rol === 'Admin';

  // Opciones base para la tarjeta de convocatorias
  const opcionesConvocatorias = [
    { nombre: esAdmin ? 'Revisar Solicitudes' : 'Mis Solicitudes (Historial)', vista: 'participaciones' },
    { nombre: 'Convocatorias Abiertas', vista: 'convocatorias_abiertas' }
  ];

  // Si es administrador, le inyectamos la opción de crear convocatoria al menú de la tarjeta
  if (esAdmin) {
    opcionesConvocatorias.push({ nombre: 'Crear Convocatoria', vista: 'crear_convocatoria' });
  }

  const categorias = [
    {
      titulo: 'Recursos Humanos',
      icono: '👤',
      color: 'from-blue-500 to-blue-600',
      opciones: [
        { nombre: 'Datos Personales', vista: 'datos_personales' },
        { nombre: esAdmin ? 'Administrar Noticias' : 'Noticias', vista: 'noticias' }
      ]
    },
    {
      titulo: 'Proyectos',
      icono: '🌐',
      color: 'from-indigo-500 to-indigo-600',
      opciones: [
        { nombre: esAdmin ? 'Gestión de Proyectos' : 'Mis Proyectos', vista: 'proyectos' },
        { nombre: esAdmin ? 'Control de Participaciones' : 'Mis Participaciones', vista: 'participaciones' }
      ]
    },
    {
      titulo: 'Convocatorias',
      icono: '📑',
      color: 'from-green-500 to-green-600',
      opciones: opcionesConvocatorias // Usa la lista dinámica corregida
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto mt-10 group">
      {categorias.map((cat, index) => (
        <div 
          key={index}
          className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:z-50 cursor-default overflow-hidden border border-white/40 group-hover:opacity-50 hover:!opacity-100 h-64 flex flex-col justify-center items-center"
        >
          <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${cat.color}`}></div>
          <div className="text-5xl mb-4 transition-transform duration-300 transform hover:-translate-y-2">{cat.icono}</div>
          <h2 className="text-xl font-bold text-slate-700 text-center mb-4">{cat.titulo}</h2>
          
          <div className="flex flex-col gap-2 w-3/4 opacity-0 absolute bottom-6 transition-all duration-300 hover:opacity-100 text-center bg-white/95 p-4 rounded-xl shadow-inner">
            {cat.opciones.map((opc, i) => (
              <button 
                key={i}
                onClick={() => cambiarVista(opc.vista)}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 py-1 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
              >
                {opc.nombre}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InicioCards;