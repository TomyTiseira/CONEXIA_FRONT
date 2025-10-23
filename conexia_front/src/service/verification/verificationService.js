import { config } from '../../config';
import { fetchWithRefresh } from '../auth/fetchWithRefresh';

/**
 * Envía las imágenes para verificación de identidad
 * @param {File} documentImage - Archivo de imagen del documento
 * @param {File} faceImage - Archivo de imagen del rostro (selfie)
 * @param {string} documentType - Tipo de documento ('DNI' | 'Pasaporte')
 * @returns {Promise<Object>} Resultado de la verificación
 */
export const verifyIdentity = async (documentImage, faceImage, documentType) => {
  try {
    const formData = new FormData();
    formData.append('documentImage', documentImage);
    formData.append('faceImage', faceImage);
    formData.append('documentType', documentType);

    const res = await fetchWithRefresh(`${config.API_URL}/verification/compare`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // No establecer Content-Type, el navegador lo hace automáticamente con boundary
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al verificar identidad');
    }

    const response = await res.json();
    return response.data || response; // Retorna data si existe, sino la respuesta completa
  } catch (error) {
    throw new Error(error.message || 'Error al verificar identidad');
  }
};

/**
 * Obtiene el estado de verificación del usuario actual
 * @returns {Promise<Object>} Estado de verificación
 */
export const getVerificationStatus = async () => {
  try {
    const res = await fetchWithRefresh(`${config.API_URL}/verification/status`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener estado de verificación');
    }

    const response = await res.json();
    return response.data || response; // Retorna data si existe, sino la respuesta completa
  } catch (error) {
    throw new Error(error.message || 'Error al obtener estado de verificación');
  }
};

/**
 * Obtiene el historial de verificaciones del usuario
 * @returns {Promise<Array>} Historial de verificaciones
 */
export const getVerificationHistory = async () => {
  try {
    const res = await fetchWithRefresh(`${config.API_URL}/verification/history`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener historial de verificación');
    }

    const response = await res.json();
    return response.data || response; // Retorna data si existe, sino la respuesta completa
  } catch (error) {
    throw new Error(error.message || 'Error al obtener historial de verificación');
  }
};
