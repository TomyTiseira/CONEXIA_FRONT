'use client';

import { useState } from 'react';
import { createInternalUser } from '@/service/internalUser/internalUserFetch';

export function useCreateInternalUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createUser = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await createInternalUser(data);
    } catch (err) {
      setError(err.message || 'Error al crear usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading, error };
}
