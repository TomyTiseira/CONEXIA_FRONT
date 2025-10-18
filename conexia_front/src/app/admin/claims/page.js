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
    status: null,
    claimantRole: null,
    page: 1,
    limit: 20,
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
      status: null,
      claimantRole: null,
      page: 1,
      limit: 20,
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle size={32} className="text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Reclamos</h1>
            </div>
            <p className="text-gray-600">
              Revisa y gestiona todos los reclamos de la plataforma
            </p>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <ClaimsFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Stats rápidas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                <p className="text-sm text-gray-600">Total de reclamos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {claims.filter((c) => c.status === 'open').length}
                </p>
                <p className="text-sm text-gray-600">Abiertos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {claims.filter((c) => c.status === 'in_review').length}
                </p>
                <p className="text-sm text-gray-600">En revisión</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {claims.filter((c) => c.status === 'resolved').length}
                </p>
                <p className="text-sm text-gray-600">Resueltos</p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Cargando reclamos...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
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
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <AlertTriangle size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No hay reclamos
                  </h3>
                  <p className="text-gray-600">
                    {filters.status || filters.claimantRole
                      ? 'No se encontraron reclamos con los filtros aplicados'
                      : 'Aún no se han creado reclamos en la plataforma'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {claims.map((claim) => (
                      <ClaimsListItem key={claim.id} claim={claim} />
                    ))}
                  </div>

                  {/* Paginación */}
                  {pagination.pages > 1 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Página {pagination.currentPage} de {pagination.pages} ({pagination.total}{' '}
                          reclamos totales)
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Anterior
                          </button>
                          <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.pages}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Siguiente
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
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
