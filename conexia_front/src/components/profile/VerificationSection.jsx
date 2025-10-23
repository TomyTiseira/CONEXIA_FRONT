'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, Shield, Calendar } from 'lucide-react';
import { useVerificationStatus } from '@/hooks';
import VerificationModal from './VerificationModal';

export default function VerificationSection() {
  const { isVerified, latestVerification, loading, refresh } = useVerificationStatus();
  const [showModal, setShowModal] = useState(false);

  const handleVerificationComplete = () => {
    setShowModal(false);
    refresh();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Verificación de Identidad</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Verificación de Identidad</h2>
        </div>

        {isVerified ? (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
              <div className="flex-1">
                <p className="font-semibold text-green-800 mb-1">Identidad Verificada</p>
                {latestVerification?.createdAt && (
                  <div className="flex items-center text-sm text-green-700 space-x-2">
                    <Calendar size={16} />
                    <span>Verificado el {formatDate(latestVerification.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-3">
              Tu identidad ha sido verificada correctamente. Ahora puedes acceder a todas las funciones de Conexia.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={24} />
              <div className="flex-1">
                <p className="font-semibold text-amber-800 mb-1">Identidad no verificada</p>
                <p className="text-sm text-amber-700">
                  Verifica tu identidad para acceder a todas las funciones de Conexia.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Con la verificación podrás:
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
                  <span>Crear y publicar proyectos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
                  <span>Postularte a proyectos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
                  <span>Crear servicios</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
                  <span>Solicitar cotizaciones</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Shield size={20} />
              <span>Verificar mi Identidad</span>
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <VerificationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onComplete={handleVerificationComplete}
        />
      )}
    </>
  );
}
