import { useRoleValidation } from "@/hooks";
import { LoadingSpinner, ErrorDisplay, NotFound } from "@/components/ui";
import { useSearchParams } from "next/navigation";

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  fallbackComponent = null,
  showPublicContent = true,
  publicContent = null,
  roleBasedContent = null // Nuevo prop para contenido específico por rol
}) => {
  const searchParams = useSearchParams();
  const isForceLogout = searchParams.get('logout') === 'true';
  
  const {
    isAuthenticated,
    isInitialLoading,
    hasError,
    error,
    roleError,
    hasAnyRole,
    role
  } = useRoleValidation();

  // Si hay parámetro logout=true, forzar contenido público independientemente del estado de autenticación
  if (isForceLogout && publicContent) {
    return publicContent;
  }

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
    if (fallbackComponent) {
      return fallbackComponent;
    }
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