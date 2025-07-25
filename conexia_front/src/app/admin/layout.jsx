'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { NotFound } from '@/components/ui';

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute 
          allowedRoles={[ROLES.ADMIN]}
          fallbackComponent={<NotFound />}
      >
      {children}
    </ProtectedRoute>
  );
}