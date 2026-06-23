import FormularioSolicitud from './components/FormularioSolicitud';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Registro de Solicitudes SINFONI
        </h1>
        <FormularioSolicitud />
      </div>
    </div>
  );
}

export default App;