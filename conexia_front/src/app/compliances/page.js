/**
 * My Compliances Page
 * Página principal de cumplimientos del usuario
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FileText, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { useCompliances } from '@/hooks/compliances';
import { getUserComplianceStats } from '@/service/compliances';
import { CompliancesList } from '@/components/compliances/CompliancesList';
import { CompliancesFilters } from '@/components/compliances/CompliancesFilters';
import { PAGINATION } from '@/constants/compliances';

export default function CompliancesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState({
    userId: null,
    status: '',
    onlyOverdue: false,
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
  });
  const [stats, setStats] = useState(null);

  // Configurar userId cuando esté disponible
  useEffect(() => {
    // No cargar si está en proceso de logout
    if (typeof window !== 'undefined' && window.__CONEXIA_LOGGING_OUT__ === true) {
      return;
    }
    if (user?.id) {
      setFilters(prev => ({ ...prev, userId: user.id }));
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const {
    compliances,
    loading,
    error,
    pagination,
    refetch,
    setPage,
  } = useCompliances(filters.userId ? filters : {}, true);

  const fetchStats = async () => {
    if (!user?.id) return;
    try {
      const userStats = await getUserComplianceStats(user.id);
      setStats(userStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    if (filters.userId) {
      refetch(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handleComplianceUpdate = () => {
    refetch(filters);
    fetchStats();
  };

  // Redirect si no está autenticado
  useEffect(() => {
    // No redirigir si está en proceso de logout
    if (typeof window !== 'undefined' && window.__CONEXIA_LOGGING_OUT__ === true) {
      return;
    }
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mis cumplimientos
          </h1>
          <p className="text-gray-600">
            Gestiona los cumplimientos derivados de resoluciones de reclamos
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <FileText size={24} className="text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">En revisión</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.submitted || 0}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <TrendingUp size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Aprobados</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved || 0}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Vencidos</p>
                  <p className="text-3xl font-bold text-red-600">{stats.overdue || 0}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle size={24} className="text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <CompliancesFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          className="mb-6"
        />

        {/* Compliances List */}
        {error && error.includes('Cannot GET') ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sistema de cumplimientos en desarrollo
            </h3>
            <p className="text-gray-600 mb-4">
              El módulo de cumplimientos estará disponible próximamente.<br />
              Por el momento, el backend aún no está implementado.
            </p>
            <p className="text-sm text-gray-500">
              Este apartado te permitirá gestionar los cumplimientos derivados de resoluciones de reclamos.
            </p>
          </div>
        ) : (
          <CompliancesList
            compliances={compliances}
            loading={loading}
            error={error}
            pagination={pagination}
            onPageChange={handlePageChange}
            userId={user.id}
            showActions={true}
            onComplianceUpdate={handleComplianceUpdate}
          />
        )}
      </div>
    </div>
  );
}
