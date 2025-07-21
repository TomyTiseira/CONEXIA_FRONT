'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export const ErrorDisplay = ({ 
  error, 
  message = "Ha ocurrido un error", 
  showRetry = false,
  onRetry,
  redirectTo = "/login"
}) => {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleRedirect = () => {
    router.push(redirectTo);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-conexia-soft">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-96 max-w-sm text-center flex flex-col items-center">
        <div className="w-16 h-16 mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-conexia-green mb-3">{message}</h2>
        {error && (
          <p className="text-sm text-conexia-green/70 mb-6 px-4">{error}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {showRetry && (
            <button
              onClick={handleRetry}
              className="flex-1 bg-conexia-green text-white px-4 py-2 rounded-lg font-semibold hover:bg-conexia-green/90 transition-colors"
            >
              Reintentar
            </button>
          )}
          <button
            onClick={handleRedirect}
            className="flex-1 bg-conexia-soft text-conexia-green px-4 py-2 rounded-lg font-semibold hover:bg-conexia-green hover:text-white transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}; 