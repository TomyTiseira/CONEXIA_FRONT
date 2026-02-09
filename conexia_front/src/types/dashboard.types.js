/**
 * @typedef {Object} PostulationsByStatus
 * @property {number} total
 * @property {Object} byStatus
 * @property {number} byStatus.activo
 * @property {number} byStatus.pendiente_evaluacion
 * @property {number} byStatus.evaluacion_expirada
 * @property {number} byStatus.aceptada
 * @property {number} byStatus.rechazada
 * @property {number} byStatus.cancelada
 * @property {number} byStatus.cancelada_moderacion
 */

/**
 * @typedef {Object} TopProject
 * @property {number} projectId
 * @property {string} projectTitle
 * @property {number} postulationsCount
 */

/**
 * @typedef {Object} ProjectDashboardMetrics
 * @property {PostulationsByStatus} [receivedPostulations] - Postulaciones recibidas (Plan Free+)
 * @property {PostulationsByStatus} [sentPostulations] - Postulaciones enviadas (Plan Free+)
 * @property {number} [percentageProjectsWithPostulations] - % de proyectos con postulaciones (Plan Basic+)
 * @property {TopProject[]} [topProjectsByPostulations] - Top 10 proyectos (Plan Premium)
 */

/**
 * @typedef {Object} UserDashboardData
 * @property {boolean} success
 * @property {Object} data
 * @property {Object} data.services
 * @property {number} data.services.totalServicesHired - Total de servicios contratados como proveedor
 * @property {number} data.services.totalRevenueGenerated - Ingresos generados en ARS
 * @property {Object} data.projects
 * @property {number} data.projects.totalProjectsEstablished - Proyectos completados con colaboradores
 * @property {Object} data.postulations
 * @property {number} data.postulations.totalPostulations - Total de postulaciones realizadas
 * @property {number} data.postulations.acceptedPostulations - Postulaciones aceptadas
 * @property {number} data.postulations.successRate - % de éxito (0-100), excluye canceladas
 * @property {Object} [data.postulations.byStatus] - Desglose opcional por estado
 * @property {ProjectDashboardMetrics} [data.projectDashboard] - Métricas de proyectos colaborativos
 * @property {string} timestamp
 */

/**
 * @typedef {Object} ServiceByType
 * @property {string} type - Tipo de servicio
 * @property {number} count - Cantidad de servicios
 * @property {number} revenue - Ingresos generados
 */

/**
 * @typedef {Object} AdminDashboardData
 * @property {boolean} success
 * @property {Object} data
 * @property {Object} data.newUsers
 * @property {number} data.newUsers.last7Days
 * @property {number} data.newUsers.last30Days
 * @property {number} data.newUsers.last90Days
 * @property {number} data.newUsers.total
 * @property {Object} data.activeUsers
 * @property {number} data.activeUsers.last7Days
 * @property {number} data.activeUsers.last30Days
 * @property {number} data.activeUsers.last90Days
 * @property {Object} data.projects
 * @property {number} data.projects.totalProjects
 * @property {number} data.projects.completedProjects
 * @property {number} data.projects.activeProjects
 * @property {number} data.projects.completionRate - % (0-100)
 * @property {Object} data.services
 * @property {number} data.services.totalServicesHired
 * @property {number} data.services.totalRevenue - En ARS
 * @property {ServiceByType[]} data.services.byType
 * @property {string} timestamp
 */

export const DASHBOARD_QUERY_KEYS = {
  USER: ['dashboard', 'user'],
  ADMIN: ['dashboard', 'admin']
};
