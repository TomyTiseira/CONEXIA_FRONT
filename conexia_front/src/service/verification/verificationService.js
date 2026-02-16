import { config } from "../../config";
import { fetchWithRefresh } from "../auth/fetchWithRefresh";

/**
 * Convierte un File a base64
 * @param {File} file - Archivo a convertir
 * @returns {Promise<string>} String base64 (sin el prefijo data:image/...)
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remover el prefijo "data:image/...;base64,"
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Envía las imágenes para verificación de identidad
 * @param {File} documentImage - Archivo de imagen del documento
 * @param {File} faceImage - Archivo de imagen del rostro (selfie)
 * @param {string} documentType - Tipo de documento ('DNI' | 'Pasaporte')
 * @returns {Promise<Object>} Resultado de la verificación
 */
export const verifyIdentity = async (
  documentImage,
  faceImage,
  documentType,
) => {
  try {
    // Convertir archivos a base64
    const [documentBase64, faceBase64] = await Promise.all([
      fileToBase64(documentImage),
      fileToBase64(faceImage),
    ]);

    // Preparar payload con base64
    const payload = {
      documentImage: {
        fileData: documentBase64,
        originalName: documentImage.name,
        mimeType: documentImage.type,
      },
      faceImage: {
        fileData: faceBase64,
        originalName: faceImage.name,
        mimeType: faceImage.type,
      },
      documentType,
    };

    const res = await fetchWithRefresh(
      `${config.API_URL}/verification/compare`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Error al verificar identidad");
    }

    const response = await res.json();
    return response.data || response; // Retorna data si existe, sino la respuesta completa
  } catch (error) {
    throw new Error(error.message || "Error al verificar identidad");
  }
};

/**
 * Obtiene el estado de verificación del usuario actual
 * @returns {Promise<Object>} Estado de verificación
 */
export const getVerificationStatus = async () => {
  try {
    const res = await fetchWithRefresh(
      `${config.API_URL}/verification/status`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(
        error.message || "Error al obtener estado de verificación",
      );
    }

    const response = await res.json();
    return response.data || response; // Retorna data si existe, sino la respuesta completa
  } catch (error) {
    throw new Error(error.message || "Error al obtener estado de verificación");
  }
};

/**
 * Obtiene el historial de verificaciones del usuario
 * @returns {Promise<Array>} Historial de verificaciones
 */
export const getVerificationHistory = async () => {
  try {
    const res = await fetchWithRefresh(
      `${config.API_URL}/verification/history`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(
        error.message || "Error al obtener historial de verificación",
      );
    }

    const response = await res.json();
    return response.data || response; // Retorna data si existe, sino la respuesta completa
  } catch (error) {
    throw new Error(
      error.message || "Error al obtener historial de verificación",
    );
  }
};
