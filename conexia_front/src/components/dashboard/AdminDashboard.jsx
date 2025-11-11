'use client';
import { motion } from 'framer-motion';
import { UserPlus, Users, CheckCircle, DollarSign, Download } from 'lucide-react';
import { useAdminDashboardData } from '@/hooks/dashboard/useAdminDashboardData';
import { useExportDashboard } from '@/hooks/dashboard/useExportDashboard';
import { KPICard } from './KPICard';
import { NewUsersChart } from './NewUsersChart';
import { ActiveUsersChart } from './ActiveUsersChart';
import { ProjectsStatusChart } from './ProjectsStatusChart';
import { ServicesByTypeChart } from './ServicesByTypeChart';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSkeleton } from './LoadingStates';
import { ErrorState } from './ErrorStates';

/**
 * Dashboard para administradores y moderadores
 */
export const AdminDashboard = () => {
  const { data, isLoading, error, refetch } = useAdminDashboardData();
  const { exportAdminData } = useExportDashboard();

  if (isLoading) {
    return <DashboardSkeleton cards={4} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  if (!data) {
    return <ErrorState message="No se pudieron cargar los datos del dashboard" onRetry={refetch} />;
  }

  const {
    newUsers = {},
    activeUsers = {},
    projects = {},
    services = {},
  } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <DashboardHeader
            title="Dashboard"
            subtitle="Resumen de la actividad en Conexia"
            timestamp={new Date().toISOString()}
          />
        </div>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => exportAdminData(data)}
          className="
            flex items-center gap-2 px-5 py-3
            bg-gradient-to-r from-[#9333ea] to-[#7e22ce]
            hover:from-[#7e22ce] hover:to-[#6b21a8]
            text-white font-semibold rounded-xl
            transition-all duration-300
            shadow-lg hover:shadow-xl
            border-2 border-white/20
            lg:self-start
          "
          aria-label="Exportar datos administrativos a CSV"
        >
          <Download className="w-5 h-5" />
          <span>Exportar datos</span>
        </motion.button>
      </div>

      {/* Hero Stats - KPI Cards principales */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <KPICard
          title="Nuevos usuarios (30 días)"
          value={newUsers.last30Days || 0}
          icon={UserPlus}
          color="blue"
          trend={`+${newUsers.last7Days || 0} esta semana`}
        />

        <KPICard
          title="Usuarios activos (30 días)"
          value={activeUsers.last30Days || 0}
          icon={Users}
          color="green"
          trend={`${activeUsers.last7Days || 0} activos esta semana`}
        />

        <KPICard
          title="Tasa de finalización"
          value={`${(projects.completionRate || 0).toFixed(1)}%`}
          icon={CheckCircle}
          color="purple"
          subtitle={`${projects.completedProjects || 0} de ${projects.totalProjects || 0} proyectos`}
          showProgressBar
          progressValue={projects.completionRate || 0}
        />

        <KPICard
          title="Ingresos totales"
          value={`$${(services.totalRevenue || 0).toLocaleString('es-AR')}`}
          icon={DollarSign}
          color="gold"
          subtitle="ARS generados en servicios"
        />
      </motion.div>

      {/* Gráficos de Usuarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NewUsersChart
          last7Days={newUsers.last7Days || 0}
          last30Days={newUsers.last30Days || 0}
          last90Days={newUsers.last90Days || 0}
        />

        <ActiveUsersChart
          last7Days={activeUsers.last7Days || 0}
          last30Days={activeUsers.last30Days || 0}
          last90Days={activeUsers.last90Days || 0}
        />
      </div>

      {/* Gráfico de Proyectos */}
      <div className="grid grid-cols-1 gap-6">
        <ProjectsStatusChart
          totalProjects={projects.totalProjects || 0}
          completedProjects={projects.completedProjects || 0}
          activeProjects={projects.activeProjects || 0}
          completionRate={projects.completionRate || 0}
        />
      </div>

      {/* Gráfico de Servicios por Tipo */}
      <div className="grid grid-cols-1 gap-6">
        <ServicesByTypeChart servicesByType={services.byType || []} />
      </div>

      {/* Stats adicionales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-[#48a6a7] to-[#35ba5b] rounded-xl shadow-lg p-8 text-white"
      >
        <h3 className="text-2xl font-bold mb-4">📊 Resumen general</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-white/80 text-sm mb-1">Total de usuarios</p>
            <p className="text-3xl font-bold">{newUsers.total || 0}</p>
          </div>
          <div>
            <p className="text-white/80 text-sm mb-1">Servicios contratados</p>
            <p className="text-3xl font-bold">{services.totalServicesHired || 0}</p>
          </div>
          <div>
            <p className="text-white/80 text-sm mb-1">Proyectos totales</p>
            <p className="text-3xl font-bold">{projects.totalProjects || 0}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
