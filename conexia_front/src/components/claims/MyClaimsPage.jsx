/**
 * MyClaimsPage Component
 * Página principal de reclamos del usuario (como reclamante o reclamado)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMyClaims } from '@/hooks/claims';
import { useAuth } from '@/context/AuthContext';
import { FaEllipsisH, FaRegEye } from 'react-icons/fa';
import { Filter, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import Pagination from '@/components/common/Pagination';
import Toast from '@/components/ui/Toast';
import { ClaimDetailModal } from './ClaimDetailModal';
import { SubmitObservationsModal } from './SubmitObservationsModal';
import { SubmitComplianceModal } from './SubmitComplianceModal';
import { SubsanarClaimModal } from './SubsanarClaimModal';
import { ClaimActionsModal } from './ClaimActionsModal';
import { ClaimTypeBadge } from './ClaimTypeBadge';
import { ClaimRoleBadge } from './ClaimRoleBadge';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { formatClaimDate } from '@/constants/claims';
import { config } from '@/config';

export default function MyClaimsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { claims, pagination, loading, error, updateFilters, setPage } = useMyClaims();

  const [filters, setFilters] = useState({
    status: '',
    role: 'all',
  });
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showObservationsModal, setShowObservationsModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showSubsanarModal, setShowSubsanarModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [toast, setToast] = useState(null);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateFilters({ ...newFilters, page: 1 });
  };

  const handleViewDetail = (claim) => {
    setSelectedClaim(claim);
    setShowDetailModal(true);
  };

  const handleOpenActions = (claim) => {
    setSelectedClaim(claim);
    setShowActionsModal(true);
  };

  const handleAction = (actionId, claim) => {
    setSelectedClaim(claim);
    
    switch (actionId) {
      case 'view_detail':
        setShowDetailModal(true);
        break;
      case 'submit_observations':
        setShowObservationsModal(true);
        break;
      case 'upload_compliance':
        setShowComplianceModal(true);
        break;
      case 'subsanar_claim':
        setShowSubsanarModal(true);
        break;
      default:
        break;
    }
  };

  const handleActionSuccess = (message) => {
    setToast({
      type: 'success',
      message,
    });
    updateFilters(filters);
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  return (
    <>
      <Navbar />
      <main className="bg-[#eaf5f2] min-h-screen p-4 sm:p-8 space-y-6 pb-24">
        {/* Header con título centrado y botón atrás */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Volver atrás"
            >
              <div className="relative w-6 h-6">
                <svg
                  className="w-6 h-6 text-conexia-green"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="8.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <line
                    x1="6.5"
                    y1="10"
                    x2="13.5"
                    y2="10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="9,7 6,10 9,13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
            <h1 className="text-2xl font-bold text-conexia-green flex-1 text-center mr-8">
              Mis Reclamos
            </h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <span className="font-medium text-gray-700">Filtros:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green"
              >
                <option value="">Todos los estados</option>
                <option value="open">Abierto</option>
                <option value="in_review">En Revisión</option>
                <option value="pending_clarification">Requiere aclaración</option>
                <option value="requires_staff_response">Requiere respuesta</option>
                <option value="resolved">Resuelto</option>
                <option value="rejected">Rechazado</option>
                <option value="cancelled">Cancelado</option>
              </select>

              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green"
              >
                <option value="all">Todos los roles</option>
                <option value="claimant">Como Reclamante</option>
                <option value="respondent">Como Reclamado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-conexia-green mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando reclamos...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertTriangle size={48} className="mx-auto text-red-500 mb-3" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error al cargar</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => updateFilters(filters)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Tabla de Reclamos */}
        {!loading && !error && (
          <>
            {claims.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <AlertTriangle size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay reclamos
                </h3>
                <p className="text-gray-600">
                  {filters.status || filters.role !== 'all'
                    ? 'No se encontraron reclamos con los filtros aplicados'
                    : 'Aún no tienes reclamos registrados'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mi Rol
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contra
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {claims.map((claim) => (
                          <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{claim.folio || claim.id.substring(0, 8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <ClaimTypeBadge claimType={claim.claimType} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <ClaimRoleBadge role={claim.userRole} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {claim.otherUser?.profilePicture && (
                                  <img
                                    src={`${config.IMAGE_URL}/${claim.otherUser.profilePicture}`}
                                    alt={claim.otherUser.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                )}
                                <span className="text-sm text-gray-900">{claim.otherUser?.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <ClaimStatusBadge status={claim.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatClaimDate(claim.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center">
                                <div className="flex items-center bg-gray-50 rounded-lg p-1 shadow-sm border">
                                  {/* Botón para ver detalle */}
                                  <button
                                    onClick={() => handleViewDetail(claim)}
                                    className="flex items-center justify-center w-9 h-9 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                                    title="Ver detalle"
                                    aria-label="Ver detalle"
                                  >
                                    <FaRegEye className="text-[16px] group-hover:scale-110 transition-transform" />
                                  </button>
                                  
                                  {/* Botón para más acciones */}
                                  <button
                                    onClick={() => handleOpenActions(claim)}
                                    className="flex items-center justify-center w-9 h-9 text-orange-600 hover:text-white hover:bg-orange-600 rounded-md transition-all duration-200 group"
                                    title="Más acciones"
                                    aria-label="Más acciones"
                                  >
                                    <FaEllipsisH className="text-[18px] group-hover:scale-110 transition-transform" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {claims.map((claim) => (
                    <div key={claim.id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-900">#{claim.folio || claim.id.substring(0, 8)}</p>
                          <ClaimTypeBadge claimType={claim.claimType} />
                        </div>
                        <ClaimStatusBadge status={claim.status} />
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-600">Mi Rol</p>
                          <ClaimRoleBadge role={claim.userRole} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Contra</p>
                          <p className="text-sm font-medium text-gray-900">{claim.otherUser?.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Fecha</p>
                          <p className="text-sm text-gray-900">{formatClaimDate(claim.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {formatClaimDate(claim.createdAt)}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                            <button
                              onClick={() => handleViewDetail(claim)}
                              className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                              title="Ver detalle"
                              aria-label="Ver detalle"
                            >
                              <FaRegEye className="text-[15px] group-hover:scale-110 transition-transform" />
                            </button>
                            
                            <button
                              onClick={() => handleOpenActions(claim)}
                              className="flex items-center justify-center w-8 h-8 text-orange-600 hover:text-white hover:bg-orange-600 rounded-md transition-all duration-200 group"
                              title="Más acciones"
                              aria-label="Más acciones"
                            >
                              <FaEllipsisH className="text-[16px] group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                {pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    hasNextPage={pagination.hasNextPage}
                    hasPreviousPage={pagination.hasPreviousPage}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Modales */}
      {showDetailModal && selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showObservationsModal && selectedClaim && (
        <SubmitObservationsModal
          claim={selectedClaim}
          onClose={() => setShowObservationsModal(false)}
          onSuccess={handleActionSuccess}
        />
      )}

      {showComplianceModal && selectedClaim && (
        <SubmitComplianceModal
          claim={selectedClaim}
          onClose={() => setShowComplianceModal(false)}
          onSuccess={handleActionSuccess}
        />
      )}

      {showSubsanarModal && selectedClaim && (
        <SubsanarClaimModal
          isOpen={showSubsanarModal}
          claim={selectedClaim}
          onClose={() => setShowSubsanarModal(false)}
          onSuccess={() => updateFilters(filters)}
          showToast={(type, message) =>
            setToast({ type, message })
          }
        />
      )}

      {showActionsModal && selectedClaim && (
        <ClaimActionsModal
          claim={selectedClaim}
          onClose={() => setShowActionsModal(false)}
          onAction={handleAction}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={handleCloseToast}
        />
      )}
    </>
  );
}
