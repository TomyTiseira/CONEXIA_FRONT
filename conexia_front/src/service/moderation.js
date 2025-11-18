import { config } from '@/config/env';
import { fetchWithRefresh } from './auth/fetchWithRefresh';

const API_URL = config.API_URL;

/**
 * Analiza todos los reportes activos usando IA
 * @returns {Promise<{success: boolean, analyzed: number, results: Array}>}
 */
export async function analyzeReports() {
  try {
    const response = await fetchWithRefresh(`${API_URL}/moderation/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al analizar reportes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en analyzeReports:', error);
    throw error;
  }
}

/**
 * Obtiene los resultados de análisis de moderación
 * @param {Object} params - Parámetros de consulta
 * @param {number} params.page - Número de página (default: 1)
 * @param {number} params.limit - Límite de resultados (default: 10)
 * @param {boolean} params.resolved - Filtrar por estado resuelto
 * @param {string} params.classification - Filtrar por clasificación ("Revisar" o "Banear")
 * @returns {Promise<{data: Array, meta: Object}>}
 */
export async function getModerationResults(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.resolved !== undefined) queryParams.append('resolved', params.resolved);
    if (params.classification) queryParams.append('classification', params.classification);

    const url = `${API_URL}/moderation/results${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetchWithRefresh(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener resultados');
    }

    const json = await response.json();
    // Adaptar a la estructura esperada por el frontend
    if (json?.data?.data && json?.data?.meta) {
      return { data: json.data.data, meta: json.data.meta };
    }
    // Fallback para otras estructuras
    if (json?.data && json?.meta) {
      return { data: json.data, meta: json.meta };
    }
    return json;
  } catch (error) {
    console.error('Error en getModerationResults:', error);
    throw error;
  }
}

/**
 * Resuelve un análisis de moderación
 * @param {number} id - ID del análisis
 * @param {Object} data - Datos de resolución
 * @param {string} data.action - Acción a tomar: "ban_user" | "release_user" | "keep_monitoring"
 * @param {string} data.notes - Notas del moderador (opcional)
 * @returns {Promise<Object>} Análisis actualizado
 */
export async function resolveAnalysis(id, data) {
  try {
    const response = await fetchWithRefresh(`${API_URL}/moderation/resolve/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al resolver análisis');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en resolveAnalysis:', error);
    throw error;
  }
}

/**
 * Obtiene todos los reportes analizados por la IA para un análisis específico
 * @param {number} analysisId - ID del análisis de moderación
 * @returns {Promise<Object>} Detalles completos del análisis con reportes clasificados
 */
export async function getAnalyzedReports(analysisId) {
  try {
    const response = await fetchWithRefresh(`${API_URL}/moderation/analyzed-reports/${analysisId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener reportes analizados');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getAnalyzedReports:', error);
    throw error;
  }
}
