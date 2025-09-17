'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile, logoutUser } from '@/service/auth/authService';
import { getProfileById } from '@/service/profiles/profilesFetch';
import { useUserStore } from '@/store/userStore';
import { useRole } from '@/hooks/useRole';
import { ROLES } from '@/constants/roles';

// Helper function para mapear roleId a role name
const getRoleNameByRoleId = (roleId) => {
  switch (roleId) {
    case 1:
      return ROLES.ADMIN;
    case 3:
      return ROLES.MODERATOR;
    case 2:
      return ROLES.USER;
    default:
      return null;
  }
};

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
      
      // Agregar el roleName al objeto userData usando roleId como fallback
      const roleFromId = getRoleNameByRoleId(userData?.roleId);
      const userWithRole = {
        ...userData,
        role: roleName || roleFromId
      };
      
      setUser(userWithRole);
      setUserStore(userWithRole, roleName || roleFromId); // Guardar en Zustand con roleName
      
      // Obtener perfil extendido solo si hay id y no es admin/moderator
      if (userWithRole?.id) {
        // Verificar si es admin o moderator
        const userRole = userWithRole?.role?.toLowerCase() || '';
        const isAdminOrModerator = [ROLES.ADMIN, ROLES.MODERATOR].includes(userRole);
        
        if (!isAdminOrModerator) {
          try {
            const profileRes = await getProfileById(userWithRole.id);
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
    const roleFromId = getRoleNameByRoleId(userData?.roleId);
    const userWithRole = {
      ...userData,
      role: roleName || roleFromId
    };
    setUser(userWithRole);
    setError(null);
    setUserStore(userWithRole, roleName || roleFromId);
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