'use client';

import { useState } from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { useVerificationStatus } from '@/hooks';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RequireVerification({ children, onUnverified, action = 'realizar esta acción' }) {
  const { isVerified, loading } = useVerificationStatus();
  const { user: authUser } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const router = useRouter();

  if (loading) {
    return (
      <div className="inline-block opacity-50 cursor-wait">
        {children}
      </div>
    );
  }

  const handleClick = (e) => {
    if (!isVerified) {
      e.preventDefault();
      e.stopPropagation();
      setShowWarning(true);
      onUnverified?.();
    }
  };

  const handleGoToVerification = () => {
    setShowWarning(false);
    const userId = authUser?.id;
    if (userId) {
      router.push(`/profile/userProfile/${userId}`);
    } else {
      // Fallback en caso de que no haya usuario autenticado
      router.push('/login');
    }
  };

  return (
    <>
      <div 
        onClickCapture={handleClick} 
        className={!isVerified ? 'cursor-not-allowed inline-block' : 'inline-block'}
      >
        {children}
      </div>

      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-amber-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Verificación Requerida
                </h3>
                <p className="text-gray-600">
                  Para {action} debes verificar tu identidad primero.
                </p>
              </div>
              <button
                onClick={() => setShowWarning(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">¿Por qué necesito verificar mi identidad?</p>
                  <p>
                    La verificación de identidad ayuda a mantener la seguridad y confianza en la
                    plataforma, protegiendo a todos los usuarios de Conexia.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGoToVerification}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Shield size={18} />
                <span>Ir a Verificación</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
