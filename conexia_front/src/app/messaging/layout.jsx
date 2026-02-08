'use client';

import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';

export default function MessagingLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#eaf5f2]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green mx-auto mb-4"></div>
            <p className="text-conexia-green">Cargando Mensajes...</p>
          </div>
        </div>
      }
    >
      <ProtectedRoute
        allowedRoles={[ROLES.USER]}
        fallbackComponent={<NotFound />}
      >
        {children}
      </ProtectedRoute>
    </Suspense>
  );
}
