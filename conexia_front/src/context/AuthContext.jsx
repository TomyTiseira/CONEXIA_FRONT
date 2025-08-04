'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile, logoutUser } from '@/service/auth/authService';
import { useUserStore } from '@/store/userStore';
import { useRole } from '@/hooks/useRole';

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
  const { setUser: setUserStore, clearUser: clearUserStore, setRoleName } = useUserStore();
  const roleId = user?.roleId || null;
  const { role: roleName } = useRole(roleId);

  const validateSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await getProfile();
      setUser(userData);
      setUserStore(userData, roleName); // Guardar en Zustand con roleName
    } catch (err) {
      setUser(null);
      setError(err.message);
      clearUserStore(); // Limpiar Zustand si falla
    } finally {
      setIsLoading(false);
    }
  }, [setUserStore, clearUserStore, roleName]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setUser(null);
      setError(null);
      clearUserStore(); // Limpiar Zustand al cerrar sesión
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setUser(null);
      setError(null);
      clearUserStore();
    }
  }, [clearUserStore]);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  useEffect(() => {
    if (roleName) setRoleName(roleName);
  }, [roleName, setRoleName]);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    setError(null);
    setUserStore(userData, roleName);
  }, [setUserStore, roleName]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    logout,
    refetch: validateSession,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};