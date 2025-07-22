'use client';

export default function LoadingModal({ message = "Cargando..." }) {
  return (
    <div className="fixed inset-0 z-50 bg-conexia-soft flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 w-80 max-w-sm text-center flex flex-col items-center">
        <div className="w-8 h-8 mb-4 border-4 border-conexia-green border-t-transparent rounded-full animate-spin" />
        <h2 className="text-lg font-bold text-conexia-green">{message}</h2>
        <p className="text-sm text-gray-500 mt-2">Por favor, esperá un momento...</p>
      </div>
    </div>
  );
}