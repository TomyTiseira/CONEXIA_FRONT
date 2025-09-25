import { useState } from 'react';
import { createService } from '@/service/services';

export function useCreateService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const publishService = async (form) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();

      // Campos requeridos
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price', String(form.price)); // Aseguramos que sea string
      formData.append('categoryId', form.categoryId);

      // Campos opcionales
      if (form.estimatedHours) {
        formData.append('estimatedHours', form.estimatedHours);
      }

      // Imágenes (máximo 5)
      if (form.images && form.images.length > 0) {
        form.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const result = await createService(formData);
      return result;
    } catch (err) {
      setError(err.message || 'Error al publicar el servicio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { publishService, loading, error };
}