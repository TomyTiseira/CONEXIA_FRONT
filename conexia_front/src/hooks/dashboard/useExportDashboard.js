'use client';

/**
 * Hook para exportar datos del dashboard a CSV
 */
export const useExportDashboard = () => {
  
  /**
   * Convierte un objeto a CSV
   */
  const convertToCSV = (data, headers) => {
    const csvRows = [];
    
    // Headers
    csvRows.push(headers.join(','));
    
    // Data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  /**
   * Descarga un archivo CSV
   */
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Exportar datos de usuario
   */
  const exportUserData = (data) => {
    if (!data) return;

    const rows = [
      { 
        metric: 'Servicios completados', 
        value: data.services?.totalServicesHired || 0 
      },
      { 
        metric: 'Ingresos generados (ARS)', 
        value: data.services?.totalRevenueGenerated || 0 
      },
      { 
        metric: 'Proyectos finalizados', 
        value: data.projects?.totalProjectsEstablished || 0 
      },
      { 
        metric: 'Total postulaciones', 
        value: data.postulations?.totalPostulations || 0 
      },
      { 
        metric: 'Postulaciones aceptadas', 
        value: data.postulations?.acceptedPostulations || 0 
      },
      { 
        metric: 'Tasa de éxito (%)', 
        value: data.postulations?.successRate || 0 
      },
    ];

    const csv = convertToCSV(rows, ['metric', 'value']);
    const filename = `conexia-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  /**
   * Exportar datos de admin
   */
  const exportAdminData = (data) => {
    if (!data) return;

    const rows = [
      { metric: 'Nuevos usuarios (7 días)', value: data.newUsers?.last7Days || 0 },
      { metric: 'Nuevos usuarios (30 días)', value: data.newUsers?.last30Days || 0 },
      { metric: 'Nuevos usuarios (90 días)', value: data.newUsers?.last90Days || 0 },
      { metric: 'Total usuarios', value: data.newUsers?.total || 0 },
      { metric: 'Usuarios activos (7 días)', value: data.activeUsers?.last7Days || 0 },
      { metric: 'Usuarios activos (30 días)', value: data.activeUsers?.last30Days || 0 },
      { metric: 'Usuarios activos (90 días)', value: data.activeUsers?.last90Days || 0 },
      { metric: 'Total proyectos', value: data.projects?.totalProjects || 0 },
      { metric: 'Proyectos completados', value: data.projects?.completedProjects || 0 },
      { metric: 'Proyectos activos', value: data.projects?.activeProjects || 0 },
      { metric: 'Tasa de finalización (%)', value: data.projects?.completionRate || 0 },
      { metric: 'Servicios contratados', value: data.services?.totalServicesHired || 0 },
      { metric: 'Ingresos totales (ARS)', value: data.services?.totalRevenue || 0 },
    ];

    const csv = convertToCSV(rows, ['metric', 'value']);
    const filename = `conexia-admin-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  return {
    exportUserData,
    exportAdminData,
  };
};
