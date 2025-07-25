'use client';

import { useState } from 'react';
import { updateInternalUser } from '@/service/internalUser/internalUserFetch';

export default function useUpdateInternalUser() {
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  const handleUpdate = async (id, data) => {
    setUpdatingId(id);
    setError(null);

    try {
      await updateInternalUser(id, data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Error al actualizar el usuario.';
      setError(message);
      throw new Error(message); // <- lanzamos el error para que el modal lo maneje
    } finally {
      setUpdatingId(null);
    }
  };

  return { handleUpdate, updatingId, error };
}
