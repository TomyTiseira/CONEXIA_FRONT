'use client';
import { getProfile } from '@/service/auth/authService';
import { useFetch } from '@/hooks/useFetch';
import { useCallback } from 'react';

export const useValidateSession = () => {
  const fetchProfile = useCallback(() => getProfile(), []);
  const { data, error, isLoading } = useFetch(fetchProfile);

  if (isLoading) {
    return { isAuthenticated: false, loading: true, error: null, data: null };
  }

  if (error) {
    return { isAuthenticated: false, loading: false, error: 'Error al validar la sesión', data: null };
  }

  const isAuthenticated = !!data;

  return { isAuthenticated, loading: false, error: null, data: data || null };
}
