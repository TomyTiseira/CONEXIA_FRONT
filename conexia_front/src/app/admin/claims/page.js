/**
 * Admin Claims Panel
 * Panel de administración de reclamos para moderadores
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { getClaims } from '@/service/claims';
import { ClaimsListItem } from '@/components/claims/ClaimsListItem';
import { ClaimsFilters } from '@/components/claims/ClaimsFilters';
import { useUserStore } from '@/store/userStore';
import Navbar from '@/components/navbar/Navbar';
import { ROLES } from '@/constants/roles';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Pagination from '@/components/common/Pagination';

function AdminClaimsContent() {
  const router = useRouter();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
  });

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: null,
    claimantRole: null,
    page: 1,
    limit: 12, // 12 reclamos por página
  });

  // Cargar reclamos
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getClaims(filters);
        setClaims(data.claims || []);
        setPagination({
          total: data.total || 0,
          pages: data.pages || 0,
          currentPage: filters.page,
        });
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
      page: 1, // Reset a página 1 al cambiar filtro
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

  return (
    <>
      <Navbar />
      <main className="bg-[#eaf5f2] min-h-screen p-8 space-y-6 max-w-7xl mx-auto pb-24">
        {/* Header */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-conexia-green text-center">
            Gestión de Reclamos
          </h1>
        </div>

        {/* Filtros */}
        <ClaimsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Loader2 size={48} className="animate-spin text-conexia-green mx-auto mb-4" />
            <p className="text-gray-600">Cargando reclamos...</p>
          </div>
        )}

        {/* Error */}
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

        {/* Lista de reclamos */}
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
                {/* Grid de reclamos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {claims.map((claim) => (
                    <ClaimsListItem key={claim.id} claim={claim} />
                  ))}
                </div>

                {/* Paginación - siempre visible */}
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.pages}
                  hasNextPage={pagination.currentPage < pagination.pages}
                  hasPreviousPage={pagination.currentPage > 1}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </>
        )}
      </main>
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
