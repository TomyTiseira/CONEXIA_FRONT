'use client';

import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';

export default function AdminLayout({ children }) {
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
            allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]}
            fallbackComponent={<NotFound />}
        >
        {children}
      </ProtectedRoute>
    </Suspense>
  );
}