import { useState } from "react";
import { createService } from "@/service/services";

/**
 * Helper para convertir un archivo a base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Extraer solo el contenido base64 (sin el prefijo data:image/...;base64,)
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export function useCreateService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const publishService = async (form) => {
    setLoading(true);
    setError(null);

    try {
      // Convert images to base64 if present
      let imageFiles = [];
      if (form.images && form.images.length > 0) {
        imageFiles = await Promise.all(
          form.images.map(async (file) => {
            const fileData = await fileToBase64(file);
            return {
              fileData,
              originalName: file.name,
              mimeType: file.type,
            };
          }),
        );
      }

      // Build JSON payload
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        categoryId: Number(form.categoryId),
        timeUnit: form.timeUnit,
        imageFiles, // New base64 approach
      };

      const result = await createService(payload);
      return result;
    } catch (err) {
      // Crear un objeto de error con información adicional
      const errorObj = {
        message: err.message || "Error al publicar el servicio",
        statusCode: err.statusCode || null,
        isLimitExceeded:
          err.statusCode === 403 || err.message?.includes("límite"),
      };
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { publishService, loading, error };
}
