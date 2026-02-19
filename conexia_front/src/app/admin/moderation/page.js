"use client";

import { useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import { useRouter } from "next/navigation";
import { Shield, RefreshCw, Sparkles } from "lucide-react";
import { useModerationAnalysis } from "@/hooks/moderation/useModerationAnalysis";
import { useModerationActions } from "@/hooks/moderation/useModerationActions";
import ModerationTable from "@/components/moderator/ModerationTable";
import AnalysisFilters from "@/components/moderator/AnalysisFilters";
import AnalysisDetailsModal from "@/components/moderator/AnalysisDetailsModal";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { useUserStore } from "@/store/userStore";
import { ROLES } from "@/constants/roles";

export default function ModerationPage() {
  // Verificar permisos usando el store global
  const { roleName } = useUserStore();
  const canModerate = roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR;

  const router = useRouter();

  // Estado del modal
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  // Estado del toast
  const [toast, setToast] = useState({
    isVisible: false,
    type: "info",
    message: "",
  });

  // Hooks personalizados
  const { results, meta, loading, filters, updateFilters, refresh } =
    useModerationAnalysis();
  const { analyzing, resolving, executeAnalysis, executeResolve } =
    useModerationActions();

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
      showToast(
        "success",
        `Análisis completado: ${result?.data?.analyzed ?? 0} usuarios analizados`,
      );
      refresh(); // Recargar resultados
    } catch (error) {
      showToast("error", error.message || "Error al analizar reportes");
    }
  };

  // Manejar resolución de análisis
  const handleResolve = async (action, notes, suspensionDays = null) => {
    if (!selectedAnalysis) return;

    try {
      await executeResolve(selectedAnalysis.id, action, notes, suspensionDays);

      // Mensaje personalizado según la acción
      let successMessage = "Análisis resuelto correctamente";
      if (action === "ban_user") {
        successMessage = "Usuario baneado permanentemente";
      } else if (action === "suspend_user") {
        successMessage = `Usuario suspendido por ${suspensionDays} días`;
      } else if (action === "release_user") {
        successMessage = "Usuario liberado - sin acciones tomadas";
      } else if (action === "keep_monitoring") {
        successMessage = "Usuario marcado para seguir monitoreando";
      }

      showToast("success", successMessage);
      setSelectedAnalysis(null); // Cerrar modal
      refresh(); // Recargar resultados
    } catch (error) {
      showToast("error", error.message || "Error al resolver análisis");
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
    <>
      <Navbar />
      <main className="bg-[#eaf5f2] min-h-screen p-8 space-y-6 max-w-7xl mx-auto pb-24">
        {/* Header card */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm relative">
          {/* Desktop header */}
          <div className="hidden sm:block">
            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
              <div className="flex items-center justify-start">
                <button
                  onClick={() => router.push("/reports")}
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
              </div>

              <h1 className="text-2xl font-bold text-conexia-green text-center whitespace-nowrap">
                Panel de moderación con IA
              </h1>

              <div className="flex items-center justify-end">
                <div className="flex flex-col gap-2 w-[220px]">
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing || loading}
                    variant="add"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#48a6a7] to-[#419596] text-white rounded-lg font-semibold text-sm hover:from-[#419596] hover:to-[#367d7d] transition-all shadow-md hover:shadow-lg transform hover:scale-[1.01] border border-[#48a6a7]/30"
                  >
                    {analyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Analizando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analizar reportes</span>
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={refresh}
                    disabled={loading || analyzing}
                    variant="informative"
                    className="w-full inline-flex items-center justify-center gap-2"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                    <span>Refrescar</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile header */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/reports")}
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

              <div className="w-10" />
            </div>

            <div className="mt-2 text-center">
              <h1 className="text-2xl font-bold text-conexia-green text-center">
                Panel de moderación con IA
              </h1>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || loading}
                variant="add"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#48a6a7] to-[#419596] text-white rounded-lg font-semibold text-sm hover:from-[#419596] hover:to-[#367d7d] transition-all shadow-md hover:shadow-lg transform hover:scale-[1.01] border border-[#48a6a7]/30"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analizar reportes</span>
                  </>
                )}
              </Button>

              <Button
                onClick={refresh}
                disabled={loading || analyzing}
                variant="informative"
                className="w-full inline-flex items-center justify-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refrescar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <AnalysisFilters filters={filters} onFilterChange={updateFilters} />

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
      </main>

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
    </>
  );
}
