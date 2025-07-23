'use client';

import { useState } from 'react';
import { deleteInternalUser } from '@/service/internalUser/internalUserFetch';

export default function useDeleteInternalUser() {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError(null);

    try {
      await deleteInternalUser(id);
      return { ok: true, text: 'Usuario eliminado correctamente.' };
    } catch (err) {
      const message = err.message || 'Error al eliminar el usuario.';
      setError(message);
      return { ok: false, text: message };
    } finally {
      setDeletingId(null);
    }
  };

  return { handleDelete, deletingId, error };
}
