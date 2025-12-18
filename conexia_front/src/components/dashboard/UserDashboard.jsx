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
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useExportDashboard } from '@/hooks/dashboard/useExportDashboard';
import { useSwapyLayout } from '@/hooks/dashboard/useSwapyLayout';
import { KPICard } from './KPICard';
import { PostulationsChart } from './PostulationsChart';
import { InsightsSection } from './InsightsSection';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSkeleton } from './LoadingStates';
import { ErrorState, EmptyState } from './ErrorStates';
import { DashboardSection } from './DashboardSection';
import { StatusBreakdown } from './StatusBreakdown';
import { ProjectRankingCard } from './ProjectRankingCard';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Dashboard principal para usuarios regulares con drag & drop interactivo
 */
export const UserDashboard = () => {
  const { data, isLoading, error, refetch } = useDashboardData();
  const { exportUserData } = useExportDashboard();
  const { containerRef, isSwapyReady } = useSwapyLayout('conexia-user-dashboard-layout');
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return <DashboardSkeleton cards={4} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  if (!data) {
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
    projectDashboard = {},
  } = data;

  const hasAnyActivity = 
    (services.totalServicesHired || 0) > 0 ||
    (projects.totalProjectsEstablished || 0) > 0 ||
    (postulations.totalPostulations || 0) > 0;

  if (!hasAnyActivity) {
    return (
      <>
        <DashboardHeader
          title="Dashboard"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <DashboardHeader
            title="Dashboard"
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
              onClick={() => exportUserData(data)}
              className="
                flex items-center gap-2 px-5 py-3
                bg-gradient-to-r from-[#48a6a7] to-[#419596]
                hover:from-[#419596] hover:to-[#3a8586]
                text-white font-semibold rounded-xl
                transition-all duration-300
                shadow-lg hover:shadow-xl
                border-2 border-white/20
                lg:self-start
              "
              aria-label="Exportar datos a CSV"
            >
              <Download className="w-5 h-5" />
              <span>Exportar datos</span>
            </motion.button>

            {/* Tooltip */}
            {showTooltip && (
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
                Exportar datos a CSV
                <div className="absolute -top-1 right-6 w-2 h-2 bg-gray-900 rotate-45" />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Hint de drag & drop */}
      {isSwapyReady && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 -mt-2"
        >
          <Grip className="w-4 h-4" />
          <span className="font-medium">Arrastra las tarjetas para personalizar tu dashboard</span>
        </motion.div>
      )}

      {/* Sección: Resumen General */}
      <DashboardSection 
        title="Resumen general" 
        subtitle="Tus métricas principales"
        icon={Award}
        iconColor="blue"
      >
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

      {/* Sección: Proyectos Colaborativos (Nueva) */}
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
                    <h3 className="text-lg font-bold text-gray-800">Postulaciones Recibidas</h3>
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
                    <h3 className="text-lg font-bold text-gray-800">Postulaciones Enviadas</h3>
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

          {/* Top 10 Proyectos (Plan Premium) */}
          {projectDashboard.topProjectsByPostulations && projectDashboard.topProjectsByPostulations.length > 0 && (
            <ProjectRankingCard 
              title="Top 10 proyectos más populares"
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
