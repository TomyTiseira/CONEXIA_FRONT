import { useAuth } from "@/context/AuthContext";
import { useRole } from "./useRole";

export const useRoleValidation = () => {
  const { isAuthenticated, isLoading, error, user } = useAuth();
  const roleId = user?.roleId ?? null;
  const { role, loading: loadingRole, error: roleError } = useRole(roleId);

  // Estados combinados
  const isInitialLoading = isLoading || loadingRole;
  const hasError = error || roleError;

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (expectedRole) => {
    if (!isAuthenticated || hasError || isInitialLoading) return false;
    return role === expectedRole;
  };

  // Función para verificar si el usuario tiene cualquiera de los roles especificados
  const hasAnyRole = (expectedRoles) => {
    if (!isAuthenticated || hasError || isInitialLoading) return false;
    return expectedRoles.includes(role);
  };

  return {
    // Estados
    isAuthenticated,
    isInitialLoading,
    hasError,
    error,
    roleError,
    
    // Datos del usuario
    user,
    role,
    
    // Funciones de validación
    hasRole,
    hasAnyRole,
    
    // Estados individuales (por si los necesitas)
    isLoading,
    loadingRole
  };
}; 