/**
 * Admin Claims Panel
 * Panel de administración de reclamos para moderadores
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { getClaims, markAsInReview } from '@/service/claims';
import { ClaimsFilters } from '@/components/claims/ClaimsFilters';
import { AdminClaimsTable } from '@/components/claims/AdminClaimsTable';
import { ClaimDetailModal } from '@/components/claims/ClaimDetailModal';
import { ClaimActionsModal } from '@/components/claims/ClaimActionsModal';
import { AddObservationsModal } from '@/components/claims/AddObservationsModal';
import { ClaimResolutionModal } from '@/components/claims/ClaimResolutionModal';
import { ClaimRejectionModal } from '@/components/claims/ClaimRejectionModal';
import { SelectComplianceModal } from '@/components/claims/SelectComplianceModal';
import { UploadComplianceEvidenceModal } from '@/components/claims/UploadComplianceEvidenceModal';
import { SelectComplianceForReviewModal } from '@/components/claims/SelectComplianceForReviewModal';
import { ReviewComplianceModal } from '@/components/claims/ReviewComplianceModal';
import Navbar from '@/components/navbar/Navbar';
import { ROLES } from '@/constants/roles';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Pagination from '@/components/common/Pagination';
import Toast from '@/components/ui/Toast';

function AdminClaimsContent() {
  const searchParams = useSearchParams();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showObservationsModal, setShowObservationsModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showSelectComplianceModal, setShowSelectComplianceModal] = useState(false);
  const [showUploadEvidenceModal, setShowUploadEvidenceModal] = useState(false);
  const [showSelectForReviewModal, setShowSelectForReviewModal] = useState(false);
  const [showReviewComplianceModal, setShowReviewComplianceModal] = useState(false);
  const [selectedCompliance, setSelectedCompliance] = useState(null);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [selectedClaimant, setSelectedClaimant] = useState(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, type: '', message: '' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    totalItems: 0,
  });

  // Leer claimId de la URL
  const claimIdFromUrl = searchParams.get('claimId') || '';

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: null,
    claimantRole: null,
    claimId: claimIdFromUrl,
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getClaims(filters);
        
        // El backend devuelve { claims: [...], pagination: {...} }
        setClaims(data.claims || []);
        
        if (data.pagination) {
          setPagination({
            currentPage: data.pagination.currentPage || 1,
            totalPages: data.pagination.totalPages || 0,
            hasNextPage: data.pagination.hasNextPage || false,
            hasPreviousPage: data.pagination.hasPreviousPage || false,
            totalItems: data.pagination.totalItems || 0,
          });
        }
      } catch (err) {
        console.error('Error fetching claims:', err);
        setError(err.message || 'Error al cargar los reclamos');
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      status: null,
      claimantRole: null,
      claimId: '',
      page: 1,
      limit: 12,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetail = (claim) => {
    setSelectedClaim(claim);
    setShowDetailModal(true);
  };

  const handleOpenActions = (claim) => {
    setSelectedClaim(claim);
    setShowActionsModal(true);
  };

  const showToast = (type, message) => {
    setToast({ isVisible: true, type, message });
  };

  const getSelectedClaimId = (value) => value?.claim?.id || value?.id;

  const handleClaimAction = async (actionId, claim) => {
    setSelectedClaim(claim);
    
    switch (actionId) {
      case 'view_detail':
        setShowDetailModal(true);
        break;
      case 'mark_in_review':
        try {
          const claimId = getSelectedClaimId(claim);
          await markAsInReview(claimId);
          // Recargar reclamos
          const data = await getClaims(filters);
          setClaims(data.claims || []);
          if (data.pagination) {
            setPagination({
              currentPage: data.pagination.currentPage || 1,
              totalPages: data.pagination.totalPages || 0,
              hasNextPage: data.pagination.hasNextPage || false,
              hasPreviousPage: data.pagination.hasPreviousPage || false,
              totalItems: data.pagination.totalItems || 0,
            });
          }
        } catch (err) {
          console.error('Error marking claim in review:', err);
          showToast('error', err.message || 'Error al marcar como en revisión');
        }
        break;
      case 'add_observations':
        setShowObservationsModal(true);
        break;
      case 'submit_compliance_evidence':
        setShowSelectComplianceModal(true);
        break;
      case 'review_compliance':
        setShowSelectForReviewModal(true);
        break;
      case 'resolve_claim':
        setShowResolutionModal(true);
        break;
      case 'reject_claim':
        setShowRejectionModal(true);
        break;
      default:
        break;
    }
  };

  const handleObservationsSuccess = async () => {
    setShowObservationsModal(false);
    // Recargar reclamos
    try {
      const data = await getClaims(filters);
      setClaims(data.claims || []);
      if (data.pagination) {
        setPagination({
          currentPage: data.pagination.currentPage || 1,
          totalPages: data.pagination.totalPages || 0,
          hasNextPage: data.pagination.hasNextPage || false,
          hasPreviousPage: data.pagination.hasPreviousPage || false,
          totalItems: data.pagination.totalItems || 0,
        });
      }
    } catch (err) {
      console.error('Error reloading claims:', err);
    }
  };

  const handleResolutionSuccess = async () => {
    setShowResolutionModal(false);
    try {
      const data = await getClaims(filters);
      setClaims(data.claims || []);
      if (data.pagination) {
        setPagination({
          currentPage: data.pagination.currentPage || 1,
          totalPages: data.pagination.totalPages || 0,
          hasNextPage: data.pagination.hasNextPage || false,
          hasPreviousPage: data.pagination.hasPreviousPage || false,
          totalItems: data.pagination.totalItems || 0,
        });
      }
    } catch (err) {
      console.error('Error reloading claims after resolution:', err);
    }
  };

  const handleSelectComplianceForReview = (compliance, claimant, otherUser) => {
    setSelectedCompliance(compliance);
    setSelectedClaimant(claimant);
    setSelectedOtherUser(otherUser);
    setShowSelectForReviewModal(false);
    setShowReviewComplianceModal(true);
  };

  const handleReviewSuccess = async (message) => {
    setShowReviewComplianceModal(false);
    setSelectedCompliance(null);
    setSelectedClaimant(null);
    setSelectedOtherUser(null);
    
    showToast('success', message);
    
    // Recargar reclamos
    try {
      const data = await getClaims(filters);
      setClaims(data.claims || []);
      if (data.pagination) {
        setPagination({
          currentPage: data.pagination.currentPage || 1,
          totalPages: data.pagination.totalPages || 0,
          hasNextPage: data.pagination.hasNextPage || false,
          hasPreviousPage: data.pagination.hasPreviousPage || false,
          totalItems: data.pagination.totalItems || 0,
        });
      }
    } catch (err) {
      console.error('Error reloading claims:', err);
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-[#eaf5f2] min-h-screen p-8 space-y-6 max-w-7xl mx-auto pb-24">
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-conexia-green text-center">
            Gestión de Reclamos
          </h1>
        </div>

        <ClaimsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Loader2 size={48} className="animate-spin text-conexia-green mx-auto mb-4" />
            <p className="text-gray-600">Cargando reclamos...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error al cargar</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {claims.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <AlertTriangle size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay reclamos
                </h3>
                <p className="text-gray-600">
                  {filters.status || filters.claimantRole || filters.searchTerm
                    ? 'No se encontraron reclamos con los filtros aplicados'
                    : 'Aún no se han creado reclamos en la plataforma'}
                </p>
              </div>
            ) : (
              <>
                <AdminClaimsTable
                  claims={claims}
                  onViewDetail={handleViewDetail}
                  onOpenActions={handleOpenActions}
                />

                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPreviousPage={pagination.hasPreviousPage}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </>
        )}
      </main>

      {showDetailModal && selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => setShowDetailModal(false)}
          showToast={showToast}
        />
      )}

      {showActionsModal && selectedClaim && (
        <ClaimActionsModal
          claim={selectedClaim}
          onClose={() => setShowActionsModal(false)}
          onAction={handleClaimAction}
        />
      )}

      {showObservationsModal && selectedClaim && (
        <AddObservationsModal
          isOpen={showObservationsModal}
          claim={selectedClaim}
          onClose={() => setShowObservationsModal(false)}
          onSuccess={handleObservationsSuccess}
          showToast={showToast}
        />
      )}

      {showResolutionModal && selectedClaim && (
        <ClaimResolutionModal
          isOpen={showResolutionModal}
          claim={selectedClaim}
          onClose={() => setShowResolutionModal(false)}
          onSuccess={handleResolutionSuccess}
          showToast={showToast}
        />
      )}

      {showRejectionModal && selectedClaim && (
        <ClaimRejectionModal
          isOpen={showRejectionModal}
          claim={selectedClaim}
          onClose={() => setShowRejectionModal(false)}
          onSuccess={handleResolutionSuccess}
          showToast={showToast}
        />
      )}

      {showSelectComplianceModal && selectedClaim && (
        <SelectComplianceModal
          claim={selectedClaim}
          currentUserId={null}
          onClose={() => setShowSelectComplianceModal(false)}
          onSelectCompliance={(compliance, claimant, otherUser) => {
            setSelectedCompliance(compliance);
            setSelectedClaimant(claimant);
            setSelectedOtherUser(otherUser);
            setShowUploadEvidenceModal(true);
          }}
        />
      )}

      {showUploadEvidenceModal && selectedCompliance && (
        <UploadComplianceEvidenceModal
          compliance={selectedCompliance}
          onClose={() => {
            setShowUploadEvidenceModal(false);
            setSelectedCompliance(null);
          }}
          onSubmit={async (evidenceData) => {
            try {
              setIsSubmittingEvidence(true);
              const { submitComplianceEvidence } = await import('@/service/claims');
              
              await submitComplianceEvidence(evidenceData.complianceId, {
                userResponse: evidenceData.userResponse,
                files: evidenceData.files
              });
              
              setShowUploadEvidenceModal(false);
              setSelectedCompliance(null);
              showToast('success', 'Evidencia enviada correctamente. Tu evidencia será revisada pronto.');
              
              // Recargar claims
              const data = await getClaims(filters);
              setClaims(data.claims || []);
              if (data.pagination) {
                setPagination({
                  currentPage: data.pagination.currentPage || 1,
                  totalPages: data.pagination.totalPages || 0,
                  hasNextPage: data.pagination.hasNextPage || false,
                  hasPreviousPage: data.pagination.hasPreviousPage || false,
                  totalItems: data.pagination.totalItems || 0,
                });
              }
            } catch (err) {
              console.error('Error submitting compliance evidence:', err);
              showToast('error', err.message || 'Error al enviar la evidencia. Por favor, intenta nuevamente.');
            } finally {
              setIsSubmittingEvidence(false);
            }
          }}
          isSubmitting={isSubmittingEvidence}
          claimant={selectedClaimant}
          otherUser={selectedOtherUser}
          currentUserId={null}
        />
      )}

      {/* Modal de selección para revisión de compromiso (moderador) */}
      {showSelectForReviewModal && selectedClaim && (
        <SelectComplianceForReviewModal
          claimId={getSelectedClaimId(selectedClaim)}
          onClose={() => setShowSelectForReviewModal(false)}
          onSelectCompliance={handleSelectComplianceForReview}
          currentUserId={null}
          actionType="review_compliance"
        />
      )}

      {/* Modal de revisión de compromiso (moderador) */}
      {showReviewComplianceModal && selectedCompliance && (
        <ReviewComplianceModal
          compliance={selectedCompliance}
          claimant={selectedClaimant}
          otherUser={selectedOtherUser}
          onClose={() => {
            setShowReviewComplianceModal(false);
            setSelectedCompliance(null);
            setSelectedClaimant(null);
            setSelectedOtherUser(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}

      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
        position="top-center"
      />
    </>
  );
}

export default function AdminClaimsPage() {
  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]}>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 size={48} className="animate-spin text-conexia-green" />
            </div>
          </div>
        </div>
      }>
        <AdminClaimsContent />
      </Suspense>
    </ProtectedRoute>
  );
}

