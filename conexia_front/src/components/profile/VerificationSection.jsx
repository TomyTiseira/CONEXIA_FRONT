'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, Shield, Calendar } from 'lucide-react';
import { useVerificationStatus } from '@/hooks';
import VerificationModal from './VerificationModal';
import Button from '@/components/ui/Button';

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
    return null;
  }

  return (
    <>
      <div className="mt-8">
        <div className="bg-white border border-[#e0e0e0] rounded-xl shadow-md p-4 md:p-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-conexia-green" />
            <h3 className="text-base md:text-lg font-bold text-conexia-green">
              Verificación de Identidad
            </h3>
          </div>
          
          {isVerified ? (
            <>
              <div className="text-gray-500 text-xs md:text-sm mb-4">
                Tu identidad ha sido verificada correctamente.
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#f0f9f4] border border-[#c6e8d4] rounded-lg">
                <CheckCircle className="text-[#367d7d] flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-[#367d7d] mb-1 text-sm">Identidad Verificada</p>
                  {latestVerification?.createdAt && (
                    <div className="flex items-center text-xs text-[#4a9b7f] gap-1.5">
                      <Calendar size={14} />
                      <span>Verificado el {formatDate(latestVerification.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-gray-500 text-xs md:text-sm mb-4">
                Verifica tu identidad para acceder a todas las funciones de Conexia.
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-[#fef9f0] border border-[#f5d68f] rounded-lg mb-4">
                <AlertCircle className="text-[#d4930f] flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-[#d4930f] mb-1 text-sm">Identidad no verificada</p>
                  <p className="text-xs text-[#9c7a2e]">
                    Completa el proceso de verificación para desbloquear todas las funcionalidades.
                  </p>
                </div>
              </div>

              <div className="bg-[#f8faf9] rounded-lg p-4 mb-4 border border-[#e3ebe7]">
                <p className="text-sm font-semibold text-[#367d7d] mb-3">
                  Con la verificación podrás:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#48a6a7] flex-shrink-0" />
                    <span className="text-xs text-gray-700">Crear proyectos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#48a6a7] flex-shrink-0" />
                    <span className="text-xs text-gray-700">Postularte a proyectos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#48a6a7] flex-shrink-0" />
                    <span className="text-xs text-gray-700">Crear servicios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#48a6a7] flex-shrink-0" />
                    <span className="text-xs text-gray-700">Solicitar cotizaciones</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center sm:justify-end">
                <Button
                  onClick={() => setShowModal(true)}
                  variant="primary"
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <Shield size={18} />
                  <span>Verificar mi Identidad</span>
                </Button>
              </div>
            </>
          )}
        </div>
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
