/**
 * Moderator Compliances Dashboard Page
 * Dashboard para moderadores revisar compliances
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useCompliances } from '@/hooks/compliances';
import { getCompliancesForModeratorReview } from '@/service/compliances';
import { ComplianceCard } from '@/components/compliances/ComplianceCard';
import { CompliancesFilters } from '@/components/compliances/CompliancesFilters';
import { ModeratorReviewModal } from '@/components/compliances/ModeratorReviewModal';
import { PAGINATION } from '@/constants/compliances';

export default function ModeratorCompliancesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState({
    status: 'submitted,peer_approved,peer_objected,in_review',
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
  });
  const [selectedCompliance, setSelectedCompliance] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, peerApproved: 0, peerObjected: 0, inReview: 0 });

  const {
    compliances,
    loading,
    error,
    pagination,
    refetch,
    setPage,
  } = useCompliances(filters, true);

  useEffect(() => {
    refetch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    // Calcular stats de los compliances cargados
    if (compliances && compliances.length > 0) {
      const newStats = {
        total: compliances.length,
        peerApproved: compliances.filter(c => c.status === 'peer_approved').length,
        peerObjected: compliances.filter(c => c.status === 'peer_objected').length,
        inReview: compliances.filter(c => c.status === 'in_review').length,
      };
      setStats(newStats);
    }
  }, [compliances]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handleComplianceClick = (compliance) => {
    setSelectedCompliance(compliance);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setSelectedCompliance(null);
    refetch(filters);
  };

  // Verificar permisos de moderador
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'moderator')) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  if (authLoading || !user || user.role !== 'moderator') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Shield size={32} className="text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Revisar Cumplimientos
            </h1>
          </div>
          <p className="text-gray-600">
            Revisa y aprueba los cumplimientos enviados por los usuarios
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Pendientes</p>
                <p className="text-3xl font-bold text-purple-600">{pagination.total || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Eye size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pre-aprobados</p>
                <p className="text-3xl font-bold text-teal-600">{stats.peerApproved}</p>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <CheckCircle size={24} className="text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Objetados</p>
                <p className="text-3xl font-bold text-orange-600">{stats.peerObjected}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <XCircle size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En revisión</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inReview}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Eye size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <CompliancesFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          showOverdueFilter={false}
          className="mb-6"
        />

        {/* Compliances Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            Error al cargar cumplimientos: {error}
          </div>
        ) : compliances && compliances.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {compliances.map((compliance) => (
                <ComplianceCard
                  key={compliance.id}
                  compliance={compliance}
                  onClick={() => handleComplianceClick(compliance)}
                  showActions={false}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Anterior
                </button>

                <span className="px-4 py-2 text-gray-700 font-medium">
                  Página {pagination.page} de {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600">No hay cumplimientos pendientes de revisión</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedCompliance && (
        <ModeratorReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedCompliance(null);
          }}
          compliance={selectedCompliance}
          moderatorId={user.id}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
