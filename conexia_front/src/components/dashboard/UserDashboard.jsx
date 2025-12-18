'use client';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useServiceMetrics } from '@/hooks/dashboard/useServiceMetrics';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useExportDashboard } from '@/hooks/dashboard/useExportDashboard';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSkeleton } from './LoadingStates';
import { ErrorState } from './ErrorStates';
import { ServiceMetricsSection, UpgradeBanner } from './ServiceMetricsSection';
import { ProjectMetricsSection } from './ProjectMetricsSection';
import { useState } from 'react';

/**
 * Dashboard principal para usuarios regulares
 * Dividido en secciones: Servicios y Proyectos
 */
export const UserDashboard = () => {
  const { data: serviceData, isLoading: servicesLoading, error: servicesError, refetch: refetchServices } = useServiceMetrics();
  const { data: projectData, isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useDashboardData();
  const { exportAllMetrics } = useExportDashboard();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Manejar exportación combinada
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportAllMetrics(projectData, serviceData);
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading = servicesLoading || projectsLoading;
  const error = servicesError || projectsError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Dashboard"
          subtitle="Resumen de tu actividad en Conexia"
          timestamp={new Date().toISOString()}
        />
        <DashboardSkeleton cards={3} />
        <div className="border-t-2 border-gray-200"></div>
        <DashboardSkeleton cards={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Dashboard"
          subtitle="Resumen de tu actividad en Conexia"
          timestamp={new Date().toISOString()}
        />
        <ErrorState 
          message={error} 
          onRetry={() => {
            refetchServices();
            refetchProjects();
          }} 
        />
      </div>
    );
  }

  // Extraer datos de proyectos y postulaciones
  const projectsData = projectData?.projects || {};
  const postulationsData = projectData?.postulations || {};

  return (
    <div className="space-y-8">
      {/* Header con botón de exportar */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <DashboardHeader
            title="Dashboard"
            subtitle="Resumen completo de servicios y proyectos"
            timestamp={new Date().toISOString()}
          />
        </div>
        
        <div 
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            disabled={isExporting}
            className="
              flex items-center gap-2 px-5 py-3
              bg-gradient-to-r from-[#48a6a7] to-[#419596]
              hover:from-[#419596] hover:to-[#3a8586]
              text-white font-semibold rounded-xl
              transition-all duration-300
              shadow-lg hover:shadow-xl
              border-2 border-white/20
              disabled:opacity-50 disabled:cursor-not-allowed
              lg:self-start
            "
            aria-label="Exportar todas las métricas a CSV"
          >
            <Download className="w-5 h-5" />
            <span>{isExporting ? 'Exportando...' : 'Exportar métricas'}</span>
          </motion.button>

          {/* Tooltip */}
          {showTooltip && !isExporting && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="
                absolute -bottom-14 right-0
                px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg
                whitespace-nowrap pointer-events-none
                shadow-xl z-50
              "
            >
              Exportar servicios y proyectos
              <div className="absolute -top-1 right-6 w-2 h-2 bg-gray-900 rotate-45" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Banner de Upgrade - Para usuarios Free o Basic */}
      {serviceData?.userPlan && serviceData.userPlan !== 'Premium' && (
        <UpgradeBanner currentPlan={serviceData.userPlan} />
      )}

      {/* Sección de Métricas de Servicios */}
      <ServiceMetricsSection />

      {/* Separador visual */}
      <div className="border-t-2 border-gray-200"></div>

      {/* Sección de Métricas de Proyectos */}
      <ProjectMetricsSection 
        projectsData={projectsData}
        postulationsData={postulationsData}
      />
    </div>
  );
};
