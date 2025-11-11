'use client';
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, FolderCheck, Award, Download } from 'lucide-react';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useExportDashboard } from '@/hooks/dashboard/useExportDashboard';
import { KPICard } from './KPICard';
import { PostulationsChart } from './PostulationsChart';
import { InsightsSection } from './InsightsSection';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSkeleton } from './LoadingStates';
import { ErrorState, EmptyState } from './ErrorStates';
import { useRouter } from 'next/navigation';

/**
 * Dashboard principal para usuarios regulares
 */
export const UserDashboard = () => {
  const { data, isLoading, error, refetch } = useDashboardData();
  const { exportUserData } = useExportDashboard();
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <DashboardHeader
            title="Dashboard"
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
      </div>

      {/* KPI Cards Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <KPICard
          title="Servicios completados"
          value={services.totalServicesHired || 0}
          icon={Briefcase}
          color="blue"
        />

        <KPICard
          title="Ingresos generados"
          value={`$${(services.totalRevenueGenerated || 0).toLocaleString('es-AR')}`}
          icon={DollarSign}
          color="green"
          subtitle="ARS"
        />

        <KPICard
          title="Proyectos finalizados"
          value={projects.totalProjectsEstablished || 0}
          icon={FolderCheck}
          color="purple"
        />

        <KPICard
          title="Tasa de éxito"
          value={`${(postulations.successRate || 0).toFixed(1)}%`}
          icon={Award}
          color="gold"
          subtitle={`${postulations.acceptedPostulations || 0} de ${postulations.totalPostulations || 0} postulaciones`}
          showProgressBar
          progressValue={postulations.successRate || 0}
        />
      </motion.div>

      {/* Charts Section */}
      {postulations.totalPostulations > 0 && (
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
      )}

      {/* Insights Section */}
      <InsightsSection
        successRate={postulations.successRate || 0}
        totalServicesHired={services.totalServicesHired || 0}
        totalRevenueGenerated={services.totalRevenueGenerated || 0}
        totalProjectsEstablished={projects.totalProjectsEstablished || 0}
      />
    </div>
  );
};
