'use client';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useServiceMetrics } from '@/hooks/dashboard/useServiceMetrics';
import { useExportDashboard } from '@/hooks/dashboard/useExportDashboard';
import { ServiceMetricsSection, UpgradeBanner } from './ServiceMetricsSection';
import { ProjectMetricsSection } from './ProjectMetricsSection';
import { InsightsSection } from './InsightsSection';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSkeleton } from './LoadingStates';
import { ErrorState, EmptyState } from './ErrorStates';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Dashboard principal para usuarios regulares
 * Dividido en secciones: Servicios y Proyectos
 */
export const UserDashboard = () => {
  const { data: projectData, isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useDashboardData();
  const { data: serviceData } = useServiceMetrics();
  const { exportAllMetrics } = useExportDashboard();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  // Manejar exportación
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportAllMetrics(projectData, serviceData);
    } catch (error) {
      console.error('Error al exportar métricas:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (projectsLoading) {
    return <DashboardSkeleton cards={4} />;
  }

  if (projectsError) {
    return <ErrorState message={projectsError} onRetry={refetchProjects} />;
  }

  if (!projectData) {
    return (
      <EmptyState
        message="Aún no tienes actividad registrada. Comienza a explorar proyectos y servicios."
        actionLabel="Explorar proyectos"
        onAction={() => router.push('/projects')}
      />
    );
  }

  const {
    services = {},
    projects = {},
    postulations = {},
  } = projectData;

  const hasAnyActivity = 
    (services.totalServicesHired || 0) > 0 ||
    (projects.totalProjectsEstablished || 0) > 0 ||
    (postulations.totalPostulations || 0) > 0 ||
    (serviceData?.totalServicesPublished || 0) > 0;

  if (!hasAnyActivity) {
    return (
      <>
        <DashboardHeader
          title="Métricas"
          subtitle="Resumen de tu actividad en Conexia"
          timestamp={new Date().toISOString()}
        />
        <EmptyState
          message="Comienza a postularte a proyectos o publica tus servicios para ver tus métricas."
          actionLabel="Explorar proyectos"
          onAction={() => router.push('/projects')}
        />
      </>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <DashboardHeader
            title="Métricas"
            subtitle="Resumen de tu actividad en Conexia"
            timestamp={new Date().toISOString()}
          />
        </div>
        
        <div className="flex gap-3">
          <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
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
                lg:self-start
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              aria-label="Exportar todas las métricas a CSV"
            >
              <Download className="w-5 h-5" />
              <span>{isExporting ? 'Exportando...' : 'Exportar datos'}</span>
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
                Exportar todas las métricas a CSV
                <div className="absolute -top-1 right-6 w-2 h-2 bg-gray-900 rotate-45" />
              </motion.div>
            )}
          </div>
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
        projectsData={projects}
        postulationsData={postulations}
      />

      {/* Insights Section - Usa datos combinados */}
      {(postulations.successRate > 0 || services.totalServicesHired > 0) && (
        <>
          <div className="border-t-2 border-gray-200"></div>
          <InsightsSection
            successRate={postulations.successRate || 0}
            totalServicesHired={serviceData?.totalServicesHired || services.totalServicesHired || 0}
            totalRevenueGenerated={serviceData?.totalRevenueGenerated || services.totalRevenueGenerated || 0}
            totalProjectsEstablished={projects.totalProjectsEstablished || 0}
          />
        </>
      )}
    </div>
  );
};
