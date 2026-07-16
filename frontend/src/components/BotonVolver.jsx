import { useNavigate } from 'react-router-dom';

function BotonVolver() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-wider mb-6 transition-colors bg-slate-100 hover:bg-slate-200/80 px-4 py-2 rounded-xl border border-slate-200/40 w-fit"
    >
      <span className="text-sm">←</span> Volver Atrás
    </button>
  );
}

export default BotonVolver;