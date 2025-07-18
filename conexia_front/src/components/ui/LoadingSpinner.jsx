export const LoadingSpinner = ({ message = "Cargando..." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-conexia-soft">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-80 max-w-sm text-center flex flex-col items-center">
        <div className="w-12 h-12 mb-6 border-4 border-conexia-green border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-bold text-conexia-green mb-2">{message}</h2>
        <p className="text-sm text-conexia-green/70">Por favor, esperá un momento...</p>
      </div>
    </div>
  );
}; 