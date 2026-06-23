const DatosPersonales = () => {
  return (
    <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl border border-slate-200 p-8 mx-auto mt-6">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Foto y CC */}
        <div className="flex flex-col items-center w-full md:w-1/3">
          <div className="w-40 h-48 bg-slate-200 border-4 border-slate-100 rounded-lg overflow-hidden shadow-sm mb-4">
            {/* Espacio para la foto real cuando conectemos el login */}
            <img src="https://via.placeholder.com/150" alt="Perfil" className="w-full h-full object-cover" />
          </div>
          <div className="text-center w-full">
            <p className="text-slate-500 font-bold text-sm">CC</p>
            <p className="text-slate-700 text-lg">65764515</p>
          </div>
        </div>

        {/* Datos de Texto */}
        <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Primer Apellido:</p>
            <p className="text-[#1b5b8c] text-xl font-semibold uppercase">CLAVIJO</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Segundo Apellido:</p>
            <p className="text-[#1b5b8c] text-xl font-semibold uppercase">BUSTOS</p>
          </div>
          <div className="col-span-2 border-b border-slate-100 pb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Nombre:</p>
            <p className="text-[#1b5b8c] text-xl font-semibold uppercase">NELLY</p>
          </div>
          
          <div>
            <p className="text-xs text-slate-500">Ciudad Nacimiento:</p>
            <p className="font-medium text-slate-700">-</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">País Nacimiento:</p>
            <p className="font-medium text-slate-700">-</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-500 inline-block mr-2">Fecha Nacimiento:</p>
            <p className="font-bold text-[#1b5b8c] inline-block">26/12/1974</p>
          </div>
        </div>
      </div>

      {/* Caja Gris de Dirección */}
      <div className="mt-8 bg-slate-100 rounded-lg p-6 flex items-start gap-4 shadow-inner">
        <div className="text-4xl text-blue-500 mt-1">📍</div>
        <div className="grid grid-cols-2 gap-4 w-full text-sm">
          <p><span className="text-slate-500">Dirección:</span> </p>
          <p><span className="text-slate-500">Localidad:</span> </p>
          <p><span className="text-slate-500">Código Postal:</span> </p>
          <p><span className="text-slate-500">Provincia:</span> </p>
        </div>
      </div>
    </div>
  );
};

export default DatosPersonales;