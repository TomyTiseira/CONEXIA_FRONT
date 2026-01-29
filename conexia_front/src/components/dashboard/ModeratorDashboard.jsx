'use client';
import { motion } from 'framer-motion';
import { 
  AlertCircle,
  Download,
  Shield,
  Clock,
  TrendingUp,
  Ban
} from 'lucide-react';
import { useModeratorDashboardData } from '@/hooks/dashboard/useModeratorDashboardData';
import { useExportModeratorDashboard } from '@/hooks/dashboard/useExportModeratorDashboard';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSection } from './DashboardSection';
import { DashboardSkeleton } from './LoadingStates';
import { ErrorState } from './ErrorStates';
import { KPICard } from './KPICard';
import { ReportsSummary } from './ReportsSummary';
import { ClaimsChart } from './ClaimsChart';
import { UsersModerationChart } from './UsersModerationChart';
import { useState } from 'react';

/**
 * Dashboard para moderadores con métricas de moderación
 * Muestra reportes y reclamos para control de la plataforma
 */
export const ModeratorDashboard = () => {
  const { data, isLoading, error, refetch } = useModeratorDashboardData();
  const { exportMetrics, isExporting } = useExportModeratorDashboard();

  if (isLoading) {
    return <DashboardSkeleton cards={4} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  if (!data) {
    return <ErrorState message="No se pudieron cargar los datos del dashboard" onRetry={refetch} />;
  }

  const reports = data.reports || {};
  const claims = data.claims || {};
  const userModeration = data.userModeration || {};

  return (
    <div className="space-y-8">
      {/* Header con botón de exportar */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <DashboardHeader
            title="Métricas de moderación"
            subtitle="Métricas de control y moderación de la plataforma"
            timestamp={new Date().toISOString()}
          />
        </div>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportMetrics}
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
          aria-label="Exportar métricas de moderación a CSV"
        >
          <Download className="w-5 h-5" />
          <span>{isExporting ? 'Exportando...' : 'Exportar datos'}</span>
        </motion.button>
      </div>

      {/* Sección: Resumen General */}
      <DashboardSection 
        title="Resumen general" 
        subtitle="Métricas principales de moderación"
        icon={Shield}
        iconColor="red"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total de reportes"
            value={reports.totalReports || 0}
            icon={AlertCircle}
            color="red"
            subtitle="Reportes activos"
          />

          <KPICard
            title="Total de reclamos"
            value={claims.totalClaims || 0}
            icon={AlertCircle}
            color="red"
            subtitle={`${claims.resolvedClaims || 0} resueltos`}
          />

          <KPICard
            title="Tasa de reclamos"
            value={`${(claims.claimRate || 0).toFixed(1)}%`}
            icon={TrendingUp}
            color="amber"
            subtitle="Servicios con reclamos"
            showProgressBar
            progressValue={claims.claimRate || 0}
          />

          <KPICard
            title="Tiempo de resolución"
            value={`${(claims.averageResolutionTimeInHours || 0).toFixed(1)}h`}
            icon={Clock}
            color="blue"
            subtitle={`${((claims.averageResolutionTimeInHours || 0) / 24).toFixed(1)} días promedio`}
          />
        </div>
      </DashboardSection>

      {/* Separador visual */}
      <div className="border-t-2 border-gray-200"></div>

      {/* Sección: Moderación y Estado de Cuentas */}
      <DashboardSection 
        title="Moderación y estado de cuentas" 
        subtitle="Usuarios suspendidos, baneados y dados de baja"
        icon={Shield}
        iconColor="purple"
      >
        {/* KPIs de moderación */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
          <KPICard
            title="Usuarios suspendidos"
            value={userModeration.suspendedUsers || 0}
            icon={Clock}
            color="yellow"
            subtitle="Suspensión temporal"
          />
          
          <KPICard
            title="Usuarios baneados"
            value={userModeration.bannedUsers || 0}
            icon={Ban}
            color="red"
            subtitle="Suspensión permanente"
          />
        </div>

        {/* Gráfico de estado de moderación */}
        <UsersModerationChart
          activeUsers={userModeration.activeUsers || 0}
          suspendedUsers={userModeration.suspendedUsers || 0}
          bannedUsers={userModeration.bannedUsers || 0}
        />
      </DashboardSection>

      {/* Separador visual */}
      <div className="border-t-2 border-gray-200"></div>

      {/* Sección: Reportes */}
      <DashboardSection 
        title="Reportes" 
        subtitle="Moderación y reportes de la plataforma"
        icon={AlertCircle}
        iconColor="red"
      >
        <ReportsSummary reports={reports} />
      </DashboardSection>

      {/* Separador visual */}
      <div className="border-t-2 border-gray-200"></div>

      {/* Sección: Reclamos */}
      <DashboardSection 
        title="Reclamos de servicios" 
        subtitle="Gestión y resolución de conflictos"
        icon={AlertCircle}
        iconColor="amber"
      >
        {/* KPIs de reclamos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KPICard
            title="Total de reclamos"
            value={claims.totalClaims || 0}
            icon={AlertCircle}
            color="red"
          />

          <KPICard
            title="Reclamos resueltos"
            value={claims.resolvedClaims || 0}
            icon={Shield}
            color="green"
            subtitle={`${(claims.resolutionRate || 0).toFixed(1)}% resueltos`}
          />

          <KPICard
            title="Tasa de reclamos"
            value={`${(claims.claimRate || 0).toFixed(1)}%`}
            icon={TrendingUp}
            color="amber"
            subtitle="De servicios en progreso"
            showProgressBar
            progressValue={Math.min(claims.claimRate || 0, 100)}
          />

          <KPICard
            title="Tiempo promedio"
            value={`${(claims.averageResolutionTimeInHours || 0).toFixed(1)}h`}
            icon={Clock}
            color="blue"
            subtitle={`${((claims.averageResolutionTimeInHours || 0) / 24).toFixed(1)} días`}
          />
        </div>

        {/* Gráfico visual de reclamos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClaimsChart claims={claims} />

          {/* Card informativa */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border-2 border-blue-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-blue-100">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Información sobre Reclamos</h3>
                <p className="text-sm text-gray-500">Cálculo de métricas</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Tasa de Reclamos
                </h4>
                <p className="text-sm text-gray-600">
                  Porcentaje de servicios <strong>en progreso</strong> que tienen reclamos activos.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Fórmula: (Servicios con reclamo / Servicios en progreso) × 100
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Tasa de Resolución
                </h4>
                <p className="text-sm text-gray-600">
                  Porcentaje de reclamos que han sido <strong>resueltos completamente</strong>.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Un reclamo se considera resuelto cuando tiene tipo, responsable y fecha de resolución.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Tiempo de Resolución
                </h4>
                <p className="text-sm text-gray-600">
                  Promedio de tiempo entre la <strong>creación</strong> del reclamo y su <strong>resolución</strong>.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Solo incluye reclamos completamente resueltos.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </DashboardSection>
    </div>
  );
};
