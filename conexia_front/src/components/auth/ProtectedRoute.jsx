import { useRoleValidation } from "@/hooks";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { NavbarHome } from "@/components/NavbarHome";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  fallbackComponent = null,
  showPublicContent = true 
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
    if (showPublicContent) {
      return (
        <>
          <NavbarHome />
          <Hero />
          <Footer />
        </>
      );
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
        redirectTo="/"
      />
    );
  }

  // Usuario autenticado y con permisos (o sin restricciones de rol)
  return children;
}; 