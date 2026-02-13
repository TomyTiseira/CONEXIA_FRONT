/**
 * Claim Detail Page
 * Vista de detalle de un reclamo
 */

'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, AlertCircle, Loader2, Clock } from 'lucide-react';
import { getClaimById, markAsInReview } from '@/service/claims';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import { ClaimEvidenceViewer } from '@/components/claims/ClaimEvidenceViewer';
import { ClaimResolutionModal } from '@/components/claims/ClaimResolutionModal';
import { AddObservationsModal } from '@/components/claims/AddObservationsModal';
import { SubsanarClaimModal } from '@/components/claims/SubsanarClaimModal';
import Navbar from '@/components/navbar/Navbar';
import BackButton from '@/components/ui/BackButton';
import {
  CLIENT_CLAIM_TYPE_LABELS,
  PROVIDER_CLAIM_TYPE_LABELS,
  CLAIM_STATUS,
} from '@/constants/claims';
import { useClaimPermissions } from '@/hooks/claims';
import Toast from '@/components/ui/Toast';
import { useUserStore } from '@/store/userStore';
import NotFoundPage from '@/app/not-found';

export default function ClaimDetailPage({ params }) {
  const router = useRouter();
  const { user } = useUserStore();
  const unwrappedParams = use(params);
  const claimId = unwrappedParams?.id;
  
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [isObservationsModalOpen, setIsObservationsModalOpen] = useState(false);
  const [isSubsanarModalOpen, setIsSubsanarModalOpen] = useState(false);
  const [processingReview, setProcessingReview] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, type: '', message: '' });

  // Cargar reclamo
  useEffect(() => {
    const fetchClaim = async () => {
      if (!claimId) return;

      try {
        setLoading(true);
        const data = await getClaimById(claimId);
        setClaim(data);
      } catch (err) {
        console.error('Error fetching claim:', err);
        setError(err.message || 'Error al cargar el reclamo');
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [claimId]);

  // Permisos
  const permissions = useClaimPermissions(user, claim?.hiring, claim ? [claim] : []);

  // Marcar como en revisión
  const handleMarkAsInReview = async () => {
    if (!claim) return;

    try {
      setProcessingReview(true);
      const updatedClaim = await markAsInReview(claim.id);
      setClaim(updatedClaim);
      setToast({ isVisible: true, type: 'success', message: 'Reclamo marcado como "En revisión"' });
    } catch (err) {
      console.error('Error marking as in review:', err);
      setToast({ isVisible: true, type: 'error', message: err.message || 'Error al actualizar el estado' });
    } finally {
      setProcessingReview(false);
    }
  };

  // Success de resolución
  const handleResolutionSuccess = (resolvedClaim) => {
    setClaim(resolvedClaim);
  };

  // Success de observaciones
  const handleObservationsSuccess = (updatedClaim) => {
    setClaim(updatedClaim);
  };

  // Success de subsanación
  const handleSubsanarSuccess = async () => {
    // Recargar el reclamo para ver el nuevo estado
    try {
      const updatedClaim = await getClaimById(claim.id);
      setClaim(updatedClaim);
    } catch (err) {
      console.error('Error refreshing claim:', err);
    }
  };

  // Mostrar toast
  const showToast = (type, message) => {
    setToast({ isVisible: true, type, message });
  };

  // Check authentication - if no user, show not found
  if (!user) {
    return <NotFoundPage />;
  }

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  // Error
  if (error || !claim) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error al cargar el reclamo</h2>
          <p className="text-red-700 mb-4">{error || 'Reclamo no encontrado'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Verificar permisos de visualización
  if (!permissions.canView) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle size={48} className="mx-auto text-yellow-500 mb-3" />
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">Acceso denegado</h2>
          <p className="text-yellow-700 mb-4">No tienes permiso para ver este reclamo</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const claimTypeLabel = claim.claimantRole === 'client'
    ? CLIENT_CLAIM_TYPE_LABELS[claim.claimType]
    : PROVIDER_CLAIM_TYPE_LABELS[claim.claimType];

  const isResolved = claim.status === CLAIM_STATUS.RESOLVED || claim.status === CLAIM_STATUS.REJECTED;
  const canTakeAction = permissions.canResolve && claim.status !== CLAIM_STATUS.RESOLVED && claim.status !== CLAIM_STATUS.REJECTED;
  
  // Verificar si el usuario es el denunciante y el reclamo está pendiente de subsanación
  const isClaimant = user?.id === claim.claimantUserId;
  const canSubsanar = isClaimant && claim.status === CLAIM_STATUS.PENDING_CLARIFICATION;

  const rawClarificationEvidenceUrls =
    claim.clarificationEvidenceUrls ||
    claim.clarificationEvidence ||
    claim.additionalEvidenceUrls ||
    claim.newEvidenceUrls;
  const clarificationEvidenceUrls = Array.isArray(rawClarificationEvidenceUrls)
    ? rawClarificationEvidenceUrls
    : rawClarificationEvidenceUrls
      ? [rawClarificationEvidenceUrls]
      : [];

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Título con franja blanca */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mb-6">
          <h1 className="text-2xl font-bold text-center text-gray-900">Reclamo #{claim.id}</h1>
        </div>

        {/* Información del Reclamo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Información del reclamo</h2>
          <ClaimStatusBadge status={claim.status} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Servicio</p>
            {claim.hiring?.service?.id ? (
              <Link 
                href={`/services/${claim.hiring.service.id}`}
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                {claim.hiring?.service?.title || claim.hiring?.serviceTitle || 'N/A'}
              </Link>
            ) : (
              <p className="font-medium text-gray-900">
                {claim.hiring?.service?.title || claim.hiring?.serviceTitle || 'N/A'}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Reclamante</p>
            <p className="font-medium text-gray-900">
              {claim.claimantFirstName && claim.claimantLastName
                ? `${claim.claimantFirstName} ${claim.claimantLastName}`
                : claim.claimantName || claim.claimantUser?.name || 'N/A'} ({claim.claimantRole === 'client' ? 'Cliente' : 'Proveedor'})
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Persona Reclamada</p>
            <p className="font-medium text-gray-900">
              {claim.claimedUserFirstName && claim.claimedUserLastName
                ? `${claim.claimedUserFirstName} ${claim.claimedUserLastName}`
                : claim.claimedUserName || 'N/A'} ({claim.claimantRole === 'client' ? 'Proveedor' : 'Cliente'})
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Motivo</p>
            <p className="font-medium text-gray-900">
              {claim.otherReason 
                ? claimTypeLabel.replace('(especificar)', `(${claim.otherReason})`)
                : claimTypeLabel
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Fecha de creación</p>
            <p className="font-medium text-gray-900 flex items-center gap-1">
              <Calendar size={16} />
              {new Date(claim.createdAt).toLocaleString('es-AR', { timeZone: 'UTC' })}
            </p>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{claim.description}</p>
      </div>

      {/* Evidencias */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Evidencias {claim.evidenceUrls?.length > 0 && `(${claim.evidenceUrls.length})`}
        </h2>
        <ClaimEvidenceViewer evidenceUrls={claim.evidenceUrls} />
      </div>

      {/* Observaciones del Moderador (si existen) */}
      {claim.observations && (
        <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-blue-600" />
            Observaciones del Moderador
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Fecha</p>
              <p className="font-medium text-gray-900 flex items-center gap-1">
                <Calendar size={16} />
                {new Date(claim.observationsAt).toLocaleString('es-AR', { timeZone: 'UTC' })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Observaciones</p>
              <p className="text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border border-gray-200">
                {claim.observations}
              </p>
            </div>
          </div>

          {/* Botón Subsanar (solo para el denunciante y solo si está pending_clarification) */}
          {canSubsanar && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <button
                onClick={() => setIsSubsanarModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                Subsanar reclamo
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Proporciona la información adicional solicitada por el moderador
              </p>
            </div>
          )}
        </div>
      )}

      {/* Respuesta de Subsanación (si existe) */}
      {claim.clarificationResponse && (
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-green-600" />
            Respuesta del Reclamante
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Respuesta a las observaciones</p>
              <p className="text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border border-gray-200">
                {claim.clarificationResponse}
              </p>
            </div>

            {clarificationEvidenceUrls.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Evidencias de subsanación</p>
                <ClaimEvidenceViewer evidenceUrls={clarificationEvidenceUrls} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Acciones de Moderación (Admin/Moderador) */}
      {canTakeAction && (
        <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones de Moderación</h2>
          <div className="flex flex-wrap gap-3">
            {claim.status === CLAIM_STATUS.OPEN && (
              <button
                onClick={handleMarkAsInReview}
                disabled={processingReview}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingReview ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Clock size={18} />
                )}
                Marcar como &quot;En revisión&quot;
              </button>
            )}
            
            {(claim.status === CLAIM_STATUS.OPEN || claim.status === CLAIM_STATUS.IN_REVIEW) && (
              <button
                onClick={() => setIsObservationsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Agregar observaciones
              </button>
            )}

            <button
              onClick={() => setIsResolutionModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Resolver / Rechazar
            </button>
          </div>
        </div>
      )}

      {/* Resolución (si está resuelto) */}
      {isResolved && claim.resolution && (
        <div className={`rounded-lg shadow-sm border p-6 ${
          claim.status === CLAIM_STATUS.RESOLVED
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Resolución
            <ClaimStatusBadge status={claim.status} />
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Resuelto por</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <User size={16} />
                  {claim.resolvedByName || claim.resolvedByEmail || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Fecha de resolución</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(claim.resolvedAt).toLocaleString('es-AR', { timeZone: 'UTC' })}
                </p>
              </div>
            </div>

            {claim.status === CLAIM_STATUS.RESOLVED && claim.resolutionType && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Tipo de resolución</p>
                <p className="font-medium text-gray-900">
                  {claim.resolutionType === 'client_favor' && '✓ A favor del cliente'}
                  {claim.resolutionType === 'provider_favor' && '✓ A favor del proveedor'}
                  {claim.resolutionType === 'partial_agreement' && '✓ Acuerdo parcial'}
                </p>
              </div>
            )}

            {claim.partialAgreementDetails && (
              <div className="bg-white p-4 rounded-lg border border-green-300">
                <p className="text-sm font-medium text-gray-700 mb-2">Detalles del acuerdo parcial</p>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {claim.partialAgreementDetails}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500 mb-1">Explicación de la resolución</p>
              <p className="text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border border-gray-200">
                {claim.resolution}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de resolución */}
      {isResolutionModalOpen && (
        <ClaimResolutionModal
          isOpen={isResolutionModalOpen}
          onClose={() => setIsResolutionModalOpen(false)}
          claim={claim}
          onSuccess={handleResolutionSuccess}
          showToast={showToast}
        />
      )}

      {/* Modal de observaciones */}
      {isObservationsModalOpen && (
        <AddObservationsModal
          isOpen={isObservationsModalOpen}
          onClose={() => setIsObservationsModalOpen(false)}
          claim={claim}
          onSuccess={handleObservationsSuccess}
          showToast={showToast}
        />
      )}

      {/* Modal de subsanación */}
      {isSubsanarModalOpen && (
        <SubsanarClaimModal
          isOpen={isSubsanarModalOpen}
          onClose={() => setIsSubsanarModalOpen(false)}
          claim={claim}
          onSuccess={handleSubsanarSuccess}
          showToast={showToast}
        />
      )}

        {/* Toast */}
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={() => setToast({ ...toast, isVisible: false })}
          position="top-center"
        />

        {/* Botón Volver */}
        <div className="mt-8 mb-4">
          <BackButton onClick={() => router.back()} text="Volver" />
        </div>
      </div>
    </>
  );
}
