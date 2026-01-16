'use client';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  FolderCheck, 
  DollarSign, 
  Download,
  Award,
  Briefcase,
  AlertCircle,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { useAdminDashboardData } from '@/hooks/dashboard/useAdminDashboardData';
import { useExportAdminDashboard } from '@/hooks/dashboard/useExportAdminDashboard';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSection } from './DashboardSection';
import { DashboardSkeleton } from './LoadingStates';
import { ErrorState } from './ErrorStates';
import { KPICard } from './KPICard';
import { UsersVerificationChart } from './UsersVerificationChart';
import { ProjectsByCategorySummary } from './ProjectsByCategorySummary';
import { ProjectEngagementChart } from './ProjectEngagementChart';
import { NewProjectsChart } from './NewProjectsChart';
import { PostulationsStatusChart } from './PostulationsStatusChart';
import { UsersByPlanChart } from './UsersByPlanChart';
import { ReportsSummary } from './ReportsSummary';
import { ServicesByTypeSummary } from './ServicesByTypeSummary';
import { QuotationsChart } from './QuotationsChart';
import { ClaimsChart } from './ClaimsChart';
import { ServicesCompletedChart } from './ServicesCompletedChart';
import { StatusBreakdown } from './StatusBreakdown';
import { NewUsersChart } from './NewUsersChart';
import { ActiveUsersChart } from './ActiveUsersChart';
import { useState } from 'react';

/**
 * Dashboard para administradores con métricas globales de la plataforma
 * Muestra usuarios, proyectos, servicios, membresías y reportes
 */
