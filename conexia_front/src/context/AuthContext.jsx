'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile, logoutUser } from '@/service/auth/authService';
import { getProfileById } from '@/service/profiles/profilesFetch';
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
  const { setUser: setUserStore, setProfile: setProfileStore, clearUser: clearUserStore, setRoleName } = useUserStore();
  const roleId = user?.roleId || null;
  const { role: roleName } = useRole(roleId);

  const validateSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await getProfile();
      setUser(userData);
      setUserStore(userData, roleName); // Guardar en Zustand con roleName
      
      // Obtener perfil extendido solo si hay id y no es admin/moderator
      if (userData?.id) {
        // Verificar si es admin o moderator usando tanto userData.role como roleName
        const userRole = userData?.role?.toLowerCase() || '';
        const currentRoleName = roleName?.toLowerCase() || '';
        const isAdminOrModerator = ['admin', 'moderator'].includes(userRole) || 
                                  ['admin', 'moderator'].includes(currentRoleName);
        
        if (!isAdminOrModerator) {
          try {
            const profileRes = await getProfileById(userData.id);
            setProfileStore(profileRes.data.profile);
          } catch (e) {
            setProfileStore(null);
          }
        } else {
          // Para admin/moderator, no buscar perfil extendido
          setProfileStore(null);
        }
      } else {
        setProfileStore(null);
      }
    } catch (err) {
      setUser(null);
      setError(err.message);
      clearUserStore(); // Limpiar Zustand si falla
    } finally {
      setIsLoading(false);
    }
  }, [setUserStore, setProfileStore, clearUserStore, roleName]);

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