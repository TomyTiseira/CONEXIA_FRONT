import { useRoleValidation } from "@/hooks";
import { LoadingSpinner, ErrorDisplay, NotFound } from "@/components/ui";

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

  console.log('ProtectedRoute Debug:', {
    isAuthenticated,
    isInitialLoading,
    hasError,
    role,
    allowedRoles,
    hasAnyRole: allowedRoles.length > 0 ? hasAnyRole(allowedRoles) : 'N/A',
    fallbackComponent: !!fallbackComponent
  });

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
    console.log('ProtectedRoute: Usuario no autenticado, retornando fallback o null');
    if (fallbackComponent) {
      console.log('ProtectedRoute: Retornando fallbackComponent');
      return fallbackComponent;
    }
    if (showPublicContent && publicContent) {
      console.log('ProtectedRoute: Retornando publicContent');
      return publicContent;
    }
    console.log('ProtectedRoute: Retornando null');
    return null;
  }

  // Si se especificaron roles permitidos, verificar que el usuario tenga uno de ellos
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    if (fallbackComponent) {
      return fallbackComponent;
    }
    return (
      <NotFound 
        title="Página no encontrada"
        message="La página que buscas no existe o no tienes permisos para acceder a ella."
        showBackButton={true}
        showHomeButton={true}
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