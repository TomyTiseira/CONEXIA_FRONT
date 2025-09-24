'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';

export default function ServicePermissionGuard({ children, redirectTo = '/' }) {
  const router = useRouter();
  const { roleName, loading } = useUserStore();

  useEffect(() => {
    // Solo redirigir si ya se cargó el rol y no es USER
    if (!loading && roleName && roleName !== ROLES.USER) {
      router.push(redirectTo);
    }
  }, [roleName, loading, router, redirectTo]);

  // Mostrar loading mientras se verifica
  if (loading || !roleName) {
    return (
      <div className="min-h-screen bg-[#f0f8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // No renderizar si no es USER
  if (roleName !== ROLES.USER) {
    return null;
  }

  return children;
}