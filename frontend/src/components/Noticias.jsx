const Noticias = () => {
  const historial = [
    { fecha: '30/09/2022', titulo: 'PROCEDIMIENTOS DE INVESTIGACIÓN' },
    { fecha: '17/08/2021', titulo: 'CONVOCATORIA: LLAMADO A CAPÍTULOS DE LIBRO PRODUCTO DE INVESTIGACIÓN' },
    { fecha: '10/02/2021', titulo: 'OCyT - Aun estas a tiempo para participar en el programa de innovacion abierta FOCUS' },
    { fecha: '05/11/2020', titulo: 'ABIERTA CONVOCATORIA ESTÍMULOS POR PRODUCTOS>Adenda # 2' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
      <div className="bg-[#619c8f] px-4 py-3 flex items-center gap-2">
        <span className="text-white text-xl">📰</span>
        <h2 className="text-white font-bold tracking-wider">NOTICIAS / HISTORIAL</h2>
      </div>
      
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#8abeb2] text-white text-sm">
            <th className="p-3 border-r border-white/30 w-32">Fecha</th>
            <th className="p-3">Título</th>
          </tr>
        </thead>
        <tbody>
          {historial.map((item, index) => (
            <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="p-3 text-slate-600 text-sm border-r border-slate-100">{item.fecha}</td>
              <td className="p-3 text-[#c23616] text-sm font-medium">{item.titulo}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="bg-[#619c8f] px-4 py-2 flex justify-between items-center text-white text-xs">
        <div className="flex gap-1">
          <button className="bg-white/20 px-2 rounded hover:bg-white/40">«</button>
          <button className="bg-white text-[#619c8f] px-2 rounded font-bold">1</button>
          <button className="bg-white/20 px-2 rounded hover:bg-white/40">2</button>
          <button className="bg-white/20 px-2 rounded hover:bg-white/40">»</button>
        </div>
        <p>Página 1 de 2, elementos 1 a 4 de 12</p>
      </div>
    </div>
  );
};

export default Noticias;