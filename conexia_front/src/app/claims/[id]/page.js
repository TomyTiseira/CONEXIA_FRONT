/**
 * Claim Detail Page
 * Vista de detalle de un reclamo
 */

'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, AlertCircle, Loader2, Clock } from 'lucide-react';
import { getClaimById, markAsInReview } from '@/service/claims';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import { ClaimEvidenceViewer } from '@/components/claims/ClaimEvidenceViewer';
import { ClaimResolutionModal } from '@/components/claims/ClaimResolutionModal';
import {
  CLIENT_CLAIM_TYPE_LABELS,
  PROVIDER_CLAIM_TYPE_LABELS,
  CLAIM_STATUS,
} from '@/constants/claims';
import { useClaimPermissions } from '@/hooks/claims';
import Toast from '@/components/ui/Toast';
import { useUserStore } from '@/store/userStore';

export default function ClaimDetailPage({ params }) {
  const router = useRouter();
  const { user } = useUserStore();
  const unwrappedParams = use(params);
  const claimId = unwrappedParams?.id;
  
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
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
      setToast({ isVisible: true, type: 'success', message: 'Reclamo marcado como "En Revisión"' });
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reclamo #{claim.id.slice(0, 8)}</h1>
      </div>

      {/* Información del Reclamo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Información del Reclamo</h2>
          <ClaimStatusBadge status={claim.status} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Servicio</p>
            <p className="font-medium text-gray-900">{claim.hiring?.service?.title || claim.hiring?.serviceTitle || 'N/A'}</p>
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
            <p className="text-sm text-gray-500 mb-1">Motivo</p>
            <p className="font-medium text-gray-900">{claimTypeLabel}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Fecha de creación</p>
            <p className="font-medium text-gray-900 flex items-center gap-1">
              <Calendar size={16} />
              {new Date(claim.createdAt).toLocaleString('es-AR')}
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
                Marcar como &quot;En Revisión&quot;
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
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Resuelto por</p>
              <p className="font-medium text-gray-900">{claim.resolvedByUser?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Fecha de resolución</p>
              <p className="font-medium text-gray-900 flex items-center gap-1">
                <Calendar size={16} />
                {new Date(claim.resolvedAt).toLocaleString('es-AR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Explicación</p>
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
          token={token}
          onSuccess={handleResolutionSuccess}
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
    </div>
  );
}
