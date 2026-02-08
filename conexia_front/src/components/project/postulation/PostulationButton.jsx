'use client';

import { useState } from 'react';
import { CheckCircle, X, FileText, Info } from 'lucide-react';
import { usePostulation } from '@/hooks/postulations';
import { ROLES } from '@/constants/roles';
import PostulationModal from './PostulationModal';
import Toast from '@/components/ui/Toast';
import RequireVerification from '@/components/common/RequireVerification';
import { useAccountStatus } from '@/hooks/useAccountStatus';

export default function PostulationButton({ 
  projectId, 
  projectTitle, 
  project = null,
  isOwner, 
  userRole,
  initialIsApplied = false,
  className = '' 
}) {
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { canCreateContent, suspensionMessage } = useAccountStatus();
  
  const {
    isApplied,
    loading,
    error,
    setError,
    handleApply,
    handleCancel,
    checkingStatus,
    postulationStatus,
    initialLoad,
  } = usePostulation(projectId, isOwner, initialIsApplied);

  // No mostrar botón si es owner, no es USER, está finalizado o el cupo está completo
  const isFinished = project && project.endDate && require('@/utils/postulationValidation').isProjectFinished(project);
  const isFull = project && typeof project.maxCollaborators === 'number' && typeof project.approvedApplications === 'number' && project.approvedApplications >= project.maxCollaborators;
  // Mostrar botón deshabilitado si el cupo está lleno y el usuario no está postulado
  if (isOwner || userRole !== ROLES.USER || isFinished) {
    return null;
  }

  const onApplySuccess = async (cvFile) => {
    const success = await handleApply(cvFile, project);
    if (success) {
      setShowModal(false);
      setToast({ visible: true, type: 'success', message: 'Postulación enviada correctamente.' });
    }
  };

  const onCancelSuccess = async () => {
    const success = await handleCancel();
    if (success) {
      setShowCancelConfirm(false);
      setToast({ visible: true, type: 'success', message: 'Postulación cancelada correctamente.' });
    }
  };

  // Función para obtener el estilo y contenido del botón según el estado
  const getButtonContent = () => {
    // Durante la carga inicial, mostrar un estado de carga más sutil
    if (checkingStatus || initialLoad) {
      return {
        className: `bg-gray-400 text-white px-4 py-2 rounded font-semibold cursor-not-allowed ${className}`,
        content: (
          <div className="flex items-center gap-1.5">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            <span>Verificando...</span>
          </div>
        ),
        disabled: true,
        onClick: null
      };
    }

    if (postulationStatus) {
      switch (postulationStatus.code) {
        case 'activo':
          return {
            className: `bg-orange-500 text-white px-4 py-2 rounded font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`,
            content: (
              <div className="flex items-center gap-1.5">
                <X size={14} />
                <span>{loading ? 'Cancelando...' : 'Cancelar postulación'}</span>
              </div>
            ),
            disabled: loading,
            onClick: () => setShowCancelConfirm(true)
          };
        
        case 'aceptada':
          return {
            className: `bg-green-600 text-white px-4 py-2 rounded font-semibold cursor-not-allowed ${className}`,
            content: (
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} />
                <span>Postulación aceptada</span>
              </div>
            ),
            disabled: true,
            onClick: null
          };
        
        case 'rechazada':
          return {
            className: `bg-red-600 text-white px-4 py-2 rounded font-semibold cursor-not-allowed ${className}`,
            content: (
              <div className="flex items-center gap-1.5">
                <X size={14} />
                <span>Postulación rechazada</span>
              </div>
            ),
            disabled: true,
            onClick: null
          };
        
        case 'cancelada':
          // Permitir postularse nuevamente si fue cancelada
          break;
      }
    }

    // No hay postulación
    if (isFull) {
      return {
        className: `bg-gray-300 text-gray-500 px-4 py-2 rounded font-semibold cursor-not-allowed ${className}`,
        content: (
          <div className="flex items-center gap-1.5">
            <Info size={16} />
            <span>Cupo completo</span>
          </div>
        ),
        disabled: true,
        onClick: null
      };
    }
    
    // Verificar si el usuario está suspendido
    if (!canCreateContent) {
      return {
        className: `bg-gray-300 text-gray-500 px-4 py-2 rounded font-semibold cursor-not-allowed ${className}`,
        content: (
          <div className="flex items-center gap-1.5">
            <Info size={16} />
            <span>No disponible</span>
          </div>
        ),
        disabled: true,
        onClick: null,
        title: suspensionMessage
      };
    }
    
    return {
      className: `bg-conexia-green text-white px-4 py-2 rounded font-semibold hover:bg-conexia-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`,
      content: (
        <div className="flex items-center gap-1.5">
          <FileText size={14} />
          <span>{loading ? 'Postulando...' : 'Postularse'}</span>
        </div>
      ),
      disabled: loading,
      onClick: () => {
        setError(null);
        setShowModal(false); // Cierra primero para reiniciar el estado interno
        setTimeout(() => setShowModal(true), 0); // Reabre el modal en el siguiente ciclo
      }
    };
  };

  const buttonConfig = getButtonContent();

  return (
    <>
      {/* Botón principal */}
      <RequireVerification action="postularte a este proyecto">
        <div title={buttonConfig.title || ''}>
          <button
            onClick={buttonConfig.onClick}
            disabled={buttonConfig.disabled}
            className={buttonConfig.className}
          >
            {buttonConfig.content}
          </button>
        </div>
      </RequireVerification>

      {/* Modal de postulación */}
      {/* Solo mostrar el modal si el cupo NO está lleno */}
      {!isFull && (
        <PostulationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={onApplySuccess}
          loading={loading}
          error={error}
          projectTitle={projectTitle}
          key={showModal ? projectId : undefined} // Forzar remount para limpiar estado interno
        />
      )}

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
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setError(null);
                  }}
                  disabled={loading}
                  className="bg-[#f5f6f6] text-[#555] px-5 py-2 rounded-lg font-medium hover:bg-[#eceeee] transition border border-[#d9dddd] shadow-sm focus:outline-none focus:ring-2 focus:ring-conexia-green/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Volver sin cancelar la postulación"
                >
                  Volver
                </button>
                <button
                  onClick={onCancelSuccess}
                  disabled={loading}
                  className="bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400/40 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  aria-label="Confirmar cancelación de la postulación"
                >
                  {loading ? 'Cancelando…' : 'Cancelar postulación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast de postulación/cancelación */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast(t => ({ ...t, visible: false }))}
        duration={5000}
        position="top-center"
      />
    </>
  );
}
