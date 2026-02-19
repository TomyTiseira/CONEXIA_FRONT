'use client';

import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ProjectLayout({ children }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#eaf5f2]">
        <LoadingSpinner message="Cargando..." fullScreen={true} showSubtext={false} />
      </div>
    }>
      <ProtectedRoute 
        allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]}
        fallbackComponent={<NotFound />}
      >
        {children}
      </ProtectedRoute>
    </Suspense>
  );
}