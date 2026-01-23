/**
 * Admin Claims Panel
 * Panel de administración de reclamos para moderadores
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { getClaims, markAsInReview } from '@/service/claims';
import { ClaimsFilters } from '@/components/claims/ClaimsFilters';
import { AdminClaimsTable } from '@/components/claims/AdminClaimsTable';
import { ClaimDetailModal } from '@/components/claims/ClaimDetailModal';
import { ClaimActionsModal } from '@/components/claims/ClaimActionsModal';
import { AddObservationsModal } from '@/components/claims/AddObservationsModal';
import { ClaimResolutionModal } from '@/components/claims/ClaimResolutionModal';
import Navbar from '@/components/navbar/Navbar';
import { ROLES } from '@/constants/roles';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Pagination from '@/components/common/Pagination';
import Toast from '@/components/ui/Toast';

function AdminClaimsContent() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showObservationsModal, setShowObservationsModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, type: '', message: '' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    totalItems: 0,
  });

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: null,
    claimantRole: null,
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
      case 'resolve_claim':
        setShowResolutionModal(true);
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
      <AdminClaimsContent />
    </ProtectedRoute>
  );
}

