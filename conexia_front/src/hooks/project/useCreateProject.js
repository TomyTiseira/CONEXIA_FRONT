'use client';

import { useState } from 'react';
import { createProject } from '@/service/project/projectFetch';

export function useCreateProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createProject(formData);
      return response;
    } catch (err) {
      setError(err.message || 'Error al crear proyecto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}
