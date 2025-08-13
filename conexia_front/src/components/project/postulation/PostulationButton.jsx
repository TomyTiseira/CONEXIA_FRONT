'use client';

import { useState } from 'react';
import { CheckCircle, X, FileText } from 'lucide-react';
import { usePostulation } from '@/hooks/postulations';
import { ROLES } from '@/constants/roles';
import PostulationModal from './PostulationModal';
import Toast from '@/components/ui/Toast';

export default function PostulationButton({ 
  projectId, 
  projectTitle, 
  isOwner, 
  userRole,
  initialIsApplied = false,
  className = '' 
}) {
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const {
    isApplied,
    loading,
    error,
    setError,
    handleApply,
    handleCancel,
  } = usePostulation(projectId, isOwner, initialIsApplied);

  // No mostrar botón si es owner o no es USER
  if (isOwner || userRole !== ROLES.USER) {
    return null;
  }

  const onApplySuccess = async (cvFile) => {
    const success = await handleApply(cvFile);
    if (success) {
      setShowModal(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000); // Ocultar después de 5 segundos
    }
  };

  const onCancelSuccess = async () => {
    const success = await handleCancel();
    if (success) {
      setShowCancelConfirm(false);
    }
  };

  return (
    <>
      {/* Botón principal */}
      {isApplied ? (
        <button
          onClick={() => setShowCancelConfirm(true)}
          disabled={loading}
          className={`bg-orange-500 text-white px-4 py-2 rounded font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          <div className="flex items-center gap-1.5">
            <X size={14} />
            <span>{loading ? 'Cancelando...' : 'Cancelar postulación'}</span>
          </div>
        </button>
      ) : (
        <button
          onClick={() => {
            setError(null);
            setShowModal(true);
          }}
          disabled={loading}
          className={`bg-conexia-green text-white px-4 py-2 rounded font-semibold hover:bg-conexia-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          <div className="flex items-center gap-1.5">
            <FileText size={14} />
            <span>{loading ? 'Postulando...' : 'Postularse'}</span>
          </div>
        </button>
      )}

      {/* Modal de postulación */}
      <PostulationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={onApplySuccess}
        loading={loading}
        error={error}
        projectTitle={projectTitle}
      />

      {/* Modal de confirmación para cancelar */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Cancelar postulación
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro que deseas cancelar tu postulación al proyecto "{projectTitle}"?
              </p>
              {error && (
                <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setError(null);
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  No, mantener
                </button>
                <button
                  onClick={onCancelSuccess}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Cancelando...' : 'Sí, cancelar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast de éxito */}
      <Toast
        type="success"
        message="Tu postulación fue enviada correctamente."
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
        duration={5000}
      />
    </>
  );
}
