'use client';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  DollarSign, 
  FolderCheck, 
  Award, 
  Download, 
  Grip,
  Users,
  Send,
  Inbox,
  TrendingUp
} from 'lucide-react';
import { useServiceMetrics } from '@/hooks/dashboard/useServiceMetrics';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useExportDashboard } from '@/hooks/dashboard/useExportDashboard';
import { useSwapyLayout } from '@/hooks/dashboard/useSwapyLayout';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSkeleton } from './LoadingStates';
import { ErrorState, EmptyState } from './ErrorStates';
import { ServiceMetricsSection, UpgradeBanner } from './ServiceMetricsSection';
import { DashboardSection } from './DashboardSection';
import { KPICard } from './KPICard';
import { StatusBreakdown } from './StatusBreakdown';
import { ProjectRankingCard } from './ProjectRankingCard';
import { PostulationsChart } from './PostulationsChart';
import { InsightsSection } from './InsightsSection';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Dashboard principal para usuarios regulares
 * Integra métricas de servicios y proyectos colaborativos
 */
export const UserDashboard = () => {
  const { data: serviceData, isLoading: servicesLoading, error: servicesError, refetch: refetchServices } = useServiceMetrics();
  const { data: projectData, isLoading, error, refetch } = useDashboardData();
  const { exportAllMetrics } = useExportDashboard();
  const { containerRef, isSwapyReady } = useSwapyLayout('conexia-user-dashboard-layout');
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  // Manejar exportación combinada
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportAllMetrics(projectData, serviceData);
    } finally {
      setIsExporting(false);
    }
  };

  const isLoadingAll = servicesLoading || isLoading;
  const hasError = servicesError || error;

  if (isLoadingAll) {
    return <DashboardSkeleton cards={4} />;
  }

  if (hasError) {
    return <ErrorState message={hasError} onRetry={() => { refetchServices(); refetch(); }} />;
  }

  if (!projectData) {
    return (
      <EmptyState
        message="Aún no tienes actividad registrada. Comienza a explorar proyectos y servicios."
        actionLabel="Publicar servicio"
        onAction={() => router.push('/services/create')}
        secondaryActionLabel="Explorar proyectos"
        secondaryAction={() => router.push('/project/search')}
      />
    );
  }

  const {
    services = {},
    projects = {},
    postulations = {},
    projectDashboard = {},
  } = projectData;

  // Validar actividad considerando AMBAS fuentes de datos
  const hasAnyActivity = 
    (serviceData?.totalServicesPublished || 0) > 0 ||  // Desde useServiceMetrics
    (serviceData?.totalServicesHired || 0) > 0 ||
    (services.totalServicesHired || 0) > 0 ||  // Desde useDashboardData
    (projects.totalProjectsEstablished || 0) > 0 ||
    (postulations.totalPostulations || 0) > 0;

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
          actionLabel="Publicar servicio"
          onAction={() => router.push('/services/create')}
          secondaryActionLabel="Explorar proyectos"
          secondaryAction={() => router.push('/project/search')}
        />
      </>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header con botón de exportar */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <DashboardHeader
            title="Métricas"
            subtitle="Resumen de tu actividad en Conexia"
            timestamp={new Date().toISOString()}
          />
        </div>
        
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
            disabled:opacity-50 disabled:cursor-not-allowed
            lg:self-start
          "
          aria-label="Exportar todas las métricas a CSV"
        >
          <Download className="w-5 h-5" />
          <span>{isExporting ? 'Exportando...' : 'Exportar datos'}</span>
        </motion.button>
      </div>

      {/* Banner de Upgrade - Para usuarios Free o Basic */}
      {serviceData?.userPlan && serviceData.userPlan !== 'Premium' && (
        <UpgradeBanner currentPlan={serviceData.userPlan} />
      )}

      {/* Sección: Resumen General */}
      <DashboardSection 
        title="Resumen general" 
        subtitle="Tus métricas principales"
        icon={Award}
        iconColor="blue"
      >
        {/* Badge de Plan */}
        <div className="flex justify-end mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            serviceData?.userPlan === 'Premium'
              ? 'bg-purple-100 text-purple-800'
              : serviceData?.userPlan === 'Basic'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            Plan {serviceData?.userPlan || 'Free'}
          </span>
        </div>
        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div data-swapy-slot="kpi-1" className="h-full">
            <div data-swapy-item="services">
              <KPICard
                title="Servicios completados"
                value={services.totalServicesHired || 0}
                icon={Briefcase}
                color="blue"
                subtitle="Finalizados exitosamente"
              />
            </div>
          </div>

          <div data-swapy-slot="kpi-2" className="h-full">
            <div data-swapy-item="revenue">
              <KPICard
                title="Ingresos generados"
                value={`$${(services.totalRevenueGenerated || 0).toLocaleString('es-AR')}`}
                icon={DollarSign}
                color="green"
                subtitle="ARS"
              />
            </div>
          </div>

          <div data-swapy-slot="kpi-3" className="h-full">
            <div data-swapy-item="projects">
              <KPICard
                title="Proyectos finalizados"
                value={projects.totalProjectsEstablished || 0}
                icon={FolderCheck}
                color="purple"
              />
            </div>
          </div>

          <div data-swapy-slot="kpi-4" className="h-full">
            <div data-swapy-item="success">
              <KPICard
                title="Tasa de éxito"
                value={`${(postulations.successRate || 0).toFixed(1)}%`}
                icon={Award}
                color="gold"
                subtitle={`${postulations.acceptedPostulations || 0} de ${postulations.totalPostulations || 0} postulaciones`}
                showProgressBar
                progressValue={postulations.successRate || 0}
              />
            </div>
          </div>
        </div>
      </DashboardSection>

      {/* Separador visual */}
      <div className="border-t-2 border-gray-200"></div>

      {/* Sección de Métricas de Servicios */}
      <DashboardSection
        title="Servicios"
        subtitle="Métricas de tus servicios ofrecidos"
        icon={Briefcase}
        iconColor="blue"
      >
        <ServiceMetricsSection />
      </DashboardSection>

      {/* Separador visual */}
      <div className="border-t-2 border-gray-200"></div>

      {/* Sección: Proyectos Colaborativos */}
      {projectDashboard && (projectDashboard.receivedPostulations || projectDashboard.sentPostulations) && (
        <DashboardSection 
          title="Proyectos colaborativos" 
          subtitle="Métricas de tus proyectos y postulaciones"
          icon={Users}
          iconColor="purple"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Postulaciones Recibidas */}
            {projectDashboard.receivedPostulations && (
              <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-lg bg-purple-50">
                    <Inbox className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Postulaciones recibidas</h3>
                    <p className="text-sm text-gray-500">En todos tus proyectos</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-purple-600 mb-4">
                  {projectDashboard.receivedPostulations.total}
                </div>
                <StatusBreakdown 
                  byStatus={projectDashboard.receivedPostulations.byStatus} 
                  compact={false}
                />
              </div>
            )}

            {/* Postulaciones Enviadas */}
            {projectDashboard.sentPostulations && (
              <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Send className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Postulaciones enviadas</h3>
                    <p className="text-sm text-gray-500">Tus postulaciones a proyectos</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  {projectDashboard.sentPostulations.total}
                </div>
                <StatusBreakdown 
                  byStatus={projectDashboard.sentPostulations.byStatus} 
                  compact={false}
                />
              </div>
            )}
          </div>

          {/* Porcentaje de Proyectos con Postulaciones (Plan Basic+) */}
          {projectDashboard.percentageProjectsWithPostulations !== undefined && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <KPICard
                title="Proyectos con postulaciones"
                value={`${projectDashboard.percentageProjectsWithPostulations.toFixed(1)}%`}
                icon={TrendingUp}
                color="green"
                subtitle="de tus proyectos recibieron postulaciones"
                showProgressBar
                progressValue={projectDashboard.percentageProjectsWithPostulations}
              />
            </div>
          )}

          {/* Top 5 Proyectos (Plan Premium) */}
          {projectDashboard.topProjectsByPostulations && projectDashboard.topProjectsByPostulations.length > 0 && (
            <ProjectRankingCard 
              title="Top 5 proyectos más populares"
              projects={projectDashboard.topProjectsByPostulations}
            />
          )}
        </DashboardSection>
      )}

      {/* Sección: Gráficos y Análisis */}
      {postulations.totalPostulations > 0 && (
        <DashboardSection 
          title="Análisis de postulaciones" 
          subtitle="Visualización de tu actividad"
          icon={TrendingUp}
          iconColor="green"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PostulationsChart
              totalPostulations={postulations.totalPostulations}
              acceptedPostulations={postulations.acceptedPostulations}
              successRate={(postulations.successRate || 0).toFixed(1)}
            />

            {/* Placeholder para futuro gráfico */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-6 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <p className="text-gray-400 text-center">
                Más gráficos próximamente...
              </p>
            </div>
          </div>
        </DashboardSection>
      )}

      {/* Sección: Insights */}
      <DashboardSection 
        title="Recomendaciones" 
        subtitle="Consejos para mejorar tu perfil"
        icon={Award}
        iconColor="gold"
      >
        <InsightsSection
          successRate={postulations.successRate || 0}
          totalServicesHired={services.totalServicesHired || 0}
          totalRevenueGenerated={services.totalRevenueGenerated || 0}
          totalProjectsEstablished={projects.totalProjectsEstablished || 0}
        />
      </DashboardSection>
    </div>
  );
};
