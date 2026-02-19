'use client';

import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function MessagingLayout({ children }) {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando mensajes" />}>
      <ProtectedRoute
        allowedRoles={[ROLES.USER]}
        fallbackComponent={<NotFound />}
      >
        {children}
      </ProtectedRoute>
    </Suspense>
  );
}
