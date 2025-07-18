import { useFetch } from '@/hooks';
import { getRoleById } from '@/service/user/userFetch';
import { useCallback } from 'react';

export const useRole = (roleId) => {
  const fetchRole = useCallback(() => getRoleById(roleId), [roleId]);
  const { data, error, isLoading } = useFetch(fetchRole);

  if (isLoading) {
    return { role: null, loading: true, error: null };
  }

  if (error) {
    return { role: null, loading: false, error: 'Error al obtener el Rol' };
  }

  return { role: data || null, loading: false, error: null };
}