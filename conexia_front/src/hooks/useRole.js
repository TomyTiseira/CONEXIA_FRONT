import { useFetch } from '@/hooks';
import { getRoleById } from '@/service/user/userFetch';
import { useCallback } from 'react';

export const useRole = (roleId) => {
  const fetchRole = useCallback(() => {
    if (!roleId) {
      return Promise.resolve(null);
    }
    return getRoleById(roleId);
  }, [roleId]);
  
  const { data, error, isLoading } = useFetch(fetchRole);

  if (!roleId) {
    return { role: null, loading: false, error: null };
  }

  if (isLoading) {
    return { role: null, loading: true, error: null };
  }

  if (error) {
    return { role: null, loading: false, error: 'Error al obtener el Rol' };
  }

  return { role: data || null, loading: false, error: null };
}