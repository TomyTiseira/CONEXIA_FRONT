'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile, logoutUser } from '@/service/auth/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const validateSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await getProfile();
      setUser(userData);
    } catch (err) {
      setUser(null);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      // Aún así, limpiar el estado local
      setUser(null);
      setError(null);
    }
  }, []);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    logout,
    refetch: validateSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 