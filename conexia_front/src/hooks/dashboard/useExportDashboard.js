'use client';

/**
 * Hook para exportar datos del dashboard a CSV
 * Ahora exporta tanto métricas de servicios como de proyectos en un solo archivo
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
    // Agregar BOM UTF-8 para correcta visualización de acentos en Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
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
   * Exportar TODAS las métricas (servicios + proyectos)
   */
  const exportAllMetrics = (projectData, serviceData) => {
    const sections = [];
    
    // ===== SECCIÓN: MÉTRICAS DE SERVICIOS =====
    sections.push('=== MÉTRICAS DE SERVICIOS ===');
    
    if (serviceData) {
      const serviceRows = [
        { metric: 'Plan del usuario', value: serviceData.userPlan || 'N/A' },
        { metric: '', value: '' }, // Línea vacía
        { metric: 'Servicios publicados', value: serviceData.totalServicesPublished || 0 },
        { metric: 'Servicios contratados', value: serviceData.totalServicesHired || 0 },
        { metric: 'Tasa de contratación (%)', value: serviceData.hiringPercentage || 0 },
        { metric: 'Calificación promedio (1-5)', value: serviceData.averageRating || 0 },
        { metric: 'Total de reseñas', value: serviceData.totalReviews || 0 },
      ];

      // Métricas de ingresos (Basic y Premium)
      if (serviceData.totalRevenueGenerated !== undefined) {
        serviceRows.push({ metric: 'Ingresos generados (ARS)', value: serviceData.totalRevenueGenerated || 0 });
      }

      // Métricas Premium
      if (serviceData.userPlan === 'Premium') {
        serviceRows.push(
          { metric: '', value: '' },
          { metric: 'Servicios completados', value: serviceData.servicesCompleted || 0 },
          { metric: 'Servicios cancelados', value: serviceData.servicesCancelled || 0 },
          { metric: 'Servicios con reclamos', value: serviceData.servicesWithClaims || 0 }
        );

        // Top servicios
        if (serviceData.topHiredServices && serviceData.topHiredServices.length > 0) {
          serviceRows.push({ metric: '', value: '' });
          serviceRows.push({ metric: 'Top Servicios Más Contratados', value: '' });
          
          serviceData.topHiredServices.forEach((service, index) => {
            serviceRows.push({
              metric: `#${index + 1} - ${service.serviceTitle}`,
              value: `${service.timesHired} contratos | $${service.revenue} ARS | ⭐${service.averageRating}`
            });
          });
        }
      }

      const serviceCsv = convertToCSV(serviceRows, ['metric', 'value']);
      sections.push(serviceCsv);
    } else {
      sections.push('Sin datos de servicios disponibles');
    }

    sections.push('');
    sections.push('');

    // ===== SECCIÓN: MÉTRICAS DE PROYECTOS =====
    sections.push('=== MÉTRICAS DE PROYECTOS ===');
    
    if (projectData) {
      const projectRows = [
        { metric: 'Proyectos finalizados', value: projectData.projects?.totalProjectsEstablished || 0 },
        { metric: 'Total de postulaciones', value: projectData.postulations?.totalPostulations || 0 },
        { metric: 'Postulaciones aceptadas', value: projectData.postulations?.acceptedPostulations || 0 },
        { metric: 'Tasa de éxito (%)', value: projectData.postulations?.successRate || 0 },
      ];

      const projectCsv = convertToCSV(projectRows, ['metric', 'value']);
      sections.push(projectCsv);
    } else {
      sections.push('Sin datos de proyectos disponibles');
    }

    sections.push('');
    sections.push('');

    // ===== METADATA =====
    sections.push('=== INFORMACIÓN DEL REPORTE ===');
    const metadataRows = [
      { metric: 'Fecha de generación', value: new Date().toLocaleString('es-AR') },
      { metric: 'Generado por', value: 'Conexia Dashboard' },
    ];
    const metadataCsv = convertToCSV(metadataRows, ['metric', 'value']);
    sections.push(metadataCsv);

    // Combinar todas las secciones
    const finalCsv = sections.join('\n');
    const filename = `conexia-metricas-completas-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(finalCsv, filename);
  };

  /**
   * Exportar datos de usuario (legacy - mantener por compatibilidad)
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
    exportAllMetrics,
    exportUserData,
    exportAdminData,
  };
};