export const AdminDashboard = () => {
  const { data, isLoading, error, refetch } = useAdminDashboardData();
  const { exportMetrics, isExporting } = useExportAdminDashboard();
  const [showTooltip, setShowTooltip] = useState(false);

  if (isLoading) {
    return <DashboardSkeleton cards={6} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  if (!data) {
    return <ErrorState message="No se pudieron cargar los datos del dashboard" onRetry={refetch} />;
  }

  // Mapear datos del backend a la estructura esperada
  const users = {
    totalUsers: data.users?.verifiedUsers?.total || 0,
    newUsers: data.users?.newUsers?.last30Days || 0,
    activeUsers: data.users?.activeUsers?.last90Days || 0,
    verifiedUsers: {
      verified: data.users?.verifiedUsers?.verified || 0,
      verifiedAndActive: data.users?.verifiedUsers?.verifiedAndActive || 0,
      verificationPercentage: data.users?.verifiedUsers?.verificationPercentage || 0,
    },
  };

  const projects = data.projects || {};
  const services = data.services || {};
  const memberships = data.memberships || { usersByPlan: [] };
  const reports = data.reports || {};

  return (
    <div className="space-y-8">
      {/* Header con botón de exportar */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <DashboardHeader
            title="Dashboard Administrativo"
            subtitle="Métricas globales de la plataforma Conexia"
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
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportMetrics}
            disabled={isExporting}
            className="
              flex items-center gap-2 px-5 py-3
              bg-gradient-to-r from-[#9333ea] to-[#7e22ce]
              hover:from-[#7e22ce] hover:to-[#6b21a8]
              text-white font-semibold rounded-xl
              transition-all duration-300
              shadow-lg hover:shadow-xl
              border-2 border-white/20
              disabled:opacity-50 disabled:cursor-not-allowed
              lg:self-start
            "
            aria-label="Exportar métricas administrativas a CSV"
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
              Exportar datos a CSV
              <div className="absolute -top-1 right-6 w-2 h-2 bg-gray-900 rotate-45" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Sección: Resumen General */}
      <DashboardSection 
        title="Resumen general" 
        subtitle="Métricas principales de la plataforma"
        icon={Award}
        iconColor="purple"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total de usuarios"
            value={users.totalUsers || 0}
            icon={Users}
            color="blue"
            subtitle={`${users.activeUsers || 0} activos en 90 días`}
          />

          <KPICard
            title="Usuarios verificados"
            value={users.verifiedUsers.verified || 0}
            icon={UserCheck}
            color="green"
            subtitle={`${users.verifiedUsers.verificationPercentage.toFixed(1)}% del total`}
          />

          <KPICard
            title="Proyectos activos"
            value={projects.activeProjects || 0}
            icon={FolderCheck}
            color="purple"
            subtitle={`${projects.totalProjects || 0} totales`}
          />

          <KPICard
            title="Ingresos totales"
            value={`$${(services.totalRevenue || 0).toLocaleString('es-AR')}`}
            icon={DollarSign}
            color="gold"
            subtitle="ARS en servicios"
          />
        </div>
      </DashboardSection>

      {/* Separador visual */}
      <div className="border-t-2 border-gray-200"></div>

      {/* Sección: Usuarios */}
      <DashboardSection 
        title="Usuarios" 
        subtitle="Métricas de usuarios de la plataforma"
        icon={Users}
        iconColor="blue"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KPICard
            title="Total usuarios"
            value={users.totalUsers || 0}
            icon={Users}
            color="blue"
          />

          <KPICard
            title="Usuarios activos (90d)"
            value={users.activeUsers || 0}
            icon={TrendingUp}
            color="green"
            subtitle={`${((users.activeUsers / users.totalUsers) * 100 || 0).toFixed(1)}% del total`}
          />

          <KPICard
            title="Nuevos usuarios (30d)"
            value={users.newUsers || 0}
            icon={Users}
            color="purple"
          />

          <KPICard
            title="Usuarios verificados"
            value={users.verifiedUsers.verified || 0}
            icon={UserCheck}
            color="amber"
            subtitle={`${users.verifiedUsers.verificationPercentage.toFixed(1)}% del total`}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <UsersVerificationChart
            verifiedUsers={users.verifiedUsers.verified || 0}
            totalUsers={users.totalUsers || 0}
          />

          <NewUsersChart
            last7Days={data.users?.newUsers?.last7Days || 0}
            last30Days={data.users?.newUsers?.last30Days || 0}
            last90Days={data.users?.newUsers?.last90Days || 0}
          />

          <ActiveUsersChart
            last7Days={data.users?.activeUsers?.last7Days || 0}
            last30Days={data.users?.activeUsers?.last30Days || 0}
            last90Days={data.users?.activeUsers?.last90Days || 0}
          />
        </div>
      </DashboardSection>

      {/* Separador visual */}
      <div className="border-t-2 border-gray-200"></div>

      {/* Sección: Proyectos */}
      <DashboardSection 
        title="Proyectos" 
        subtitle="Métricas de proyectos colaborativos"
        icon={FolderCheck}
        iconColor="purple"
      >
        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KPICard
            title="Total proyectos"
            value={projects.totalProjects || 0}
            icon={FolderCheck}
            color="purple"
          />

          <KPICard
            title="Proyectos activos"
            value={projects.activeProjects || 0}
            icon={TrendingUp}
            color="blue"
          />

          <KPICard
            title="Con postulaciones"
            value={projects.projectsWithPostulations || 0}
            icon={Users}
            color="green"
          />

          <KPICard
            title="Promedio postulaciones"
            value={(projects.averagePostulationsPerProject || 0).toFixed(1)}
            icon={Award}
            color="gold"
            subtitle="Por proyecto"
          />
        </div>

        {/* Gráficos visuales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ProjectEngagementChart
            projectsWithPostulations={projects.projectsWithPostulations || 0}
            totalProjects={projects.totalProjects || 0}
            projectEngagementRate={projects.projectEngagementRate || 0}
          />

          <NewProjectsChart
            last7Days={data.projects?.newProjectsLast7Days || 0}
            last30Days={data.projects?.newProjectsLast30Days || 0}
            last90Days={data.projects?.newProjectsLast90Days || 0}
          />

          <PostulationsStatusChart
            postulationsByStatus={projects.postulationsByStatus || []}
            postulationApprovalRate={projects.postulationApprovalRate || 0}
          />
        </div>

        {/* Gráfico de proyectos por categoría */}
        {projects.projectsByCategory && projects.projectsByCategory.length > 0 && (
          <ProjectsByCategorySummary projectsByCategory={projects.projectsByCategory} />
        )}
      </DashboardSection>

      {/* Separador visual */}
      <div className="border-t-2 border-gray-200"></div>

      {/* Sección: Servicios */}
      <DashboardSection 
        title="Servicios" 
        subtitle="Métricas de servicios completados"
        icon={Briefcase}
        iconColor="green"
      >
        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KPICard
            title="Servicios completados"
            value={services.totalServicesHired || 0}
            icon={Briefcase}
            color="green"
          />

          <KPICard
            title="Ingresos generados"
            value={`$${(services.totalRevenue || 0).toLocaleString('es-AR')}`}
            icon={DollarSign}
            color="blue"
          />

          <KPICard
            title="Cotizaciones enviadas"
            value={services.quotations?.sent || 0}
            icon={Award}
            color="purple"
            subtitle={`${services.quotations?.accepted || 0} aceptadas`}
          />

          <KPICard
            title="Total reclamos"
            value={services.claims?.totalClaims || 0}
            icon={AlertCircle}
            color="red"
            subtitle={`${services.claims?.resolvedClaims || 0} resueltos`}
          />
        </div>

        {/* Gráficos visuales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ServicesCompletedChart
            totalServicesHired={services.totalServicesHired || 0}
            totalRevenue={services.totalRevenue || 0}
          />

          <QuotationsChart quotations={services.quotations} />

          <ClaimsChart claims={services.claims} />
        </div>

        {/* Servicios por tipo con desplegable */}
        {services.byType && services.byType.length > 0 && (
          <ServicesByTypeSummary servicesByType={services.byType} />
        )}
      </DashboardSection>

      {/* Separador visual */}
      <div className="border-t-2 border-gray-200"></div>

      {/* Sección: Membresías - Solo si hay datos */}
      {memberships.usersByPlan && memberships.usersByPlan.length > 0 && (
        <>
          <DashboardSection 
            title="Membresías y Planes" 
            subtitle="Distribución de usuarios por plan"
            icon={CreditCard}
            iconColor="blue"
          >
            <UsersByPlanChart usersByPlan={memberships.usersByPlan} />
          </DashboardSection>

          {/* Separador visual */}
          <div className="border-t-2 border-gray-200"></div>
        </>
      )}

      {/* Sección: Reportes - Solo si hay datos */}
      {reports && reports.totalReports > 0 && (
        <DashboardSection 
          title="Reportes" 
          subtitle="Moderación y reportes de la plataforma"
          icon={AlertCircle}
          iconColor="red"
        >
          <ReportsSummary reports={reports} />
        </DashboardSection>
      )}
    </div>
  );
};
