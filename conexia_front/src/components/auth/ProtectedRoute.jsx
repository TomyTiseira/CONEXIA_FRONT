import { useRoleValidation } from "@/hooks";
import { LoadingSpinner, ErrorDisplay } from "@/components/ui";

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  fallbackComponent = null,
  showPublicContent = true,
  publicContent = null
}) => {
  const {
    isAuthenticated,
    isInitialLoading,
    hasError,
    error,
    roleError,
    hasAnyRole
  } = useRoleValidation();

  // Estado de carga inicial
  if (isInitialLoading) {
    return <LoadingSpinner message="Verificando autenticación..." />;
  }

  // Usuario no autenticado
  if (!isAuthenticated) {
    if (showPublicContent && publicContent) {
      return publicContent;
    }
    return null;
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

  // Usuario autenticado y con permisos (o sin restricciones de rol)
  return children;
}; 