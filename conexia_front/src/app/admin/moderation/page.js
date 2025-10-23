'use client';

import { useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Shield, RefreshCw, Sparkles } from 'lucide-react';
import { useModerationAnalysis } from '@/hooks/moderation/useModerationAnalysis';
import { useModerationActions } from '@/hooks/moderation/useModerationActions';
import ModerationTable from '@/components/moderator/ModerationTable';
import AnalysisFilters from '@/components/moderator/AnalysisFilters';
import AnalysisDetailsModal from '@/components/moderator/AnalysisDetailsModal';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';

export default function ModerationPage() {
  // Verificar permisos usando el store global
  const { roleName } = useUserStore();
  const canModerate = roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR;

    const router = useRouter();

  // Estado del modal
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  
  // Estado del toast
  const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });

  // Hooks personalizados
  const { results, meta, loading, filters, updateFilters, refresh } = useModerationAnalysis();
  const { analyzing, resolving, executeAnalysis, executeResolve } = useModerationActions();

  // Función para mostrar toast
  const showToast = (type, message) => {
    setToast({ isVisible: true, type, message });
  };

  // Cerrar toast
  const closeToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  // Manejar análisis de reportes
  const handleAnalyze = async () => {
    try {
      const result = await executeAnalysis();
  showToast('success', `Análisis completado: ${result?.data?.analyzed ?? 0} usuarios analizados`);
      refresh(); // Recargar resultados
    } catch (error) {
      showToast('error', error.message || 'Error al analizar reportes');
    }
  };

  // Manejar resolución de análisis
  const handleResolve = async (action, notes) => {
    if (!selectedAnalysis) return;

    try {
      await executeResolve(selectedAnalysis.id, action, notes);
      showToast('success', 'Análisis resuelto correctamente');
      setSelectedAnalysis(null); // Cerrar modal
      refresh(); // Recargar resultados
    } catch (error) {
      showToast('error', error.message || 'Error al resolver análisis');
    }
  };

  // Ver detalles de un análisis
  const handleViewDetails = (analysis) => {
    setSelectedAnalysis(analysis);
  };

  // Cerrar modal de detalles
  const handleCloseModal = () => {
    if (!resolving) {
      setSelectedAnalysis(null);
    }
  };

  // Si no tiene permisos, mostrar mensaje
  if (!canModerate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            No tienes permisos para acceder al panel de moderación.
          </p>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Botón Volver */}
          <div className="mb-6">
            <Button
              variant="back"
              className="flex items-center gap-2 px-3 py-2 font-medium"
              onClick={() => router.push('/reports')}
            >
              <ChevronLeft className="w-5 h-5" />
              Volver a Reportes
            </Button>
          </div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-conexia-green" />
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Moderación con IA
            </h1>
          </div>
          <p className="text-gray-600">
            Analiza reportes de usuarios y toma acciones basadas en inteligencia artificial
          </p>
        </div>

        {/* Botones de acción principales */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || loading}
            variant="primary"
            className="flex items-center justify-center gap-2 px-6 py-3"
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analizar Reportes</span>
              </>
            )}
          </Button>

          <Button
            onClick={refresh}
            disabled={loading || analyzing}
            variant="informative"
            className="flex items-center justify-center gap-2 px-6 py-3"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </Button>
        </div>

        {/* Filtros */}
        <AnalysisFilters filters={filters} onFilterChange={updateFilters} />

        {/* Información de resultados */}
        {meta.total > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Mostrando {results.length} de {meta.total} resultados
          </div>
        )}

        {/* Tabla de resultados */}
        <ModerationTable
          results={Array.isArray(results) ? results : []}
          onViewDetails={handleViewDetails}
          loading={loading}
        />

        {/* Paginación */}
        {meta.totalPages > 1 && (
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            hasNextPage={meta.page < meta.totalPages}
            hasPreviousPage={meta.page > 1}
            onPageChange={(newPage) => updateFilters({ page: newPage })}
          />
        )}

        {/* Modal de detalles */}
        {selectedAnalysis && (
          <AnalysisDetailsModal
            analysis={selectedAnalysis}
            onClose={handleCloseModal}
            onResolve={handleResolve}
            loading={resolving}
          />
        )}

        {/* Toast de notificaciones */}
        {toast.isVisible && (
          <Toast
            type={toast.type}
            message={toast.message}
            isVisible={toast.isVisible}
            onClose={closeToast}
            duration={5000}
            position="top-center"
          />
        )}
      </div>
    </div>
  );
}
