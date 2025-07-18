import { useRoleValidation } from "@/hooks";
import { LoadingSpinner, ErrorDisplay } from "@/components/ui";

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  fallbackComponent = null,
  showPublicContent = true,
  publicContent = null,
  roleBasedContent = null // Nuevo prop para contenido específico por rol
}) => {
  const {
    isAuthenticated,
    isInitialLoading,
    hasError,
    error,
    roleError,
    hasAnyRole,
    role
  } = useRoleValidation();

  // Estado de carga inicial
  if (isInitialLoading) {
    return <LoadingSpinner message="Verificando autenticación..." />;
  }

  // Error de autenticación o rol
  if (hasError) {
    return (
      <ErrorDisplay 
        error={error || roleError}
        message="Error de autenticación"
        showRetry={true}
        redirectTo="/login"
      />
    );
  }

  // Usuario no autenticado
  if (!isAuthenticated) {
    if (showPublicContent && publicContent) {
      return publicContent;
    }
    return null;
  }

  // Si se especificaron roles permitidos, verificar que el usuario tenga uno de ellos
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    if (fallbackComponent) {
      return fallbackComponent;
    }
    return (
      <ErrorDisplay 
        message="No tienes permisos para acceder a esta página"
        redirectTo="/login"
      />
    );
  }

  // Si se proporcionó contenido específico por rol, usarlo
  if (roleBasedContent && roleBasedContent[role]) {
    return roleBasedContent[role];
  }

  // Usuario autenticado y con permisos (o sin restricciones de rol)
  return children;
}; 