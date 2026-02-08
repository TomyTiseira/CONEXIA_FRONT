"use client";
import { useRoleValidation } from "@/hooks";
import { LoadingSpinner, ErrorDisplay, NotFound } from "@/components/ui";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

function ProtectedRouteContent({ 
  children, 
  allowedRoles = [], 
  fallbackComponent = null,
  showPublicContent = true,
  publicContent = null,
  roleBasedContent = null 
}) {
  const [isForceLogout, setIsForceLogout] = useState(false);
  
  // Usar useSearchParams de forma segura
  let searchParams;
  try {
    searchParams = useSearchParams();
    useEffect(() => {
      if (searchParams) {
        setIsForceLogout(searchParams.get('logout') === 'true');
      }
    }, [searchParams]);
  } catch (error) {
    // Si hay error al acceder a searchParams, continuar sin logout forzado
    // Silencioso durante el build para evitar warnings innecesarios
  }
  
  const {
    isAuthenticated,
    isInitialLoading,
    hasError,
    error,
    roleError,
    hasAnyRole,
    role
  } = useRoleValidation();

  // Si hay parámetro logout=true, mostrar spinner de cierre de sesión
  if (isForceLogout) {
    return <LoadingSpinner message="Cerrando sesión..." size="large" />;
  }

  // Estado de carga inicial
  if (isInitialLoading) {
    return <LoadingSpinner message="Verificando autenticación..." />;
  }

  // Error de autenticación o rol
  if (hasError) {
    // Mostrar spinner y redirigir al home
    if (typeof window !== "undefined") {
      window.location.replace("/");
    }
    return <LoadingSpinner message="Cerrando sesión..." size="large" />;
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
}

export const ProtectedRoute = (props) => {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <ProtectedRouteContent {...props} />
    </Suspense>
  );
}; 