'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';
import NavbarAdmin from '@/components/navbar/NavbarAdmin';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  
  // Determinar si la ruta es solo para administradores
  const isAdminOnly = pathname?.startsWith('/admin/plans');
  const allowedRoles = isAdminOnly ? [ROLES.ADMIN] : [ROLES.ADMIN, ROLES.MODERATOR];

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#eaf5f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green mx-auto mb-4"></div>
          <p className="text-conexia-green">Cargando panel administrativo...</p>
        </div>
      </div>
    }>
      <ProtectedRoute 
        allowedRoles={allowedRoles}
        fallbackComponent={<NotFound />}
      >
        {children}
      </ProtectedRoute>
    </Suspense>
  );
}