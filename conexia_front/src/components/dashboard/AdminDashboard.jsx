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
  TrendingUp,
  Shield,
  UserX,
  Clock,
  Ban
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
import { UsersModerationChart } from './UsersModerationChart';
import { DeletedUsersChart } from './DeletedUsersChart';
import { DeletedUsersReasonsSummary } from './DeletedUsersReasonsSummary';
import { useState } from 'react';

/**
 * Dashboard para administradores con métricas globales de la plataforma
 * Muestra usuarios, proyectos, servicios, membresías y reportes
 */
export const AdminDashboard = () => {
  const { data, isLoading, error, refetch } = useAdminDashboardData();
  const { exportMetrics, isExporting } = useExportAdminDashboard();

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
            title="Métricas administrativas"
            subtitle="Métricas globales de la plataforma Conexia"
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
          aria-label="Exportar métricas administrativas a CSV"
        >
          <Download className="w-5 h-5" />
          <span>{isExporting ? 'Exportando...' : 'Exportar datos'}</span>
        </motion.button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
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

      {/* Sección: Moderación y Estado de Cuentas */}
      <DashboardSection 
        title="Moderación y estado de cuentas" 
        subtitle="Usuarios suspendidos, baneados y dados de baja"
        icon={Shield}
        iconColor="purple"
      >
        {/* KPIs de moderación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <KPICard
            title="Usuarios suspendidos"
            value={data.users?.moderationMetrics?.suspendedUsers || 0}
            icon={Clock}
            color="yellow"
            subtitle="Suspensión temporal"
          />
          
          <KPICard
            title="Usuarios baneados"
            value={data.users?.moderationMetrics?.bannedUsers || 0}
            icon={Ban}
            color="red"
            subtitle="Suspensión permanente"
          />
        </div>

        {/* Gráfico de estado de moderación - Ancho completo */}
        <div className="mb-6">
          <UsersModerationChart
            activeUsers={(data.users?.verifiedUsers?.total || 0) - (data.users?.moderationMetrics?.suspendedUsers || 0) - (data.users?.moderationMetrics?.bannedUsers || 0)}
            suspendedUsers={data.users?.moderationMetrics?.suspendedUsers || 0}
            bannedUsers={data.users?.moderationMetrics?.bannedUsers || 0}
          />
        </div>

        {/* Gráficos de bajas y razones - En una fila */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeletedUsersChart
            last7Days={data.users?.deletedUsers?.last7Days || 0}
            last30Days={data.users?.deletedUsers?.last30Days || 0}
            last90Days={data.users?.deletedUsers?.last90Days || 0}
          />

          {/* Razones de baja - Solo mostrar si hay datos */}
          {data.users?.deletedUsers?.reasonCategories && data.users.deletedUsers.reasonCategories.length > 0 ? (
            <DeletedUsersReasonsSummary
              topReasons={data.users.deletedUsers.reasonCategories}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 flex items-center justify-center">
              <p className="text-gray-500 text-sm">No hay datos de razones de baja disponibles</p>
            </div>
          )}
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
            title="Membresías y planes" 
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
