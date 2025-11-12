'use client';
import { motion } from 'framer-motion';
import { UserPlus, Users, CheckCircle, DollarSign, Download, RotateCcw, Grip } from 'lucide-react';
import { useAdminDashboardData } from '@/hooks/dashboard/useAdminDashboardData';
import { useExportDashboard } from '@/hooks/dashboard/useExportDashboard';
import { useSwapyLayout } from '@/hooks/dashboard/useSwapyLayout';
import { KPICard } from './KPICard';
import { NewUsersChart } from './NewUsersChart';
import { ActiveUsersChart } from './ActiveUsersChart';
import { ProjectsStatusChart } from './ProjectsStatusChart';
import { ServicesByTypeChart } from './ServicesByTypeChart';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSkeleton } from './LoadingStates';
import { ErrorState } from './ErrorStates';
import { useState } from 'react';

/**
 * Dashboard para administradores y moderadores con drag & drop interactivo
 */
export const AdminDashboard = () => {
  const { data, isLoading, error, refetch } = useAdminDashboardData();
  const { exportAdminData } = useExportDashboard();
  const { containerRef, resetLayout, isSwapyReady } = useSwapyLayout('conexia-admin-dashboard-kpis');
  const { containerRef: chartsContainerRef, resetLayout: resetChartsLayout, isSwapyReady: isChartsSwapyReady } = useSwapyLayout('conexia-admin-dashboard-charts');
  const [showResetButton, setShowResetButton] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <DashboardHeader
            title="Dashboard"
            subtitle="Resumen de la actividad en Conexia"
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700 -mt-2"
        >
          <Grip className="w-4 h-4"/>
          <span className="font-medium">Arrastra las tarjetas para personalizar tu dashboard</span>
        </motion.div>
      )}

      {/* Hero Stats - KPI Cards principales con Swapy */}
      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div data-swapy-slot="admin-kpi-1" className="h-full">
          <div data-swapy-item="new-users">
            <KPICard
              title="Nuevos usuarios (30 días)"
              value={newUsers.last30Days || 0}
              icon={UserPlus}
              color="blue"
              trend={`+${newUsers.last7Days || 0} esta semana`}
            />
          </div>
        </div>

        <div data-swapy-slot="admin-kpi-2" className="h-full">
          <div data-swapy-item="active-users">
            <KPICard
              title="Usuarios activos (30 días)"
              value={activeUsers.last30Days || 0}
              icon={Users}
              color="green"
              trend={`${activeUsers.last7Days || 0} activos esta semana`}
            />
          </div>
        </div>

        <div data-swapy-slot="admin-kpi-3" className="h-full">
          <div data-swapy-item="completion-rate">
            <KPICard
              title="Tasa de finalización"
              value={`${(projects.completionRate || 0).toFixed(1)}%`}
              icon={CheckCircle}
              color="purple"
              subtitle={`${projects.completedProjects || 0} de ${projects.totalProjects || 0} proyectos`}
              showProgressBar
              progressValue={projects.completionRate || 0}
            />
          </div>
        </div>

        <div data-swapy-slot="admin-kpi-4" className="h-full">
          <div data-swapy-item="total-revenue">
            <KPICard
              title="Ingresos totales"
              value={`$${(services.totalRevenue || 0).toLocaleString('es-AR')}`}
              icon={DollarSign}
              color="gold"
              subtitle="ARS generados en servicios"
            />
          </div>
        </div>
      </div>

      {/* Gráficos de Usuarios - Con Swapy */}
      <div
        ref={chartsContainerRef}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div data-swapy-slot="chart-1" className="h-full">
          <div data-swapy-item="new-users-chart">
            <NewUsersChart
              last7Days={newUsers.last7Days || 0}
              last30Days={newUsers.last30Days || 0}
              last90Days={newUsers.last90Days || 0}
            />
          </div>
        </div>

        <div data-swapy-slot="chart-2" className="h-full">
          <div data-swapy-item="active-users-chart">
            <ActiveUsersChart
              last7Days={activeUsers.last7Days || 0}
              last30Days={activeUsers.last30Days || 0}
              last90Days={activeUsers.last90Days || 0}
            />
          </div>
        </div>
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
