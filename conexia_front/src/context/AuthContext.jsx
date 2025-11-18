'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useMessagingStore } from '@/store/messagingStore';
import { getProfile, getProfileSimple, logoutUser } from '@/service/auth/authService';
import { setLoggingOut } from '@/service/auth/fetchWithRefresh';
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
  const isLoggingOut = useRef(false);
  const { setUser: setUserStore, setProfile: setProfileStore, clearUser: clearUserStore, setRoleName } = useUserStore();
  const roleId = user?.roleId || null;
  const { role: roleName, loading: roleLoading } = useRole(roleId);

  const validateSession = useCallback(async () => {
    // No validar sesión si estamos en proceso de logout
    if (isLoggingOut.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      // Usar getProfileSimple para validación inicial - NO intenta refresh en 401
      const userData = await getProfileSimple();
  setUser(userData);
  // Siempre setear usuario y rol en el store, aunque no haya perfil extendido
  setUserStore(userData, roleName);
  setRoleName(roleName);
      // Esperar a que el rol esté definido antes de buscar perfil extendido
      if (roleLoading || !roleName) {
        return;
      }

      // Obtener perfil extendido solo si hay id y no es admin/moderador
      if (userData?.id) {
        // Verificar si es admin o moderador usando tanto userData.role como roleName (y variantes en español)
        const userRole = userData?.role?.toLowerCase() || '';
        const currentRoleName = roleName?.toLowerCase() || '';
        const adminVariants = ['admin', 'administrador'];
        const moderatorVariants = ['moderator', 'moderador'];
        const isAdminOrModerator = adminVariants.includes(userRole) || moderatorVariants.includes(userRole) ||
                                  adminVariants.includes(currentRoleName) || moderatorVariants.includes(currentRoleName);
        if (isAdminOrModerator) {
          // Para admin/moderador, no buscar perfil extendido, pero NO limpiar el usuario/rol del store
          setProfileStore(null);
          return;
        }
        try {
          const profileRes = await getProfileById(userData.id);
          setProfileStore(profileRes.data.profile);
        } catch (e) {
          setProfileStore(null);
        }
      } else {
        setProfileStore(null);
      }
    } catch (err) {
  setUser(null);
  setError(err.message);
  clearUserStore(); // Limpiar Zustand solo si hay error real
  setProfileStore(null); // Limpiar solo perfil extendido
      // Limpieza adicional: UI de mensajería persistida y estado del store
      try {
        if (typeof window !== 'undefined') {
          Object.keys(window.localStorage || {}).forEach((k) => {
            if (k.startsWith('conexia:messaging:')) window.localStorage.removeItem(k);
          });
        }
      } catch {}
      try { useMessagingStore.getState().disconnect(); } catch {}
    } finally {
      setIsLoading(false);
    }
  }, [setUserStore, setProfileStore, clearUserStore, roleName, roleLoading]);

  const logout = useCallback(async () => {
    // Marcar que estamos cerrando sesión para evitar validaciones y refresh
    isLoggingOut.current = true;
    setLoggingOut(true);
    // Variable global para que el home detecte el estado
    if (typeof window !== 'undefined') {
      window.__CONEXIA_LOGGING_OUT__ = true;
    }
    
    try {
      // Primero limpiar el estado local para evitar solicitudes subsecuentes
      setUser(null);
      setError(null);
      setIsLoading(false);
      clearUserStore();
      
      // Limpiar persistencia de mensajería
      try {
        if (typeof window !== 'undefined') {
          Object.keys(window.localStorage || {}).forEach((k) => {
            if (k.startsWith('conexia:messaging:')) window.localStorage.removeItem(k);
          });
        }
      } catch {}
      
      // Desconectar sockets
      try { 
        useMessagingStore.getState().disconnect(); 
      } catch {}
      
      // Luego hacer la llamada al backend
      await logoutUser();
      
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      // Aunque falle el logout en el backend, asegurar que el frontend esté limpio
      setUser(null);
      setError(null);
      setIsLoading(false);
      clearUserStore();
      
      try {
        if (typeof window !== 'undefined') {
          Object.keys(window.localStorage || {}).forEach((k) => {
            if (k.startsWith('conexia:messaging:')) window.localStorage.removeItem(k);
          });
        }
      } catch {}
      
      try { 
        useMessagingStore.getState().disconnect(); 
      } catch {}
    } finally {
      // Resetear el flag y redirigir al home inmediatamente
      isLoggingOut.current = false;
      setLoggingOut(false);
      if (typeof window !== 'undefined') {
        window.__CONEXIA_LOGGING_OUT__ = false;
        window.location.replace('/');
      }
    }
  }, [clearUserStore]);

  useEffect(() => {
    // Solo validar sesión cuando el rol esté definido y no estemos cerrando sesión
    if (roleLoading || isLoggingOut.current) return;
    validateSession();
  }, [validateSession, roleLoading]);

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