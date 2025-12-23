import { useState } from 'react';
import { exportModeratorMetricsCSV } from '@/service/dashboard/moderatorService';

/**
 * Hook para exportar métricas del dashboard de moderador
 */
export const useExportModeratorDashboard = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportMetrics = async () => {
    try {
      setIsExporting(true);
      const blob = await exportModeratorMetricsCSV();
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `moderador-metricas-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar métricas:', error);
      alert('Error al exportar los datos. Por favor, inténtalo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportMetrics,
    isExporting,
  };
};
