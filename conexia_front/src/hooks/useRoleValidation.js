import { useAuth } from "@/context/AuthContext";
import { useRole } from "./useRole";

export const useRoleValidation = () => {
  const { isAuthenticated, isLoading, error, user } = useAuth();
  const roleId = user?.roleId ?? null;
  const { role, loading: loadingRole, error: roleError } = useRole(roleId);

  // Estados combinados
  const isInitialLoading = isLoading || loadingRole;
  // Solo considerar error si hay un error real y el usuario está autenticado
  const hasError = (error && isAuthenticated) || roleError;

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