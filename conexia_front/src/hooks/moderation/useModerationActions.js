import { useState } from 'react';
import { analyzeReports, resolveAnalysis } from '@/service/moderation';

/**
 * Hook para gestionar las acciones de moderación
 */
export function useModerationActions() {
  const [analyzing, setAnalyzing] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [actionError, setActionError] = useState(null);

  /**
   * Ejecuta el análisis de reportes
   * @returns {Promise<{success: boolean, analyzed: number, results: Array}>}
   */
  const executeAnalysis = async () => {
    setAnalyzing(true);
    setActionError(null);
    try {
      const result = await analyzeReports();
      return result;
    } catch (error) {
      setActionError(error.message || 'Error al analizar reportes');
      throw error;
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * Resuelve un análisis de moderación
   * @param {number} id - ID del análisis
   * @param {string} action - Acción: "ban_user" | "release_user" | "keep_monitoring"
   * @param {string} notes - Notas del moderador (opcional)
   * @returns {Promise<Object>}
   */
  const executeResolve = async (id, action, notes = '') => {
    setResolving(true);
    setActionError(null);
    try {
      const result = await resolveAnalysis(id, { action, notes });
      return result;
    } catch (error) {
      setActionError(error.message || 'Error al resolver análisis');
      throw error;
    } finally {
      setResolving(false);
    }
  };

  return {
    analyzing,
    resolving,
    actionError,
    executeAnalysis,
    executeResolve,
  };
}
