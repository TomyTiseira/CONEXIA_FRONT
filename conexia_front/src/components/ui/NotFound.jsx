'use client';

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound = ({ 
  title = "Página no encontrada", 
  message = "La página que buscas no existe o no tienes permisos para acceder a ella.",
  showBackButton = true,
  showHomeButton = true 
}) => {
  console.log('NotFound component rendered with props:', { title, message, showBackButton, showHomeButton });
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-red-100 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-96 max-w-sm text-center flex flex-col items-center">
        {/* Icono */}
        <div className="w-16 h-16 mb-6 bg-blue-100 rounded-full flex items-center justify-center">
          <Home className="w-8 h-8 text-blue-600" />
        </div>
        
        {/* Título */}
        <h2 className="text-xl font-bold text-gray-800 mb-3">{title}</h2>
        
        {/* Mensaje */}
        <p className="text-sm text-gray-600 mb-6 px-4">{message}</p>
        
        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {showBackButton && (
            <button
              onClick={handleGoBack}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Volver
            </button>
          )}
          
          {showHomeButton && (
            <button
              onClick={handleGoHome}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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