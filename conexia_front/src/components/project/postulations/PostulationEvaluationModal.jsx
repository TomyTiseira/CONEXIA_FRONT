'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approvePostulation, rejectPostulation } from '@/service/postulations/postulationService';
import { config } from '@/config';

export default function PostulationEvaluationModal({ postulation, onClose, onApproved, onResult }) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      setError('');
      await approvePostulation(postulation.id);
      const message = 'Postulación aprobada correctamente';
      setSuccess(message);
      if (onResult) {
        onResult({ status: 'approved', message });
      } else if (onApproved) {
        onApproved();
      }
    } catch (err) {
      console.error('Error approving postulation:', err);
      const errMsg = err.message || 'Error al aprobar la postulación';
      setError(errMsg);
      if (onResult) onResult({ status: 'error', message: errMsg });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsRejecting(true);
      setError('');
      
      await rejectPostulation(postulation.id);
      
      setSuccess('Postulación rechazada correctamente');
      const message = 'Postulación rechazada correctamente';
      setSuccess(message);
      if (onResult) {
        onResult({ status: 'rejected', message });
      } else if (onApproved) {
        onApproved();
      }
    } catch (error) {
      console.error('Error rejecting postulation:', error);
      setError(error.message || 'Error al rechazar la postulación');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleViewProfile = () => {
    router.push(`/profile/userProfile/${postulation.userId}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-conexia-green">
            Evaluar Postulación
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
            disabled={isApproving}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          {/* Warning/Info message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Confirmación requerida
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Una vez aprobada, la postulación no se puede revertir. El usuario será notificado automáticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Applicant info */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              Información del postulante
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">
                  {postulation.applicantName || 'Usuario'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-medium text-blue-600">
                  {postulation.status?.name || 'Sin estado'}
                </span>
              </div>
              
              {postulation.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de postulación:</span>
                  <span className="font-medium">
                    {new Date(postulation.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>

            {/* Profile button */}
            <button
              onClick={handleViewProfile}
              className="w-full mt-3 bg-blue-50 text-blue-700 px-4 py-2 rounded hover:bg-blue-100 transition text-sm font-medium border border-blue-200"
              disabled={isApproving}
            >
              Ver perfil completo
            </button>
          </div>

          {/* CV Section */}
          {postulation.cvUrl && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Currículum Vitae
              </h3>
              <button
                onClick={() => {
                  const fullUrl = `${config.DOCUMENT_URL}${postulation.cvUrl}`;
                  window.open(fullUrl, '_blank');
                }}
                className="text-conexia-green hover:text-conexia-green/80 text-sm font-medium hover:underline"
                disabled={isApproving}
              >
                Descargar CV
              </button>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className={`${success.includes('rechazada') 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-green-50 border border-green-200'} rounded-lg p-3`}>
              <p className={`${success.includes('rechazada') 
                ? 'text-red-700' 
                : 'text-green-700'} text-sm font-medium`}>
                {success}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-400 transition"
            disabled={isApproving || isRejecting}
          >
            Cancelar
          </button>
          
          <button
            onClick={handleReject}
            disabled={isApproving || isRejecting || success}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRejecting ? 'Rechazando...' : 'Rechazar'}
          </button>
          
          <button
            onClick={handleApprove}
            disabled={isApproving || isRejecting || success}
            className="flex-1 bg-conexia-green text-white px-4 py-2 rounded font-medium hover:bg-conexia-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving ? 'Aprobando...' : 'Aprobar'}
          </button>
        </div>
      </div>
    </div>
  );
}
