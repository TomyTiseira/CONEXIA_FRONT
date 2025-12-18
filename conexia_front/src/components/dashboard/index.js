// Componentes principales del dashboard
export { UserDashboard } from './UserDashboard';
export { AdminDashboard } from './AdminDashboard';

// Componentes UI reutilizables
export { KPICard } from './KPICard';
export { ChartContainer } from './ChartContainer';
export { DashboardHeader } from './DashboardHeader';
export { DashboardSection } from './DashboardSection';

// Gráficos de usuario
export { PostulationsChart } from './PostulationsChart';
export { InsightsSection } from './InsightsSection';

// Componentes de métricas de proyectos
export { StatusBreakdown } from './StatusBreakdown';
export { ProjectRankingCard } from './ProjectRankingCard';

// Gráficos de admin
export { NewUsersChart } from './NewUsersChart';
export { ActiveUsersChart } from './ActiveUsersChart';
export { ProjectsStatusChart } from './ProjectsStatusChart';
export { ServicesByTypeChart } from './ServicesByTypeChart';

// Estados de carga y error
export { DashboardSkeleton, KPICardSkeleton, ChartSkeleton } from './LoadingStates';
export { ErrorState, EmptyState } from './ErrorStates';
