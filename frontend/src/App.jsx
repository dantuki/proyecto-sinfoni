import FormularioSolicitud from './components/FormularioSolicitud';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-3xl border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-extrabold tracking-tight mb-3">
            <span className="text-[#5B9BD5]">ARCHIVE</span><span className="text-[#70AD47]">X</span>
          </h1>
          <p className="text-[#5B9BD5] font-medium tracking-wide text-lg">
            El poder del conocimiento, en un solo lugar.
          </p>
        </div>
        <FormularioSolicitud />
      </div>
    </div>
  );
}

export default App;