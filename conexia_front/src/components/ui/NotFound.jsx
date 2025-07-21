'use client';

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';

export const NotFound = ({ 
  title = "Página no encontrada", 
  message = "La página que buscas no existe o no tienes permisos para acceder a ella.",
  showBackButton = true,
  showHomeButton = true 
}) => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-conexia-soft flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-96 max-w-sm text-center flex flex-col items-center">
        {/* Icono */}
        <div className="w-16 h-16 mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        {/* Título */}
        <h2 className="text-xl font-bold text-conexia-green mb-3">{title}</h2>
        
        {/* Mensaje */}
        <p className="text-sm text-conexia-green/70 mb-6 px-4">{message}</p>
        
        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {showBackButton && (
            <button
              onClick={handleGoBack}
              className="flex-1 bg-conexia-soft text-conexia-green px-4 py-2 rounded-lg font-semibold hover:bg-conexia-green hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Volver
            </button>
          )}
          
          {showHomeButton && (
            <button
              onClick={handleGoHome}
              className="flex-1 bg-conexia-green text-white px-4 py-2 rounded-lg font-semibold hover:bg-conexia-green/90 transition-colors flex items-center justify-center gap-2"
            >
              <Home size={16} />
              Ir al Inicio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 