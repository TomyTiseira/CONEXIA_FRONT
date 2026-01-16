'use client';
import { useState } from 'react';
import { exportAdminMetricsCSV } from '@/service/dashboard/adminExport';

/**
 * Hook para exportar métricas de administrador a CSV
 * @returns {Object} { exportMetrics, isExporting, error }
 */
export const useExportAdminDashboard = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const exportMetrics = async () => {
    try {
      setIsExporting(true);
      setError(null);

      const blob = await exportAdminMetricsCSV();
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin-metrics-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error exporting admin metrics:', err);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportMetrics,
    isExporting,
    error,
  };
};
